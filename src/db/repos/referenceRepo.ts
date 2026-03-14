import type { Database } from 'sql.js';
import { persist } from '../db';
import type { ArticleReference } from '../../types';
import { GLOBAL_ARTICLE_ID } from '../../types';

function rowToRef(row: any[]): ArticleReference {
  return {
    id: row[0] as string,
    articleId: row[1] as string,
    shortcode: row[2] as string,
    doi: row[3] as string,
    url: row[4] as string,
    title: row[5] as string,
    authors: row[6] as string,
    year: row[7] as string,
    journal: row[8] as string,
    volume: row[9] as string,
    issue: row[10] as string,
    pages: row[11] as string,
    bibtex: row[12] as string,
    sortOrder: row[13] as number,
    tags: (row[14] as string || '').split(',').map(t => t.trim()).filter(Boolean),
  };
}

const COLS = 'id,articleId,shortcode,doi,url,title,authors,year,journal,volume,issue,pages,bibtex,sortOrder,tags';

export function getRefsForArticle(db: Database, articleId: string): ArticleReference[] {
  const q = articleId === GLOBAL_ARTICLE_ID
    ? `SELECT ${COLS} FROM "references" ORDER BY sortOrder DESC`
    : `SELECT ${COLS} FROM "references" WHERE articleId=? ORDER BY sortOrder DESC`;
  const params = articleId === GLOBAL_ARTICLE_ID ? [] : [articleId];
  const result = db.exec(q, params);
  if (!result.length) return [];
  return result[0].values.map(rowToRef);
}

export function getAllRefs(db: Database): ArticleReference[] {
  const result = db.exec(`SELECT ${COLS} FROM "references" ORDER BY sortOrder DESC`);
  if (!result.length) return [];
  return result[0].values.map(rowToRef);
}

export function upsertRef(db: Database, ref: ArticleReference): void {
  db.run(
    `INSERT OR REPLACE INTO "references" (id,articleId,shortcode,doi,url,title,authors,year,journal,volume,issue,pages,bibtex,sortOrder,tags) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [ref.id, ref.articleId, ref.shortcode, ref.doi, ref.url, ref.title, ref.authors, ref.year, ref.journal, ref.volume, ref.issue, ref.pages, ref.bibtex, ref.sortOrder, (ref.tags || []).join(',')]
  );
  persist();
}

export function deleteRef(db: Database, id: string): void {
  db.run('DELETE FROM "references" WHERE id=?', [id]);
  persist();
}

export function findByDoi(db: Database, doi: string): ArticleReference | null {
  const result = db.exec(`SELECT ${COLS} FROM "references" WHERE doi=? LIMIT 1`, [doi]);
  if (!result.length || !result[0].values.length) return null;
  return rowToRef(result[0].values[0]);
}

export function maxSortOrder(db: Database, _articleId?: string): number {
  const result = db.exec('SELECT MAX(sortOrder) FROM "references"');
  if (!result.length || !result[0].values.length) return 0;
  return (result[0].values[0][0] as number) ?? 0;
}
