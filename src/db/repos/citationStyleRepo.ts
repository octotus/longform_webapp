import type { Database } from 'sql.js';
import type { CitationStyleEntity } from '../../types';

function rowToEntity(row: any[]): CitationStyleEntity {
  return { id: row[0], name: row[1], isBuiltIn: row[2], schemaJson: row[3], createdAt: row[4] };
}

export function getStyleById(db: Database, id: string): CitationStyleEntity | null {
  const result = db.exec('SELECT id,name,isBuiltIn,schemaJson,createdAt FROM citation_styles WHERE id=?', [id]);
  if (!result.length || !result[0].values.length) return null;
  return rowToEntity(result[0].values[0]);
}

export function getAllStyles(db: Database): CitationStyleEntity[] {
  const result = db.exec('SELECT id,name,isBuiltIn,schemaJson,createdAt FROM citation_styles');
  if (!result.length) return [];
  return result[0].values.map(rowToEntity);
}
