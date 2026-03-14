import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReferenceStore } from '../stores/referenceStore';
import type { ArticleReference } from '../types';

function ReferenceCard({ ref: r, onUpdate, onDelete }: {
  ref: ArticleReference;
  onUpdate: (ref: ArticleReference) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(r);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleSave = () => {
    onUpdate(draft);
    setEditing(false);
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
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono bg-gray-700 text-blue-400 px-1.5 py-0.5 rounded">[{r.shortcode}]</span>
            <span className="text-sm font-medium text-white truncate">{r.title || <span className="text-gray-500 italic">No title</span>}</span>
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
  const { references, doiQuery, doiLoading, error, load, setDoiQuery, importFromDoi, addBlank, updateRef, deleteRef, getBibtex } = useReferenceStore();

  useEffect(() => {
    if (articleId) load(articleId);
  }, [articleId, load]);

  const handleExportBibtex = () => {
    const bib = getBibtex();
    const blob = new Blob([bib], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'references.bib';
    a.click();
    URL.revokeObjectURL(url);
  };

  const isGlobal = articleId === '__global__';

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white text-sm">← Back</button>
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

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 space-y-6">
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
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-300">{references.length} Reference{references.length !== 1 ? 's' : ''}</h2>
          </div>
          {references.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>No references yet. Import a DOI or add manually.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {references.map(r => (
                <ReferenceCard key={r.id} ref={r} onUpdate={updateRef} onDelete={deleteRef} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
