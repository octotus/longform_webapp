// @ts-ignore – sql.js ships CJS; Vite pre-bundles it and exposes .default
import SqlJsInit from 'sql.js';
import type { Database, SqlJsStatic } from 'sql.js';
const initSqlJs: (config?: object) => Promise<SqlJsStatic> = (SqlJsInit as any).default ?? SqlJsInit;
import { DDL } from './schema';
import { builtInStyles } from '../core/citation/builtInStyles';
import { GLOBAL_ARTICLE_ID } from '../types';

let db: Database | null = null;

/** One-time migration: rename all longform-* localStorage keys to likhitu-* */
function migrateStorageKeys() {
  const pairs: [string, string][] = [
    ['longform_db',       'likhitu_db'],
    ['longform-settings', 'likhitu-settings'],
    ['longform-backups',  'likhitu-backups'],
  ];
  for (const [oldKey, newKey] of pairs) {
    if (!localStorage.getItem(newKey)) {
      const val = localStorage.getItem(oldKey);
      if (val) { localStorage.setItem(newKey, val); }
    }
    localStorage.removeItem(oldKey);
  }
  // Migrate longform-img-* keys
  const imgKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith('longform-img-')) imgKeys.push(k);
  }
  for (const key of imgKeys) {
    const newKey = 'likhitu-img-' + key.slice('longform-img-'.length);
    if (!localStorage.getItem(newKey)) localStorage.setItem(newKey, localStorage.getItem(key)!);
    localStorage.removeItem(key);
  }
}

export async function getDb(): Promise<Database> {
  if (db) return db;

  migrateStorageKeys();

  const SQL = await initSqlJs({
    locateFile: (_file: string) => `/sql-wasm-browser.wasm`
  });

  // Try to load from localStorage
  const saved = localStorage.getItem('likhitu_db');
  if (saved) {
    const buf = Uint8Array.from(atob(saved), c => c.charCodeAt(0));
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  // Create schema
  db.run(DDL);

  // Migrations for existing DBs
  try { db.run("ALTER TABLE corpus_documents ADD COLUMN tags TEXT NOT NULL DEFAULT ''"); } catch {}
  try { db.run(`ALTER TABLE "references" ADD COLUMN tags TEXT NOT NULL DEFAULT ''`); } catch {}

  // Seed built-in citation styles
  for (const style of builtInStyles) {
    db.run(
      `INSERT OR IGNORE INTO citation_styles (id, name, isBuiltIn, schemaJson, createdAt) VALUES (?,?,?,?,?)`,
      [style.id, style.name, 1, JSON.stringify(style), Date.now()]
    );
  }

  // Seed global article
  db.run(
    `INSERT OR IGNORE INTO articles (id, title, contentMd, createdAt, updatedAt, wordCount, citationStyleId)
     VALUES (?,?,?,?,?,?,?)`,
    [GLOBAL_ARTICLE_ID, 'Global References', '', Date.now(), Date.now(), 0, 'nature']
  );

  persist();
  return db;
}

export function persist() {
  if (!db) return;
  const data = db.export();
  let binary = '';
  for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i]);
  localStorage.setItem('likhitu_db', btoa(binary));
}

export function exportDb(): Uint8Array {
  if (!db) throw new Error('DB not initialized');
  return db.export();
}
