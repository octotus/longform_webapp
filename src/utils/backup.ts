const IMG_PREFIX = 'likhitu-img-';

export interface BackupSlot {
  timestamp: number;
  db: string;
  settings: string;
  images: Record<string, string>; // id → data URL
}

const BACKUP_KEY = 'likhitu-backups';
const MAX_SLOTS = 3;

function collectImages(): Record<string, string> {
  const images: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(IMG_PREFIX)) {
      images[key.slice(IMG_PREFIX.length)] = localStorage.getItem(key) ?? '';
    }
  }
  return images;
}

function restoreImages(images: Record<string, string>): void {
  for (const [id, dataUrl] of Object.entries(images)) {
    try { localStorage.setItem(IMG_PREFIX + id, dataUrl); } catch { /* quota */ }
  }
}

export function saveBackupSlot(): void {
  const db = localStorage.getItem('likhitu_db') ?? '';
  const settings = localStorage.getItem('likhitu-settings') ?? '';
  const images = collectImages();
  const slot: BackupSlot = { timestamp: Date.now(), db, settings, images };
  const existing = getBackupSlots();
  const updated = [slot, ...existing].slice(0, MAX_SLOTS);
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(updated));
  } catch {
    // localStorage quota exceeded — store only newest without images
    try { localStorage.setItem(BACKUP_KEY, JSON.stringify([{ ...slot, images: {} }])); } catch { /* ignore */ }
  }
}

export function getBackupSlots(): BackupSlot[] {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    return raw ? (JSON.parse(raw) as BackupSlot[]) : [];
  } catch {
    return [];
  }
}

export function clearBackupSlots(): void {
  localStorage.removeItem(BACKUP_KEY);
}

export function downloadBackupSlot(slot: BackupSlot): void {
  const payload = btoa(JSON.stringify({ db: slot.db, settings: slot.settings, images: slot.images ?? {}, exportedAt: slot.timestamp }));
  const blob = new Blob([payload], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `likhitu-backup-${new Date(slot.timestamp).toISOString().slice(0, 16).replace('T', '_')}.likhitu`;
  a.click();
  URL.revokeObjectURL(url);
}

export function restoreFromPayload(raw: string): void {
  const payload = JSON.parse(atob(raw));
  if (!payload.db || typeof payload.db !== 'string') throw new Error('Invalid backup file');
  localStorage.setItem('likhitu_db', payload.db);
  if (payload.settings) localStorage.setItem('likhitu-settings', payload.settings);
  if (payload.images && typeof payload.images === 'object') restoreImages(payload.images);
}
