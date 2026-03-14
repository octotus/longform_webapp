import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDb } from '../db/db';
import { getAllDocs, upsertDoc, deleteDoc } from '../db/repos/corpusDocRepo';
import type { CorpusDocument } from '../types';
import { v4 as uuid } from '../utils/uuid';

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export default function CorpusPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<CorpusDocument[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocs = async () => {
    const db = await getDb();
    setDocs(getAllDocs(db));
  };

  useEffect(() => { loadDocs(); }, []);

  const handleAddUrl = async () => {
    const url = urlInput.trim();
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch via a CORS-permissive approach (user must configure CORS or use local files)
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const text = await res.text();
      // Strip basic HTML tags
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
      });
      setUrlInput('');
      setTitleInput('');
      await loadDocs();
    } catch (e: any) {
      setError(`Failed to fetch URL: ${e.message}. Try a local file instead, or ensure CORS is enabled.`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const db = await getDb();
      upsertDoc(db, {
        id: uuid(),
        title: file.name,
        sourceUrl: '',
        contentText: text,
        embedding: null,
        addedAt: Date.now(),
        wordCount: countWords(text),
      });
      await loadDocs();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    const db = await getDb();
    deleteDoc(db, id);
    setDeleteConfirm(null);
    await loadDocs();
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white text-sm">← Back</button>
        <h1 className="text-lg font-semibold text-white">Research Corpus</h1>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 space-y-6">
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
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Add from URL</h2>
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
                onKeyDown={e => { if (e.key === 'Enter') handleAddUrl(); }}
                placeholder="https://example.com/article.txt"
                className="flex-1 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAddUrl}
                disabled={loading || !urlInput.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
              >
                {loading ? 'Fetching...' : 'Add'}
              </button>
            </div>
          </div>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>

        {/* Add from File */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Add from File</h2>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.csv,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            Choose Text File (.txt, .md, .csv, .json)
          </button>
        </div>

        {/* Documents list */}
        <div>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">
            {docs.length} Document{docs.length !== 1 ? 's' : ''}
          </h2>
          {docs.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>No corpus documents yet. Add a URL or upload a text file.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {docs.map(doc => (
                <div key={doc.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">{doc.title}</span>
                        {doc.embedding && (
                          <span className="text-xs bg-green-800/50 text-green-400 border border-green-700/50 px-1.5 py-0.5 rounded">embedded</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 flex gap-3">
                        <span>{doc.wordCount.toLocaleString()} words</span>
                        <span>Added {formatDate(doc.addedAt)}</span>
                        {doc.sourceUrl && (
                          <a href={doc.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 truncate max-w-xs">
                            {doc.sourceUrl}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {deleteConfirm === doc.id ? (
                        <>
                          <button onClick={() => handleDelete(doc.id)} className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded transition-colors">Delete</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors">Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteConfirm(doc.id)} className="text-xs text-gray-500 hover:text-red-400 px-2 py-1 rounded hover:bg-gray-700 transition-colors">Delete</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
