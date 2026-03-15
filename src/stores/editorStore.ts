import { create } from 'zustand';
import type { Article, NlpResult, CitationStyleConfig, ResearchSource } from '../types';
import { getDb } from '../db/db';
import * as articleRepo from '../db/repos/articleRepo';
import * as nlpRepo from '../db/repos/nlpSnapshotRepo';
import * as styleRepo from '../db/repos/citationStyleRepo';
import { getAllDocs } from '../db/repos/corpusDocRepo';
import { analyze, countWords } from '../core/nlp/nlpAnalyzer';
import { OpenAIProvider } from '../core/network/openAIProvider';
import { ClaudeProvider } from '../core/network/claudeProvider';
import { OllamaProvider } from '../core/network/ollamaProvider';
import { useSettingsStore } from './settingsStore';
import { v4 as uuid } from '../utils/uuid';

interface EditorState {
  article: Article;
  nlpResult: NlpResult | null;
  researchResponse: string;
  researchLoading: boolean;
  researchQuery: string;
  researchSource: ResearchSource;
  showNlpPanel: boolean;
  showResearchPanel: boolean;
  citationStyle: CitationStyleConfig | null;
  loadArticle: (id: string) => Promise<void>;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => Promise<void>;
  saveNow: () => Promise<void>;
  toggleNlpPanel: () => void;
  toggleResearchPanel: () => void;
  corpusTagFilter: string[];
  availableCorpusTags: string[];
  setResearchQuery: (q: string) => void;
  setResearchSource: (s: ResearchSource) => void;
  toggleCorpusTag: (tag: string) => void;
  loadCorpusTags: () => Promise<void>;
  submitResearchQuery: () => Promise<void>;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useEditorStore = create<EditorState>((set, get) => ({
  article: { id: '', title: '', contentMd: '', createdAt: 0, updatedAt: 0, wordCount: 0, citationStyleId: 'nature' },
  nlpResult: null,
  researchResponse: '',
  researchLoading: false,
  researchQuery: '',
  researchSource: 'WEB',
  showNlpPanel: false,
  showResearchPanel: false,
  citationStyle: null,
  corpusTagFilter: [],
  availableCorpusTags: [],

  loadArticle: async (id) => {
    // Reset state immediately so previous article doesn't bleed through (B3)
    set({ article: { id: '', title: '', contentMd: '', createdAt: 0, updatedAt: 0, wordCount: 0, citationStyleId: 'nature' }, nlpResult: null, researchQuery: '', researchResponse: '' });
    const db = await getDb();
    const article = articleRepo.getArticleById(db, id);
    if (!article) return;
    const styleEntity = styleRepo.getStyleById(db, article.citationStyleId);
    const citationStyle = styleEntity ? JSON.parse(styleEntity.schemaJson) as CitationStyleConfig : null;
    set({ article, citationStyle });
  },

  onContentChange: (content) => {
    const wc = countWords(content);
    set(state => ({ article: { ...state.article, contentMd: content, wordCount: wc } }));
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => get().saveNow(), 3000);
  },

  onTitleChange: async (title) => {
    set(state => ({ article: { ...state.article, title } }));
    const db = await getDb();
    articleRepo.upsertArticle(db, { ...get().article, title, updatedAt: Date.now() });
  },

  saveNow: async () => {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    const { article } = get();
    if (!article.id) return;
    const nlpResult = analyze(article.contentMd);
    const db = await getDb();
    articleRepo.upsertArticle(db, { ...article, wordCount: nlpResult.wordCount, updatedAt: Date.now() });
    nlpRepo.insertSnapshot(db, {
      id: uuid(),
      articleId: article.id,
      timestamp: Date.now(),
      readabilityScore: nlpResult.readabilityGrade,
      passivePct: nlpResult.passivePct,
      hedgePct: nlpResult.hedgePct,
      wordCount: nlpResult.wordCount,
    });
    set({ nlpResult });
  },

  toggleNlpPanel: () => set(state => ({ showNlpPanel: !state.showNlpPanel })),
  toggleResearchPanel: () => set(state => ({ showResearchPanel: !state.showResearchPanel })),
  setResearchQuery: (researchQuery) => set({ researchQuery }),
  setResearchSource: (researchSource) => set({ researchSource }),

  toggleCorpusTag: (tag) => {
    const { corpusTagFilter } = get();
    set({ corpusTagFilter: corpusTagFilter.includes(tag) ? corpusTagFilter.filter(t => t !== tag) : [...corpusTagFilter, tag] });
  },

  loadCorpusTags: async () => {
    const db = await getDb();
    const docs = getAllDocs(db);
    const tags = Array.from(new Set(docs.flatMap(d => d.tags))).sort();
    set({ availableCorpusTags: tags });
  },

  submitResearchQuery: async () => {
    const { researchQuery, researchSource, article, corpusTagFilter } = get();
    if (!researchQuery.trim()) return;
    const settings = useSettingsStore.getState();
    set({ researchLoading: true, researchResponse: '' });
    try {
      let provider;
      const isLocal = researchSource === 'LOCAL' || settings.activeProvider === 'OLLAMA';
      if (isLocal) {
        provider = new OllamaProvider(settings.ollamaUrl, settings.ollamaModel);
      } else if (settings.activeProvider === 'CLAUDE') {
        provider = new ClaudeProvider(settings.claudeKey);
      } else {
        provider = new OpenAIProvider(settings.openAiKey);
      }
      const system = 'You are a research assistant helping an academic writer. Be concise, cite sources when possible, and stay on topic.';
      let context = `Article title: ${article.title}\n\nCurrent content excerpt: ${article.contentMd.slice(0, 500)}`;
      if (isLocal && corpusTagFilter.length > 0) {
        const db = await getDb();
        const docs = getAllDocs(db).filter(d => corpusTagFilter.some(tag => d.tags.includes(tag)));
        if (docs.length > 0) {
          const corpusContext = docs.map(d => `--- ${d.title} ---\n${d.contentText.slice(0, 1500)}`).join('\n\n');
          context += `\n\nRelevant corpus documents (tags: ${corpusTagFilter.join(', ')}):\n\n${corpusContext}`;
        }
      }
      const fullQuery = `${context}\n\nResearch query: ${researchQuery}`;
      let response = '';
      for await (const chunk of provider.complete(system, fullQuery)) {
        response += chunk;
        set({ researchResponse: response });
      }
    } catch (e: any) {
      set({ researchResponse: `Error: ${e.message}` });
    } finally {
      set({ researchLoading: false });
    }
  },
}));
