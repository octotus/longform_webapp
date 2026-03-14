// @ts-ignore – sql.js ships CJS; Vite pre-bundles it and exposes .default
import SqlJsInit from 'sql.js';
import type { Database, SqlJsStatic } from 'sql.js';
const initSqlJs: (config?: object) => Promise<SqlJsStatic> = (SqlJsInit as any).default ?? SqlJsInit;
import { DDL } from './schema';
import { builtInStyles } from '../core/citation/builtInStyles';
import { GLOBAL_ARTICLE_ID } from '../types';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (_file: string) => `/sql-wasm-browser.wasm`
  });

  // Try to load from localStorage
  const saved = localStorage.getItem('longform_db');
  if (saved) {
    const buf = Uint8Array.from(atob(saved), c => c.charCodeAt(0));
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  // Create schema
  db.run(DDL);

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
  const base64 = btoa(String.fromCharCode(...data));
  localStorage.setItem('longform_db', base64);
}

export function exportDb(): Uint8Array {
  if (!db) throw new Error('DB not initialized');
  return db.export();
}
