import { create } from 'zustand';
import type { ArticleReference, CitationStyleConfig } from '../types';
import { GLOBAL_ARTICLE_ID } from '../types';
import { getDb } from '../db/db';
import * as repo from '../db/repos/referenceRepo';
import * as styleRepo from '../db/repos/citationStyleRepo';
import * as articleRepo from '../db/repos/articleRepo';
import { exportBibtex } from '../core/citation/citationRenderer';
import { v4 as uuid } from '../utils/uuid';

interface RefState {
  articleId: string;
  references: ArticleReference[];
  citationStyle: CitationStyleConfig | null;
  articleTitles: Record<string, string>;
  doiQuery: string;
  doiLoading: boolean;
  error: string | null;
  load: (articleId: string) => Promise<void>;
  setDoiQuery: (q: string) => void;
  importFromDoi: () => Promise<void>;
  addBlank: () => Promise<void>;
  updateRef: (ref: ArticleReference) => Promise<void>;
  deleteRef: (id: string) => Promise<void>;
  getBibtex: () => string;
}

export const useReferenceStore = create<RefState>((set, get) => ({
  articleId: '',
  references: [],
  citationStyle: null,
  articleTitles: {},
  doiQuery: '',
  doiLoading: false,
  error: null,

  load: async (articleId) => {
    const db = await getDb();
    const refs = repo.getRefsForArticle(db, articleId);
    const article = articleRepo.getArticleById(db, articleId);
    const styleEntity = article ? styleRepo.getStyleById(db, article.citationStyleId) : null;
    const citationStyle = styleEntity ? JSON.parse(styleEntity.schemaJson) as CitationStyleConfig : null;

    let articleTitles: Record<string, string> = {};
    if (articleId === GLOBAL_ARTICLE_ID) {
      const allArticles = articleRepo.getAllArticles(db);
      for (const a of allArticles) {
        articleTitles[a.id] = a.title;
      }
    }

    set({ articleId, references: refs, citationStyle, articleTitles, error: null });
  },

  setDoiQuery: (doiQuery) => set({ doiQuery }),

  importFromDoi: async () => {
    const { doiQuery, articleId } = get();
    const doi = doiQuery.trim().replace(/^https?:\/\/doi\.org\//, '');
    if (!doi) return;
    set({ doiLoading: true, error: null });
    try {
      const db = await getDb();
      const existing = repo.findByDoi(db, doi);
      if (existing) { set({ error: `Already exists: "${existing.title || doi}" (${existing.shortcode})`, doiLoading: false, doiQuery: '' }); return; }
      const res = await fetch(`https://api.crossref.org/works/${doi}`, { headers: { Accept: 'application/json', 'User-Agent': 'Longform/1.0' } });
      if (!res.ok) { set({ error: `DOI not found (${res.status})`, doiLoading: false }); return; }
      const data = await res.json();
      const msg = data.message ?? {};
      const title = msg.title?.[0] ?? '';
      const authors = (msg.author ?? []).map((a: any) => {
        const init = a.given ? `${a.given[0]}` : '';
        return init ? `${a.family}, ${init}` : a.family;
      }).join('; ');
      const year = String(msg.published?.['date-parts']?.[0]?.[0] ?? '');
      const journal = msg['container-title']?.[0] ?? '';
      const volume = msg.volume ?? '';
      const pages = msg.page ?? '';
      const max = repo.maxSortOrder(db, articleId);
      const firstFamily = msg.author?.[0]?.family ?? '';
      const shortcode = firstFamily && year
        ? `${firstFamily.toLowerCase().replace(/[^a-z]/g, '')}${year}`
        : `ref${max + 1}`;
      repo.upsertRef(db, { id: uuid(), articleId, shortcode, doi, url: '', title, authors, year, journal, volume, issue: '', pages, bibtex: '', sortOrder: Date.now(), tags: [] });
      set({ doiQuery: '' });
      await get().load(articleId);
    } catch (e: any) {
      set({ error: `DOI import failed: ${e.message}` });
    } finally {
      set({ doiLoading: false });
    }
  },

  addBlank: async () => {
    const { articleId } = get();
    const db = await getDb();
    const max = repo.maxSortOrder(db, articleId);
    repo.upsertRef(db, { id: uuid(), articleId, shortcode: `ref${max + 1}`, doi: '', url: '', title: '', authors: '', year: '', journal: '', volume: '', issue: '', pages: '', bibtex: '', sortOrder: Date.now(), tags: [] });
    await get().load(articleId);
  },

  updateRef: async (ref) => {
    const db = await getDb();
    repo.upsertRef(db, ref);
    await get().load(get().articleId);
  },

  deleteRef: async (id) => {
    const db = await getDb();
    repo.deleteRef(db, id);
    await get().load(get().articleId);
  },

  getBibtex: () => exportBibtex(get().references),
}));
