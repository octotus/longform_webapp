import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import { DDL } from './schema';
import { builtInStyles } from '../core/citation/builtInStyles';
import { GLOBAL_ARTICLE_ID } from '../types';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`
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
