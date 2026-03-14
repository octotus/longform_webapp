import type { CitationStyleConfig } from '../../types';

export const NATURE: CitationStyleConfig = {
  id: 'nature',
  name: 'Nature',
  inTextFormat: 'SUPERSCRIPT',
  authorFormat: 'LAST_INITIAL',
  yearPosition: 'AT_END',
  sortOrder: 'CITATION_ORDER',
  titleCasing: 'SENTENCE_CASE',
  boldVolume: true,
  italicizeJournal: true,
  abbreviateJournal: true,
  includeIssue: false,
  includeUrl: false,
  includeDoi: true,
  fieldOrder: ['AUTHORS', 'TITLE', 'JOURNAL', 'VOLUME', 'PAGES', 'YEAR', 'DOI'],
};

export const SCIENCE: CitationStyleConfig = {
  id: 'science',
  name: 'Science',
  inTextFormat: 'PARENTHETICAL_NUMBER',
  authorFormat: 'LAST_INITIAL',
  yearPosition: 'AT_END',
  sortOrder: 'CITATION_ORDER',
  titleCasing: 'TITLE_CASE',
  boldVolume: false,
  italicizeJournal: false,
  abbreviateJournal: true,
  includeIssue: false,
  includeUrl: false,
  includeDoi: false,
  fieldOrder: ['AUTHORS', 'TITLE', 'JOURNAL', 'VOLUME', 'PAGES', 'YEAR'],
};

export const builtInStyles = [NATURE, SCIENCE];
