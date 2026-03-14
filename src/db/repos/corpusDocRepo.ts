import type { Database } from 'sql.js';
import { persist } from '../db';
import type { CorpusDocument } from '../../types';

function rowToDoc(row: any[]): CorpusDocument {
  return {
    id: row[0] as string,
    title: row[1] as string,
    sourceUrl: row[2] as string,
    contentText: row[3] as string,
    embedding: row[4] ? new Uint8Array(row[4] as ArrayBuffer) : null,
    addedAt: row[5] as number,
    wordCount: row[6] as number,
    tags: (row[7] as string || '').split(',').map(t => t.trim()).filter(Boolean),
  };
}

export function getAllDocs(db: Database): CorpusDocument[] {
  const result = db.exec('SELECT id,title,sourceUrl,contentText,embedding,addedAt,wordCount,tags FROM corpus_documents ORDER BY addedAt DESC');
  if (!result.length) return [];
  return result[0].values.map(rowToDoc);
}

export function upsertDoc(db: Database, doc: CorpusDocument): void {
  db.run(
    `INSERT OR REPLACE INTO corpus_documents (id,title,sourceUrl,contentText,embedding,addedAt,wordCount,tags) VALUES (?,?,?,?,?,?,?,?)`,
    [doc.id, doc.title, doc.sourceUrl, doc.contentText, doc.embedding, doc.addedAt, doc.wordCount, doc.tags.join(',')]
  );
  persist();
}

export function deleteDoc(db: Database, id: string): void {
  db.run('DELETE FROM corpus_documents WHERE id=?', [id]);
  persist();
}

export function docExistsByTitle(db: Database, title: string): boolean {
  const result = db.exec('SELECT 1 FROM corpus_documents WHERE title=? LIMIT 1', [title]);
  return result.length > 0 && result[0].values.length > 0;
}

export function getDocsWithEmbeddings(db: Database): CorpusDocument[] {
  const result = db.exec('SELECT id,title,sourceUrl,contentText,embedding,addedAt,wordCount,tags FROM corpus_documents WHERE embedding IS NOT NULL');
  if (!result.length) return [];
  return result[0].values.map(rowToDoc);
}
