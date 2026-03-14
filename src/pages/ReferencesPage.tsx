import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReferenceStore } from '../stores/referenceStore';
import { exportBibtex } from '../core/citation/citationRenderer';
import type { ArticleReference } from '../types';
import { GLOBAL_ARTICLE_ID } from '../types';
import { getDb } from '../db/db';
import * as articleRepo from '../db/repos/articleRepo';

function ReferenceCard({ ref: r, onUpdate, onDelete, checked, onToggle, articleTitle }: {
  ref: ArticleReference;
  onUpdate: (ref: ArticleReference) => void;
  onDelete: (id: string) => void;
  checked: boolean;
  onToggle: () => void;
  articleTitle?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(r);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editingTag, setEditingTag] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleSave = () => {
    onUpdate(draft);
    setEditing(false);
  };

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    const newTags = [...(r.tags || []), t];
    onUpdate({ ...r, tags: newTags });
    setTagInput('');
    setEditingTag(false);
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = (r.tags || []).filter(t => t !== tag);
    onUpdate({ ...r, tags: newTags });
  };

  const field = (key: keyof ArticleReference, label: string, full = false) => (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
      <input
        type="text"
        value={String(draft[key] ?? '')}
        onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
        className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
      />
    </div>
  );

  if (editing) {
    return (
      <div className="bg-gray-800 border border-blue-600 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {field('shortcode', 'Shortcode')}
          {field('year', 'Year')}
          {field('title', 'Title', true)}
          {field('authors', 'Authors (semicolon-separated)', true)}
          {field('journal', 'Journal')}
          {field('volume', 'Volume')}
          {field('issue', 'Issue')}
          {field('pages', 'Pages')}
          {field('doi', 'DOI')}
          {field('url', 'URL')}
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors">Save</button>
          <button onClick={() => { setEditing(false); setDraft(r); }} className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded hover:bg-gray-700 transition-colors">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between gap-2">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-1 flex-shrink-0 accent-blue-500"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xs font-mono bg-gray-700 text-blue-400 px-1.5 py-0.5 rounded">[{r.shortcode}]</span>
            <span className="text-sm font-medium text-white truncate">{r.title || <span className="text-gray-500 italic">No title</span>}</span>
            {articleTitle && (
              <span className="text-xs bg-blue-600 text-white border border-blue-500 px-1.5 py-0.5 rounded font-medium">{articleTitle}</span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1 space-y-0.5">
            {r.authors && <div>{r.authors.replace(/;/g, ', ')}</div>}
            <div className="flex gap-2">
              {r.journal && <span className="italic">{r.journal}</span>}
              {r.volume && <span>vol. {r.volume}</span>}
              {r.pages && <span>pp. {r.pages}</span>}
              {r.year && <span>({r.year})</span>}
            </div>
            {r.doi && <div className="text-blue-400 text-xs">doi:{r.doi}</div>}
          </div>
          {/* Tag chips */}
          <div className="flex items-center flex-wrap gap-1 mt-2">
            {(r.tags || []).map(tag => (
              <span key={tag} className="inline-flex items-center gap-0.5 text-xs bg-blue-900/40 text-blue-300 border border-blue-700/50 px-1.5 py-0.5 rounded">
                {tag}
                <button onClick={() => handleRemoveTag(tag)} className="text-blue-400 hover:text-red-400 ml-0.5">×</button>
              </span>
            ))}
            {editingTag ? (
              <span className="inline-flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); if (e.key === 'Escape') { setEditingTag(false); setTagInput(''); } }}
                  className="text-xs bg-gray-700 border border-gray-600 text-gray-100 rounded px-2 py-1 w-24 focus:outline-none focus:border-blue-500"
                  placeholder="tag..."
                />
                <button onClick={handleAddTag} className="text-xs text-blue-400 hover:text-blue-200 border border-blue-700 hover:border-blue-500 px-2 py-1 rounded transition-colors">Add</button>
                <button onClick={() => { setEditingTag(false); setTagInput(''); }} className="text-xs text-gray-400 hover:text-gray-200 border border-gray-600 hover:border-gray-400 px-2 py-1 rounded transition-colors">✕</button>
              </span>
            ) : (
              <button onClick={() => setEditingTag(true)} className="text-xs text-gray-500 hover:text-gray-300 border border-dashed border-gray-600 hover:border-gray-400 px-1.5 py-0.5 rounded transition-colors">+ tag</button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors">Edit</button>
          {deleteConfirm ? (
            <>
              <button onClick={() => onDelete(r.id)} className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded transition-colors">Confirm</button>
              <button onClick={() => setDeleteConfirm(false)} className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors">Cancel</button>
            </>
          ) : (
            <button onClick={() => setDeleteConfirm(true)} className="text-xs text-gray-500 hover:text-red-400 px-2 py-1 rounded hover:bg-gray-700 transition-colors">Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReferencesPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { references, doiQuery, doiLoading, error, load, setDoiQuery, importFromDoi, addBlank, updateRef, deleteRef, articleTitles } = useReferenceStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [globalSearch, setGlobalSearch] = useState('');
  const [articleNotFound, setArticleNotFound] = useState(false);

  useEffect(() => {
    if (!articleId) return;
    if (articleId === GLOBAL_ARTICLE_ID) { load(articleId); return; }
    getDb().then(db => {
      const article = articleRepo.getArticleById(db, articleId);
      if (!article) { setArticleNotFound(true); return; }
      setArticleNotFound(false);
      load(articleId);
    });
  }, [articleId, load]);


  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExportBibtex = () => {
    if (references.length === 0) {
      alert('No references to export.');
      return;
    }
    if (selectedIds.size === 0) {
      alert('Select at least one reference to export.');
      return;
    }
    const selectedRefs = references.filter(r => selectedIds.has(r.id));
    const bib = exportBibtex(selectedRefs);
    const blob = new Blob([bib], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'references.bib';
    a.click();
    URL.revokeObjectURL(url);
  };

  const isGlobal = articleId === GLOBAL_ARTICLE_ID;

  const visibleRefs = isGlobal && globalSearch.trim()
    ? references.filter(r => {
        const q = globalSearch.toLowerCase();
        const title = articleTitles[r.articleId] ?? (r.articleId === GLOBAL_ARTICLE_ID ? 'global' : r.articleId);
        return r.tags.some(t => t.toLowerCase().includes(q)) || title.toLowerCase().includes(q);
      })
    : references;


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-sm px-3 py-1.5 rounded border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">← Back</button>
        <h1 className="text-lg font-semibold text-white mr-auto">
          {isGlobal ? 'Global References' : 'References'}
        </h1>
        <button onClick={addBlank} className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors">
          + Add Manual
        </button>
        <button onClick={handleExportBibtex} className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors">
          Export BibTeX
        </button>
      </header>

      {articleNotFound && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 space-y-2">
            <p className="text-lg font-medium text-gray-300">No article found with this ID.</p>
            <p className="text-sm">Please go to the <button onClick={() => navigate('/')} className="text-blue-400 hover:underline">Library page</button> and open an article.</p>
          </div>
        </div>
      )}

      {!articleNotFound && <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 space-y-6">
        {/* DOI import */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Import from DOI</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={doiQuery}
              onChange={e => setDoiQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') importFromDoi(); }}
              placeholder="10.1038/nature12345 or https://doi.org/..."
              className="flex-1 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={importFromDoi}
              disabled={doiLoading || !doiQuery.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
            >
              {doiLoading ? 'Importing...' : 'Import'}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>

        {/* Reference list */}
        <div>
          {isGlobal && (
            <input
              id="global-refs-search"
              name="global-refs-search"
              type="text"
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              placeholder="Filter by tag or article title..."
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded px-4 py-2 text-sm focus:outline-none focus:border-blue-500 mb-3"
            />
          )}
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-sm font-semibold text-gray-300">{visibleRefs.length} Reference{visibleRefs.length !== 1 ? 's' : ''}{globalSearch.trim() ? ` matching "${globalSearch}"` : ''}</h2>
            <button
              onClick={() => setSelectedIds(new Set(visibleRefs.map(r => r.id)))}
              className="text-xs text-blue-400 hover:text-blue-200 border border-blue-700 hover:border-blue-500 px-2 py-1 rounded transition-colors"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-gray-400 hover:text-gray-200 border border-gray-600 hover:border-gray-400 px-2 py-1 rounded transition-colors"
            >
              Select None
            </button>
          </div>
          {visibleRefs.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>{references.length === 0 ? 'No references yet. Import a DOI or add manually.' : 'No references match your search.'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleRefs.map(r => (
                <ReferenceCard
                  key={r.id}
                  ref={r}
                  onUpdate={updateRef}
                  onDelete={deleteRef}
                  checked={selectedIds.has(r.id)}
                  onToggle={() => toggleSelect(r.id)}
                  articleTitle={isGlobal ? (articleTitles[r.articleId] ?? (r.articleId === GLOBAL_ARTICLE_ID ? 'Global' : r.articleId)) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>}
    </div>
  );
}
