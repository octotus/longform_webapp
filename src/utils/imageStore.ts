const PREFIX = 'longform-img-';
const SCHEME = 'longform-img://';

export function storeImage(dataUrl: string): string {
  const id = crypto.randomUUID();
  try {
    localStorage.setItem(PREFIX + id, dataUrl);
  } catch {
    // localStorage full — silently ignore; image won't persist after reload
  }
  return id;
}

export function resolveImageUrl(url: string): string {
  if (!url.startsWith(SCHEME)) return url;
  const id = url.slice(SCHEME.length);
  return localStorage.getItem(PREFIX + id) ?? '';
}

export function isImageRef(url: string): boolean {
  return url.startsWith(SCHEME);
}

export function makeImageRef(id: string): string {
  return SCHEME + id;
}
