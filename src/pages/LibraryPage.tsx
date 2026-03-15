import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useArticleStore } from '../stores/articleStore';
import type { SortBy } from '../types';
import { debounce } from 'lodash';

export default function LibraryPage() {
  const navigate = useNavigate();
  const { articles, refCounts, loading, load, search, setSort, sortBy, createArticle, deleteArticle } = useArticleStore();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchVal, setSearchVal] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (showNewDialog) {
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  }, [showNewDialog]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce((q: string) => search(q), 300), [search]);

  const handleSearch = (q: string) => {
    setSearchVal(q);
    debouncedSearch(q);
  };

  const openNewDialog = () => {
    setNewTitle('');
    setShowNewDialog(true);
  };

  const closeNewDialog = () => {
    setShowNewDialog(false);
    setNewTitle('');
  };

  const handleCreate = async () => {
    const title = newTitle.trim();
    if (!title) return;
    setCreating(true);
    const id = await createArticle(title);
    setCreating(false);
    closeNewDialog();
    navigate(`/editor/${id}`);
  };

  const handleDelete = async (id: string) => {
    await deleteArticle(id);
    setDeleteConfirm(null);
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* New article dialog */}
      {showNewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeNewDialog} />
          <div className="relative bg-gray-800 border border-gray-600 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-white mb-1">New Article</h2>
            <p className="text-sm text-gray-400 mb-5">Give your article a title to get started.</p>
            <input
              ref={titleInputRef}
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') closeNewDialog();
              }}
              placeholder="e.g. The Role of Sleep in Memory Consolidation"
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 mb-5"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={closeNewDialog}
                className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim() || creating}
                className="text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium px-5 py-2 rounded-lg transition-colors"
              >
                {creating ? 'Creating…' : 'Create Article'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
        <h1 className="text-xl font-bold text-white mr-auto">Likhatu</h1>
        <Link to="/references/__global__" className="text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 transition-colors">
          Global Refs
        </Link>
        <Link to="/corpus" className="text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 transition-colors">
          Corpus
        </Link>
        <Link to="/settings" className="text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 transition-colors">
          Settings
        </Link>
        <button
          onClick={openNewDialog}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors"
        >
          + New Article
        </button>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6">
        {/* Search + Sort */}
        <div className="flex gap-3 mb-6">
          <input
            id="library-search"
            name="library-search"
            type="text"
            value={searchVal}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search articles..."
            className="flex-1 bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <select
            id="library-sort"
            name="library-sort"
            value={sortBy}
            onChange={e => setSort(e.target.value as SortBy)}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="DATE_MODIFIED">Modified</option>
            <option value="DATE_CREATED">Created</option>
            <option value="WORD_COUNT">Word Count</option>
            <option value="TITLE">Title</option>
          </select>
        </div>

        {/* Article list */}
        {loading ? (
          <div className="text-center text-gray-500 py-16">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            <p className="text-lg mb-2">No articles yet</p>
            <p className="text-sm">Click "+ New Article" to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map(article => (
              <div key={article.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors group">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/editor/${article.id}`} className="flex-1 min-w-0">
                    <h2 className="text-white font-medium text-base truncate group-hover:text-blue-400 transition-colors">
                      {article.title || <span className="text-gray-500 italic text-sm">No title</span>}
                    </h2>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      <span>{article.wordCount.toLocaleString()} words</span>
                      <span>Modified {formatDate(article.updatedAt)}</span>
                      {refCounts[article.id] ? (
                        <span>{refCounts[article.id]} refs</span>
                      ) : null}
                    </div>
                    {article.contentMd && (
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                        {article.contentMd.replace(/[#*_`>]/g, '').slice(0, 150)}
                      </p>
                    )}
                  </Link>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/references/${article.id}`}
                      className="text-xs text-gray-400 hover:text-blue-400 px-2 py-1 rounded border border-gray-600 hover:border-gray-600 hover:bg-gray-700 transition-colors"
                    >
                      Refs
                    </Link>
                    <Link
                      to={`/focus/${article.id}`}
                      className="text-xs text-gray-400 hover:text-green-400 px-2 py-1 rounded border border-gray-600 hover:border-gray-600 hover:bg-gray-700 transition-colors"
                    >
                      Focus
                    </Link>
                    {deleteConfirm === article.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(article.id)}
                        className="text-xs text-gray-600 hover:text-red-400 px-2 py-1 rounded border border-gray-600 hover:bg-gray-700 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
