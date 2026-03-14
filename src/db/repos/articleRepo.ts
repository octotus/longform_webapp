import type { Database } from 'sql.js';
import { persist } from '../db';
import type { Article } from '../../types';

function rowToArticle(row: any[]): Article {
  return {
    id: row[0] as string,
    title: row[1] as string,
    contentMd: row[2] as string,
    createdAt: row[3] as number,
    updatedAt: row[4] as number,
    wordCount: row[5] as number,
    citationStyleId: row[6] as string,
  };
}

export function getAllArticles(db: Database): Article[] {
  const result = db.exec('SELECT id,title,contentMd,createdAt,updatedAt,wordCount,citationStyleId FROM articles ORDER BY updatedAt DESC');
  if (!result.length) return [];
  return result[0].values.map(rowToArticle);
}

export function searchArticles(db: Database, q: string): Article[] {
  const result = db.exec(
    `SELECT id,title,contentMd,createdAt,updatedAt,wordCount,citationStyleId FROM articles WHERE title LIKE ? OR contentMd LIKE ? ORDER BY updatedAt DESC`,
    [`%${q}%`, `%${q}%`]
  );
  if (!result.length) return [];
  return result[0].values.map(rowToArticle);
}

export function getArticleById(db: Database, id: string): Article | null {
  const result = db.exec(
    'SELECT id,title,contentMd,createdAt,updatedAt,wordCount,citationStyleId FROM articles WHERE id=?',
    [id]
  );
  if (!result.length || !result[0].values.length) return null;
  return rowToArticle(result[0].values[0]);
}

export function upsertArticle(db: Database, article: Article): void {
  db.run(
    `INSERT OR REPLACE INTO articles (id,title,contentMd,createdAt,updatedAt,wordCount,citationStyleId) VALUES (?,?,?,?,?,?,?)`,
    [article.id, article.title, article.contentMd, article.createdAt, article.updatedAt, article.wordCount, article.citationStyleId]
  );
  persist();
}

export function deleteArticle(db: Database, id: string): void {
  db.run('DELETE FROM articles WHERE id=?', [id]);
  persist();
}

export function getRefCountsByArticle(db: Database): Record<string, number> {
  const result = db.exec('SELECT articleId, COUNT(*) FROM "references" GROUP BY articleId');
  if (!result.length) return {};
  const counts: Record<string, number> = {};
  for (const row of result[0].values) {
    counts[row[0] as string] = row[1] as number;
  }
  return counts;
}
