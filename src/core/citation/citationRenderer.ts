import type { CitationStyleConfig, ArticleReference } from '../../types';

export function renderInText(style: CitationStyleConfig, index: number, ref: ArticleReference): string {
  switch (style.inTextFormat) {
    case 'SUPERSCRIPT': return index.toString();
    case 'PARENTHETICAL_NUMBER': return `(${index})`;
    case 'AUTHOR_YEAR': {
      const author = ref.authors.split(';')[0]?.split(',')[0]?.trim() ?? '?';
      return `(${author}, ${ref.year})`;
    }
  }
}

export function renderListEntry(style: CitationStyleConfig, index: number, ref: ArticleReference): string {
  let out = `${index}. `;
  for (const field of style.fieldOrder) {
    switch (field) {
      case 'AUTHORS': {
        const f = formatAuthors(ref.authors, style.authorFormat);
        if (f) out += `${f}. `;
        break;
      }
      case 'TITLE': {
        const t = applyTitleCasing(ref.title, style.titleCasing);
        if (t) out += `${t}. `;
        break;
      }
      case 'JOURNAL':
        if (ref.journal) out += `${ref.journal} `;
        break;
      case 'VOLUME':
        if (ref.volume) {
          out += style.boldVolume ? `**${ref.volume}**` : ref.volume;
          if (ref.pages) out += ', ';
        }
        break;
      case 'ISSUE':
        if (style.includeIssue && ref.issue) out += `(${ref.issue})`;
        break;
      case 'PAGES':
        if (ref.pages) out += `${ref.pages} `;
        break;
      case 'YEAR':
        if (ref.year) out += `(${ref.year}).`;
        break;
      case 'DOI':
        if (style.includeDoi && ref.doi) out += ` https://doi.org/${ref.doi}`;
        break;
      case 'URL':
        if (style.includeUrl && ref.url && !ref.doi) out += ` ${ref.url}`;
        break;
    }
  }
  return out.trim();
}

export function exportBibtex(refs: ArticleReference[]): string {
  return refs.map(ref => {
    const key = ref.shortcode || ref.id.slice(0, 8);
    const authors = ref.authors.replace(/;/g, ' and ');
    return `@article{${key},\n  author  = {${authors}},\n  title   = {${ref.title}},\n  journal = {${ref.journal}},\n  year    = {${ref.year}},\n  volume  = {${ref.volume}},\n  pages   = {${ref.pages}},\n  doi     = {${ref.doi}}\n}`;
  }).join('\n\n');
}

function formatAuthors(raw: string, format: CitationStyleConfig['authorFormat']): string {
  const authors = raw.split(';').map(a => a.trim()).filter(Boolean);
  if (!authors.length) return '';
  if (authors.length === 1) return formatSingle(authors[0], format);
  if (authors.length <= 6) return authors.map(a => formatSingle(a, format)).join(', ');
  return `${formatSingle(authors[0], format)} et al.`;
}

function formatSingle(author: string, format: CitationStyleConfig['authorFormat']): string {
  const parts = author.split(',').map(p => p.trim());
  const last = parts[0] ?? '';
  const first = parts[1] ?? '';
  const initial = first ? `${first[0]}.` : '';
  switch (format) {
    case 'LAST_INITIAL': return initial ? `${last}, ${initial}` : last;
    case 'LAST_FIRST': return first ? `${last}, ${first}` : last;
    case 'INITIAL_LAST': return initial ? `${initial} ${last}` : last;
  }
}

function applyTitleCasing(title: string, casing: CitationStyleConfig['titleCasing']): string {
  if (casing === 'SENTENCE_CASE') return title ? title[0].toUpperCase() + title.slice(1).toLowerCase() : '';
  const lower = new Set(['a','an','the','and','but','or','for','nor','on','at','to','by','in','of']);
  return title.split(' ').map((w, i) => i === 0 || !lower.has(w.toLowerCase()) ? w[0]?.toUpperCase() + w.slice(1) : w.toLowerCase()).join(' ');
}
