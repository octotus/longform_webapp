import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDb } from '../db/db';
import { getAllDocs, upsertDoc, deleteDoc, docExistsByTitle } from '../db/repos/corpusDocRepo';
import type { CorpusDocument } from '../types';
import { v4 as uuid } from '../utils/uuid';

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function DocCard({ doc, compact, onView, onDelete, deleteConfirm, onConfirmDelete, onCancelDelete, onAddTag, editingTagId, tagInput, setTagInput, onSubmitTag, onCancelTag, onRemoveTag }: {
  doc: CorpusDocument; compact?: boolean;
  onView: (d: CorpusDocument) => void;
  onDelete: (id: string) => void;
  deleteConfirm: string | null;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  onAddTag: () => void;
  editingTagId: string | null;
  tagInput: string;
  setTagInput: (v: string) => void;
  onSubmitTag: () => void;
  onCancelTag: () => void;
  onRemoveTag: (tag: string) => void;
}) {
  const formatDate = (ts: number) => new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return (
    <div className={`bg-gray-800 border border-gray-700 ${compact ? 'border-l-0 border-r-0 border-t border-b-0 rounded-none' : 'rounded-lg'} p-3 hover:bg-gray-750 transition-colors`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button onClick={() => onView(doc)} className="text-sm font-medium text-white truncate hover:text-blue-300 text-left transition-colors">{doc.title}</button>
            {doc.embedding && <span className="text-xs bg-green-800/50 text-green-400 border border-green-700/50 px-1.5 py-0.5 rounded">embedded</span>}
          </div>
          <div className="text-xs text-gray-500 mt-0.5 flex gap-3">
            <span>{doc.wordCount.toLocaleString()} words</span>
            <span>Added {formatDate(doc.addedAt)}</span>
            {doc.sourceUrl && <a href={doc.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 truncate max-w-xs">{doc.sourceUrl}</a>}
          </div>
          <div className="flex items-center flex-wrap gap-1 mt-2">
            {doc.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-0.5 text-xs bg-blue-900/40 text-blue-300 border border-blue-700/50 px-1.5 py-0.5 rounded">
                {tag}
                <button onClick={() => onRemoveTag(tag)} className="text-gray-400 ml-0.5 font-bold">×</button>
              </span>
            ))}
            {editingTagId === doc.id ? (
              <span className="inline-flex items-center gap-1">
                <input autoFocus type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') onSubmitTag(); if (e.key === 'Escape') onCancelTag(); }}
                  className="text-xs bg-gray-700 border border-gray-600 text-gray-100 rounded px-1.5 py-0.5 w-20 focus:outline-none focus:border-blue-500" placeholder="tag..." />
                <button onClick={onSubmitTag} className="text-xs text-blue-400 hover:text-blue-300">Add</button>
                <button onClick={onCancelTag} className="text-xs text-gray-500 hover:text-gray-300">✕</button>
              </span>
            ) : (
              <button onClick={onAddTag} className="text-xs text-gray-300 hover:text-white border border-gray-500 hover:border-gray-300 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors font-medium">+ tag</button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {deleteConfirm === doc.id ? (
            <>
              <button onClick={() => onConfirmDelete(doc.id)} className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded transition-colors">Delete</button>
              <button onClick={onCancelDelete} className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors">Cancel</button>
            </>
          ) : (
            <button onClick={() => onDelete(doc.id)} className="text-xs text-gray-500 hover:text-red-400 px-2 py-1 rounded hover:bg-gray-700 transition-colors">Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}

function isMedline(text: string): boolean {
  return /PMID-\s*\d+/.test(text);
}

function parseMedlineRecords(text: string): Array<{ title: string; content: string }> {
  // Normalise line endings
  const normalised = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // Split on blank lines
  const records = normalised.split(/\n{2,}/).map(r => r.trim()).filter(Boolean);
  return records.flatMap(record => {
    const fields: Record<string, string[]> = {};
    let currentTag = '';
    for (const raw of record.split('\n')) {
      const line = raw.trimEnd();
      // MEDLINE tags: 2-4 uppercase letters, optional spaces, dash, space, value
      const m = line.match(/^([A-Z]{2,4})\s*-\s(.*)$/);
      if (m) {
        currentTag = m[1].trim();
        (fields[currentTag] ??= []).push(m[2].trim());
      } else if (currentTag && /^\s+/.test(line)) {
        const last = fields[currentTag];
        if (last?.length) last[last.length - 1] += ' ' + line.trim();
      }
    }
    if (!fields['PMID']?.length) return [];
    const pmid    = fields['PMID'][0].trim();
    const title   = fields['TI']?.[0]?.trim() ?? `PMID ${pmid}`;
    const abstract = fields['AB']?.[0]?.trim() ?? '';
    const authors  = (fields['AU'] ?? []).map(a => a.trim()).join('; ');
    const journal  = (fields['JT']?.[0] ?? fields['TA']?.[0] ?? '').trim();
    const date     = (fields['DP']?.[0] ?? '').trim();
    const content = [
      `Title: ${title}`,
      authors   && `Authors: ${authors}`,
      journal   && `Journal: ${journal}`,
      date      && `Published: ${date}`,
      `PMID: ${pmid}`,
      abstract  && `\nAbstract:\n${abstract}`,
    ].filter(Boolean).join('\n');
    return [{ title, content }];
  });
}

export default function CorpusPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<CorpusDocument[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteTagConfirm, setDeleteTagConfirm] = useState(false);
  const [confirmDeleteTag, setConfirmDeleteTag] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<CorpusDocument | null>(null);
  const [viewMode, setViewMode] = useState<'tags' | 'list'>('tags');
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());
  const [corpusSearch, setCorpusSearch] = useState('');

  const toggleExpanded = (key: string) =>
    setExpandedTags(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [pendingBatch, setPendingBatch] = useState<Array<{ title: string; content: string }> | null>(null);
  const [batchTagInput, setBatchTagInput] = useState('');
  const [batchTags, setBatchTags] = useState<string[]>([]);
  const [urlTags, setUrlTags] = useState<string[]>([]);
  const [urlTagInput, setUrlTagInput] = useState('');
  const [pendingFile, setPendingFile] = useState<{ title: string; content: string } | null>(null);
  const [fileTags, setFileTags] = useState<string[]>([]);
  const [fileTagInput, setFileTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocs = async () => {
    const db = await getDb();
    setDocs(getAllDocs(db));
  };

  useEffect(() => { loadDocs(); }, []);

  const handleDeleteByTag = async (tag?: string) => {
    const target = tag ?? activeTag;
    if (!target) return;
    const db = await getDb();
    const toDelete = docs.filter(d => d.tags.includes(target));
    for (const d of toDelete) deleteDoc(db, d.id);
    setActiveTag(null);
    setDeleteTagConfirm(false);
    setConfirmDeleteTag(null);
    await loadDocs();
  };

  const handleFileImport = async () => {
    if (!pendingFile) return;
    const db = await getDb();
    upsertDoc(db, { id: uuid(), title: pendingFile.title, sourceUrl: '', contentText: pendingFile.content, embedding: null, addedAt: Date.now(), wordCount: countWords(pendingFile.content), tags: [...fileTags] });
    setPendingFile(null);
    setFileTags([]);
    setFileTagInput('');
    await loadDocs();
  };

  const handleBatchImport = async () => {
    if (!pendingBatch || batchTags.length === 0) return;
    const db = await getDb();
    let imported = 0, skipped = 0;
    for (const rec of pendingBatch) {
      if (docExistsByTitle(db, rec.title)) { skipped++; continue; }
      upsertDoc(db, { id: uuid(), title: rec.title, sourceUrl: '', contentText: rec.content, embedding: null, addedAt: Date.now(), wordCount: countWords(rec.content), tags: batchTags });
      imported++;
    }
    setPendingBatch(null);
    setBatchTags([]);
    setBatchTagInput('');
    if (skipped > 0) setError(`Imported ${imported} record${imported !== 1 ? 's' : ''}. Skipped ${skipped} duplicate${skipped !== 1 ? 's' : ''}.`);
    await loadDocs();
  };

  const handleAddUrl = async () => {
    const rawUrl = urlInput.trim();
    if (!rawUrl) return;
    const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const text = await res.text();
      const plainText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const db = await getDb();
      upsertDoc(db, {
        id: uuid(),
        title: titleInput.trim() || url,
        sourceUrl: url,
        contentText: plainText,
        embedding: null,
        addedAt: Date.now(),
        wordCount: countWords(plainText),
        tags: [...urlTags],
      });
      setUrlInput('');
      setTitleInput('');
      setUrlTags([]);
      setUrlTagInput('');
      await loadDocs();
    } catch (e: any) {
      const msg = e.message ?? '';
      const isCors = msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('CORS');
      setError(isCors
        ? 'Could not reach URL — either the server blocks browser access (CORS) or the address does not exist. Try uploading the content as a file instead.'
        : `Failed to fetch URL: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const inputEl = e.target;
    const allowedTypes = ['text/plain', 'text/markdown', 'text/csv', 'text/html', 'application/json'];
    const allowedExts = ['.txt', '.md', '.markdown', '.csv', '.html', '.json', '.nbib', '.medline', '.ris'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      setError(`Unsupported file type "${file.name}". Please upload a plain text file (.txt, .md, .csv, .html, .json).`);
      inputEl.value = '';
      return;
    }
    setFileLoading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        if (!text && text !== '') { setError('Could not read file contents.'); return; }
        const db = await getDb();
        if (isMedline(text)) {
          const records = parseMedlineRecords(text);
          if (records.length === 0) { setError('No valid MEDLINE records found in file.'); return; }
          setPendingBatch(records);
          setBatchTags([]);
          setBatchTagInput('');
        } else {
          setPendingFile({ title: file.name, content: text });
          setFileTags([]);
          setFileTagInput('');
        }
      } catch (err: any) {
        setError(`File upload failed: ${err.message}`);
      } finally {
        setFileLoading(false);
        inputEl.value = '';
      }
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setFileLoading(false);
      inputEl.value = '';
    };
    reader.readAsText(file);
  };

  const handleDelete = async (id: string) => {
    const db = await getDb();
    deleteDoc(db, id);
    setDeleteConfirm(null);
    await loadDocs();
  };

  const handleAddTag = async (doc: CorpusDocument) => {
    const t = tagInput.trim();
    if (!t) return;
    const db = await getDb();
    upsertDoc(db, { ...doc, tags: [...doc.tags, t] });
    setTagInput('');
    setEditingTagId(null);
    await loadDocs();
  };

  const handleRemoveTag = async (doc: CorpusDocument, tag: string) => {
    const db = await getDb();
    upsertDoc(db, { ...doc, tags: doc.tags.filter(t => t !== tag) });
    await loadDocs();
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const isMedlineContent = (text: string) => /^Title: /.test(text) && /\nPMID: \d+/.test(text);

  const renderDocContent = (doc: CorpusDocument) => {
    if (isMedlineContent(doc.contentText)) {
      const lines = doc.contentText.split('\n');
      const fields: Record<string, string> = {};
      let abstractLines: string[] = [];
      let inAbstract = false;
      for (const line of lines) {
        if (line === '') continue;
        if (line === 'Abstract:') { inAbstract = true; continue; }
        if (inAbstract) { abstractLines.push(line); continue; }
        const m = line.match(/^([^:]+):\s(.+)$/);
        if (m) fields[m[1]] = m[2];
      }
      return (
        <div className="space-y-4">
          {fields['Title'] && <h2 className="text-xl font-bold text-white leading-snug">{fields['Title']}</h2>}
          <div className="space-y-1 text-sm">
            {fields['Authors'] && <p className="text-gray-300"><span className="text-gray-500 font-medium">Authors: </span>{fields['Authors']}</p>}
            {fields['Journal'] && <p className="text-gray-300"><span className="text-gray-500 font-medium">Journal: </span><em>{fields['Journal']}</em></p>}
            {fields['Published'] && <p className="text-gray-300"><span className="text-gray-500 font-medium">Published: </span>{fields['Published']}</p>}
            {fields['PMID'] && <p className="text-gray-400 text-xs">PMID: {fields['PMID']}</p>}
          </div>
          {abstractLines.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Abstract</p>
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{abstractLines.join('\n')}</p>
            </div>
          )}
        </div>
      );
    }
    return <pre className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">{doc.contentText}</pre>;
  };

  // All unique tags across all docs
  const allTags = Array.from(new Set(docs.flatMap(d => d.tags))).sort();

  // Filter docs by active tag
  const filteredDocs = activeTag ? docs.filter(d => d.tags.includes(activeTag)) : docs;

  // Tag tree: group top-level tags, sub-tags via '/'
  const tagTree = (() => {
    const roots: Record<string, { docs: CorpusDocument[]; children: Record<string, CorpusDocument[]> }> = {};
    for (const doc of docs) {
      if (doc.tags.length === 0) {
        (roots['__untagged__'] ??= { docs: [], children: {} }).docs.push(doc);
      } else {
        for (const tag of doc.tags) {
          const [root, ...rest] = tag.split('/');
          const child = rest.join('/');
          const node = (roots[root] ??= { docs: [], children: {} });
          if (child) (node.children[child] ??= []).push(doc);
          else node.docs.push(doc);
        }
      }
    }
    return roots;
  })();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="text-sm px-3 py-1.5 rounded border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">← Back</button>
        <h1 className="text-lg font-semibold text-white">Research Corpus</h1>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 space-y-10">
        {/* Info box */}
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 text-sm text-blue-300">
          <p className="font-semibold mb-1">About the Corpus</p>
          <p className="text-xs text-blue-400">
            Documents added here are used as context when you select "Local (Ollama)" as the research source in the editor.
            Embeddings are not computed automatically — the full text is passed as context to Ollama.
          </p>
        </div>

        {/* Add from URL */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h2 className="text-base font-semibold text-gray-200 mb-4">Add from URL</h2>
          <div className="space-y-2">
            <input
              type="text"
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              placeholder="Document title (optional)"
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && urlInput.trim()) handleAddUrl(); }}
                placeholder="https://example.com/article.txt"
                className="flex-1 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAddUrl}
                disabled={loading || !urlInput.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded transition-colors"
              >
                {loading ? 'Fetching...' : 'Add'}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1 pt-1">
              {urlTags.map(t => (
                <span key={t} className="inline-flex items-center gap-0.5 text-xs bg-blue-900/40 text-blue-300 border border-blue-700/50 px-1.5 py-0.5 rounded">
                  {t}
                  <button onClick={() => setUrlTags(prev => prev.filter(x => x !== t))} className="text-gray-400 hover:text-white ml-0.5 font-bold">×</button>
                </span>
              ))}
              <input
                type="text"
                value={urlTagInput}
                onChange={e => setUrlTagInput(e.target.value)}
                onKeyDown={e => {
                  if ((e.key === 'Enter' || e.key === ',') && urlTagInput.trim()) {
                    e.preventDefault();
                    const t = urlTagInput.trim().replace(/,$/, '');
                    if (t && !urlTags.includes(t)) setUrlTags(prev => [...prev, t]);
                    setUrlTagInput('');
                  }
                }}
                placeholder="Add tag…"
                className="text-xs bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>

        {/* Add from File */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h2 className="text-base font-semibold text-gray-200 mb-4">Add from File</h2>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.markdown,.csv,.html,.json,.nbib,.medline,.ris"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={fileLoading}
            className="bg-gray-700 hover:bg-gray-600 border border-gray-500 hover:border-gray-400 disabled:opacity-50 text-gray-300 text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            {fileLoading ? 'Reading file...' : 'Choose Text File (.txt, .md, .csv, .json)'}
          </button>
        </div>

        {/* Pending single file import panel */}
        {pendingFile && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-5 space-y-3">
            <div>
              <p className="text-base font-semibold text-blue-300 mb-1">"{pendingFile.title}" ready to import</p>
              <p className="text-xs text-blue-400">Add tags (optional) then click Import.</p>
            </div>
            <div className="flex flex-wrap gap-1 mb-1">
              {fileTags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 text-xs bg-blue-800/50 text-blue-200 border border-blue-700 px-2 py-0.5 rounded">
                  {t}
                  <button onClick={() => setFileTags(prev => prev.filter(x => x !== t))} className="text-blue-400 hover:text-white">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={fileTagInput}
                onChange={e => setFileTagInput(e.target.value)}
                onKeyDown={e => {
                  if ((e.key === 'Enter' || e.key === ',') && fileTagInput.trim()) {
                    e.preventDefault();
                    const t = fileTagInput.trim().replace(/,$/, '');
                    if (t && !fileTags.includes(t)) setFileTags(prev => [...prev, t]);
                    setFileTagInput('');
                  }
                }}
                placeholder="Type a tag and press Enter…"
                className="flex-1 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleFileImport}
                className="bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
              >
                Import
              </button>
              <button
                onClick={() => { setPendingFile(null); setFileTags([]); setFileTagInput(''); }}
                className="text-sm text-gray-400 hover:text-white px-3 py-2 rounded border border-gray-600 hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Batch import tag panel */}
        {pendingBatch && (
          <div className="bg-amber-900/30 border border-amber-600 rounded-lg p-5 space-y-3">
            <div>
              <p className="text-base font-semibold text-amber-300 mb-1">{pendingBatch.length} MEDLINE records ready to import</p>
              <p className="text-xs text-amber-400">Add at least one tag to apply to all records before importing.</p>
            </div>
            <div className="flex flex-wrap gap-1 mb-1">
              {batchTags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 text-xs bg-amber-800/50 text-amber-200 border border-amber-700 px-2 py-0.5 rounded">
                  {t}
                  <button onClick={() => setBatchTags(prev => prev.filter(x => x !== t))} className="text-amber-400 hover:text-white">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={batchTagInput}
                onChange={e => setBatchTagInput(e.target.value)}
                onKeyDown={e => {
                  if ((e.key === 'Enter' || e.key === ',') && batchTagInput.trim()) {
                    e.preventDefault();
                    const t = batchTagInput.trim().replace(/,$/, '');
                    if (t && !batchTags.includes(t)) setBatchTags(prev => [...prev, t]);
                    setBatchTagInput('');
                  }
                }}
                placeholder="Type a tag and press Enter…"
                className="flex-1 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleBatchImport}
                disabled={batchTags.length === 0}
                className="bg-amber-700 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded transition-colors"
              >
                Import {pendingBatch.length} records
              </button>
              <button
                onClick={() => { setPendingBatch(null); setBatchTags([]); setBatchTagInput(''); }}
                className="text-sm text-gray-400 hover:text-white px-3 py-2 rounded border border-gray-600 hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tag filter */}
        {/* Documents section */}
        <div>
          {/* Header: count + search + view toggle */}
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-base font-semibold text-gray-200 flex-shrink-0">{docs.length} Document{docs.length !== 1 ? 's' : ''}</h2>
            <input
              type="text"
              value={corpusSearch}
              onChange={e => setCorpusSearch(e.target.value)}
              placeholder="Search titles…"
              className="flex-1 bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-500"
            />
            <button
              onClick={() => setViewMode(viewMode === 'tags' ? 'list' : 'tags')}
              className="text-xs px-3 py-1.5 rounded border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors flex-shrink-0"
            >
              {viewMode === 'tags' ? 'List view' : 'Tag view'}
            </button>
          </div>

          {docs.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No corpus documents yet. Add a URL or upload a text file.</div>
          ) : viewMode === 'list' ? (
            /* ── Flat list (search-filtered) ── */
            <div className="space-y-2">
              {filteredDocs
                .filter(d => !corpusSearch.trim() || d.title.toLowerCase().includes(corpusSearch.toLowerCase()))
                .map(doc => <DocCard key={doc.id} doc={doc} onView={setViewingDoc} onDelete={setDeleteConfirm} deleteConfirm={deleteConfirm} onConfirmDelete={handleDelete} onCancelDelete={() => setDeleteConfirm(null)} onAddTag={() => { setEditingTagId(doc.id); setTagInput(''); }} editingTagId={editingTagId} tagInput={tagInput} setTagInput={setTagInput} onSubmitTag={() => handleAddTag(doc)} onCancelTag={() => { setEditingTagId(null); setTagInput(''); }} onRemoveTag={(tag) => handleRemoveTag(doc, tag)} />)
              }
            </div>
          ) : (
            /* ── Tag tree view ── */
            <div className="space-y-2">
              {Object.entries(tagTree)
                .sort(([a], [b]) => a === '__untagged__' ? 1 : b === '__untagged__' ? -1 : a.localeCompare(b))
                .map(([rootTag, node]) => {
                  const label = rootTag === '__untagged__' ? 'Untagged' : rootTag;
                  const allDocsInGroup = [
                    ...node.docs,
                    ...Object.values(node.children).flat(),
                  ].filter(d => !corpusSearch.trim() || d.title.toLowerCase().includes(corpusSearch.toLowerCase()));
                  const totalCount = allDocsInGroup.length;
                  if (totalCount === 0) return null;
                  const isExpanded = expandedTags.has(rootTag);
                  const hasChildren = Object.keys(node.children).length > 0;
                  return (
                    <div key={rootTag} className="border border-gray-700 rounded-lg overflow-hidden">
                      {/* Root tag header */}
                      <div className="flex items-center bg-gray-800 px-4 py-2.5 gap-3">
                        <button onClick={() => toggleExpanded(rootTag)} className="flex items-center gap-2 flex-1 text-left">
                          <span className="text-gray-400 text-xs w-3">{isExpanded ? '▼' : '▶'}</span>
                          <span className="text-sm font-semibold text-gray-200">{label}</span>
                          <span className="text-xs bg-gray-700 border border-gray-600 text-gray-400 px-1.5 py-0.5 rounded-full">{totalCount}</span>
                        </button>
                        {rootTag !== '__untagged__' && (
                          deleteTagConfirm && activeTag === rootTag ? (
                            <span className="flex items-center gap-2">
                              <span className="text-xs text-red-400">Delete all {totalCount}?</span>
                              <button onClick={() => handleDeleteByTag(rootTag)} className="text-xs bg-red-700 hover:bg-red-600 text-white px-2 py-0.5 rounded transition-colors">Yes</button>
                              <button onClick={() => setDeleteTagConfirm(false)} className="text-xs text-gray-400 hover:text-white px-2 py-0.5 rounded border border-gray-600 transition-colors">No</button>
                            </span>
                          ) : (
                            <button onClick={() => { setActiveTag(rootTag); setDeleteTagConfirm(true); }} className="text-xs text-red-500 hover:text-red-400 border border-red-900 hover:border-red-700 px-2 py-0.5 rounded transition-colors opacity-60 hover:opacity-100">Delete all</button>
                          )
                        )}
                      </div>
                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="bg-gray-900">
                          {/* Direct docs */}
                          {node.docs.filter(d => !corpusSearch.trim() || d.title.toLowerCase().includes(corpusSearch.toLowerCase())).map(doc => (
                            <DocCard key={doc.id} doc={doc} compact onView={setViewingDoc} onDelete={setDeleteConfirm} deleteConfirm={deleteConfirm} onConfirmDelete={handleDelete} onCancelDelete={() => setDeleteConfirm(null)} onAddTag={() => { setEditingTagId(doc.id); setTagInput(''); }} editingTagId={editingTagId} tagInput={tagInput} setTagInput={setTagInput} onSubmitTag={() => handleAddTag(doc)} onCancelTag={() => { setEditingTagId(null); setTagInput(''); }} onRemoveTag={(tag) => handleRemoveTag(doc, tag)} />
                          ))}
                          {/* Sub-tag groups */}
                          {hasChildren && Object.entries(node.children)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([child, childDocs]) => {
                              const childKey = `${rootTag}/${child}`;
                              const filtered = childDocs.filter(d => !corpusSearch.trim() || d.title.toLowerCase().includes(corpusSearch.toLowerCase()));
                              if (filtered.length === 0) return null;
                              const childExpanded = expandedTags.has(childKey);
                              return (
                                <div key={childKey} className="border-t border-gray-800">
                                  <div className="flex items-center px-6 py-2 bg-gray-850 hover:bg-gray-800 transition-colors gap-2">
                                    <button onClick={() => toggleExpanded(childKey)} className="flex items-center gap-2 flex-1 text-left">
                                      <span className="text-gray-500 text-xs w-3">{childExpanded ? '▼' : '▶'}</span>
                                      <span className="text-xs font-medium text-gray-400">{child}</span>
                                      <span className="text-xs bg-gray-800 text-gray-500 px-1 py-0.5 rounded-full">{filtered.length}</span>
                                    </button>
                                    {confirmDeleteTag === childKey ? (
                                      <span className="flex items-center gap-1.5">
                                        <span className="text-xs text-red-400">Delete {filtered.length}?</span>
                                        <button onClick={() => handleDeleteByTag(childKey)} className="text-xs bg-red-700 hover:bg-red-600 text-white px-2 py-0.5 rounded transition-colors">Yes</button>
                                        <button onClick={() => setConfirmDeleteTag(null)} className="text-xs text-gray-400 hover:text-white px-1.5 py-0.5 rounded border border-gray-600 transition-colors">No</button>
                                      </span>
                                    ) : (
                                      <button onClick={() => setConfirmDeleteTag(childKey)} className="text-xs text-red-500 hover:text-red-400 border border-red-900 hover:border-red-700 px-2 py-0.5 rounded transition-colors opacity-60 hover:opacity-100">Delete all</button>
                                    )}
                                  </div>
                                  {childExpanded && filtered.map(doc => (
                                    <DocCard key={doc.id} doc={doc} compact onView={setViewingDoc} onDelete={setDeleteConfirm} deleteConfirm={deleteConfirm} onConfirmDelete={handleDelete} onCancelDelete={() => setDeleteConfirm(null)} onAddTag={() => { setEditingTagId(doc.id); setTagInput(''); }} editingTagId={editingTagId} tagInput={tagInput} setTagInput={setTagInput} onSubmitTag={() => handleAddTag(doc)} onCancelTag={() => { setEditingTagId(null); setTagInput(''); }} onRemoveTag={(tag) => handleRemoveTag(doc, tag)} />
                                  ))}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Document viewer modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={() => setViewingDoc(null)}>
          <div
            className="bg-gray-900 border-l border-gray-700 h-full w-full max-w-2xl overflow-y-auto shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 flex-shrink-0">
              <div>
                <p className="text-xs text-gray-500">{viewingDoc.wordCount.toLocaleString()} words · Added {formatDate(viewingDoc.addedAt)}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {viewingDoc.tags.map(t => (
                    <span key={t} className="text-xs bg-blue-900/40 text-blue-300 border border-blue-700/50 px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => setViewingDoc(null)} className="text-gray-400 hover:text-white text-xl px-2 transition-colors">×</button>
            </div>
            <div className="flex-1 px-6 py-6 overflow-y-auto">
              {renderDocContent(viewingDoc)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
