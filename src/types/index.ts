export interface Article {
  id: string;
  title: string;
  contentMd: string;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  citationStyleId: string;
}

export const GLOBAL_ARTICLE_ID = '__global__';

export interface ArticleReference {
  id: string;
  articleId: string;
  shortcode: string;
  doi: string;
  url: string;
  title: string;
  authors: string; // semicolon-separated: "Smith, J.; Jones, A."
  year: string;
  journal: string;
  volume: string;
  issue: string;
  pages: string;
  bibtex: string;
  sortOrder: number;
  tags: string[];
}

export interface NlpSnapshot {
  id: string;
  articleId: string;
  timestamp: number;
  readabilityScore: number;
  passivePct: number;
  hedgePct: number;
  wordCount: number;
}

export interface NlpResult {
  readabilityGrade: number;
  passivePct: number;
  hedgePct: number;
  wordCount: number;
  sentenceCount: number;
}

export type InTextFormat = 'SUPERSCRIPT' | 'PARENTHETICAL_NUMBER' | 'AUTHOR_YEAR';
export type AuthorFormat = 'LAST_INITIAL' | 'LAST_FIRST' | 'INITIAL_LAST';
export type YearPosition = 'AFTER_AUTHORS' | 'AT_END';
export type SortOrder = 'CITATION_ORDER' | 'ALPHABETICAL';
export type TitleCasing = 'SENTENCE_CASE' | 'TITLE_CASE';
export type ReferenceField = 'AUTHORS' | 'YEAR' | 'TITLE' | 'JOURNAL' | 'VOLUME' | 'ISSUE' | 'PAGES' | 'DOI' | 'URL';

export interface CitationStyleConfig {
  id: string;
  name: string;
  inTextFormat: InTextFormat;
  authorFormat: AuthorFormat;
  yearPosition: YearPosition;
  sortOrder: SortOrder;
  titleCasing: TitleCasing;
  boldVolume: boolean;
  italicizeJournal: boolean;
  abbreviateJournal: boolean;
  includeIssue: boolean;
  includeUrl: boolean;
  includeDoi: boolean;
  fieldOrder: ReferenceField[];
}

export interface CitationStyleEntity {
  id: string;
  name: string;
  isBuiltIn: number;
  schemaJson: string;
  createdAt: number;
}

export interface CorpusDocument {
  id: string;
  title: string;
  sourceUrl: string;
  contentText: string;
  embedding: Uint8Array | null;
  addedAt: number;
  wordCount: number;
  tags: string[];
}

export type ProviderType = 'OPENAI' | 'CLAUDE' | 'OLLAMA';
export type ResearchSource = 'LOCAL' | 'WEB';
export type SortBy = 'DATE_MODIFIED' | 'DATE_CREATED' | 'WORD_COUNT' | 'TITLE';
