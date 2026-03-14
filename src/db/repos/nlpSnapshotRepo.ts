import type { Database } from 'sql.js';
import { persist } from '../db';
import type { NlpSnapshot } from '../../types';

export function insertSnapshot(db: Database, snap: NlpSnapshot): void {
  db.run(
    `INSERT OR REPLACE INTO nlp_snapshots (id,articleId,timestamp,readabilityScore,passivePct,hedgePct,wordCount) VALUES (?,?,?,?,?,?,?)`,
    [snap.id, snap.articleId, snap.timestamp, snap.readabilityScore, snap.passivePct, snap.hedgePct, snap.wordCount]
  );
  persist();
}
