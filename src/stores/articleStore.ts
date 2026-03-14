import { create } from 'zustand';
import type { Article, SortBy } from '../types';
import { GLOBAL_ARTICLE_ID } from '../types';
import { getDb } from '../db/db';
import * as repo from '../db/repos/articleRepo';
import { v4 as uuid } from '../utils/uuid';

interface ArticleState {
  articles: Article[];
  refCounts: Record<string, number>;
  query: string;
  sortBy: SortBy;
  loading: boolean;
  load: () => Promise<void>;
  search: (q: string) => Promise<void>;
  setSort: (s: SortBy) => void;
  createArticle: (title: string) => Promise<string>;
  deleteArticle: (id: string) => Promise<void>;
}

function sortArticles(articles: Article[], sortBy: SortBy): Article[] {
  const filtered = articles.filter(a => a.id !== GLOBAL_ARTICLE_ID);
  switch (sortBy) {
    case 'DATE_MODIFIED': return [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);
    case 'DATE_CREATED': return [...filtered].sort((a, b) => b.createdAt - a.createdAt);
    case 'WORD_COUNT': return [...filtered].sort((a, b) => b.wordCount - a.wordCount);
    case 'TITLE': return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  }
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  articles: [],
  refCounts: {},
  query: '',
  sortBy: 'DATE_MODIFIED',
  loading: false,

  load: async () => {
    set({ loading: true });
    const db = await getDb();
    const { query, sortBy } = get();
    const raw = query ? repo.searchArticles(db, query) : repo.getAllArticles(db);
    const refCounts = repo.getRefCountsByArticle(db);
    set({ articles: sortArticles(raw, sortBy), refCounts, loading: false });
  },

  search: async (q) => {
    set({ query: q });
    const db = await getDb();
    const raw = q ? repo.searchArticles(db, q) : repo.getAllArticles(db);
    set({ articles: sortArticles(raw, get().sortBy) });
  },

  setSort: (sortBy) => {
    set(state => ({ sortBy, articles: sortArticles(state.articles, sortBy) }));
  },

  createArticle: async (title) => {
    const db = await getDb();
    const now = Date.now();
    const article: Article = { id: uuid(), title: title.trim(), contentMd: '', createdAt: now, updatedAt: now, wordCount: 0, citationStyleId: 'nature' };
    repo.upsertArticle(db, article);
    await get().load();
    return article.id;
  },

  deleteArticle: async (id) => {
    const db = await getDb();
    repo.deleteArticle(db, id);
    await get().load();
  },
}));
