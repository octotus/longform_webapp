import type { NlpResult } from '../../types';

const PASSIVE_PATTERNS = [
  /\b(is|are|was|were|be|been|being)\s+\w+ed\b/i,
  /\b(is|are|was|were)\s+\w+(en|n)\b/i,
];

const HEDGE_WORDS = new Set([
  'might', 'could', 'may', 'perhaps', 'possibly', 'probably', 'seemingly',
  'apparently', 'suggests', 'suggest', 'indicates', 'indicate', 'appears',
  'appear', 'seems', 'seem', 'likely', 'unlikely', 'generally', 'typically',
  'often', 'sometimes', 'usually', 'approximately', 'roughly', 'around',
  'tends', 'tend', 'potential', 'potentially', 'arguably', 'presumably',
  'conceivably', 'ostensibly', 'relatively', 'comparatively', 'somewhat',
]);

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(s => s.trim())
    .filter(s => s.length > 10);
}

function splitWords(text: string): string[] {
  return text.split(/[\s\-—]+/)
    .map(w => w.replace(/[^a-zA-Z']/g, ''))
    .filter(w => w.length > 1);
}

function countSyllables(word: string): number {
  const lower = word.toLowerCase();
  if (lower.length <= 3) return 1;
  const count = lower.replace(/e$/, '').replace(/[^aeiouy]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(count, 1);
}

function fleschKincaid(words: number, sentences: number, syllables: number): number {
  if (sentences === 0 || words === 0) return 0;
  const asl = words / sentences;
  const asw = syllables / words;
  return Math.max(0, 0.39 * asl + 11.8 * asw - 15.59);
}

function isPassive(sentence: string): boolean {
  return PASSIVE_PATTERNS.some(p => p.test(sentence));
}

function containsHedge(sentence: string): boolean {
  return sentence.toLowerCase().split(/\s+/).some(w => HEDGE_WORDS.has(w.replace(/[,\.;:]$/, '')));
}

export function analyze(text: string): NlpResult {
  if (!text.trim()) return { readabilityGrade: 0, passivePct: 0, hedgePct: 0, wordCount: 0, sentenceCount: 0 };

  const clean = text
    .replace(/\[[@^][^\]]*\]/g, '')
    .replace(/[*_#`>]/g, '');

  const sentences = splitSentences(clean);
  const words = splitWords(clean);

  if (!words.length || !sentences.length) return { readabilityGrade: 0, passivePct: 0, hedgePct: 0, wordCount: 0, sentenceCount: 0 };

  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const readabilityGrade = fleschKincaid(words.length, sentences.length, syllables);
  const passivePct = sentences.filter(isPassive).length / sentences.length;
  const hedgePct = sentences.filter(containsHedge).length / sentences.length;

  return { readabilityGrade, passivePct, hedgePct, wordCount: words.length, sentenceCount: sentences.length };
}

export function countWords(text: string): number {
  return splitWords(text).length;
}
