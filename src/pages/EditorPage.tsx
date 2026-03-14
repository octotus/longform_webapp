import { useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { EditorView } from '@codemirror/view';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEditorStore } from '../stores/editorStore';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { useState } from 'react';

function NlpPanel() {
  const { nlpResult } = useEditorStore();
  if (!nlpResult) return (
    <div className="p-4 text-gray-500 text-sm">Save or wait 3 seconds for NLP analysis.</div>
  );
  const { readabilityGrade, passivePct, hedgePct, wordCount, sentenceCount } = nlpResult;

  const gradeColor = readabilityGrade < 8 ? 'bg-green-500' : readabilityGrade < 12 ? 'bg-yellow-500' : 'bg-red-500';
  const passiveColor = passivePct < 0.15 ? 'bg-green-500' : passivePct < 0.3 ? 'bg-yellow-500' : 'bg-red-500';
  const hedgeColor = hedgePct < 0.15 ? 'bg-green-500' : hedgePct < 0.3 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">NLP Analysis</h3>
      <div className="text-xs text-gray-400">{wordCount} words &bull; {sentenceCount} sentences</div>

      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Readability Grade</span>
          <span>{readabilityGrade.toFixed(1)}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full ${gradeColor} rounded-full transition-all`} style={{ width: `${Math.min(100, (readabilityGrade / 20) * 100)}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-1">Lower = more readable</p>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Passive Voice</span>
          <span>{(passivePct * 100).toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full ${passiveColor} rounded-full transition-all`} style={{ width: `${passivePct * 100}%` }} />
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Hedging Language</span>
          <span>{(hedgePct * 100).toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full ${hedgeColor} rounded-full transition-all`} style={{ width: `${hedgePct * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function ResearchPanel() {
  const { researchQuery, researchResponse, researchLoading, researchSource, setResearchQuery, setResearchSource, submitResearchQuery } = useEditorStore();

  return (
    <div className="p-4 space-y-3 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Research Assistant</h3>

      <div className="flex gap-2">
        <button
          onClick={() => setResearchSource('WEB')}
          className={`flex-1 text-xs py-1.5 rounded transition-colors ${researchSource === 'WEB' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
        >
          Web (AI)
        </button>
        <button
          onClick={() => setResearchSource('LOCAL')}
          className={`flex-1 text-xs py-1.5 rounded transition-colors ${researchSource === 'LOCAL' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
        >
          Local (Ollama)
        </button>
      </div>

      <textarea
        value={researchQuery}
        onChange={e => setResearchQuery(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitResearchQuery(); }}
        placeholder="Ask a research question... (Ctrl+Enter to send)"
        rows={4}
        className="w-full bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded p-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
      />

      <button
        onClick={submitResearchQuery}
        disabled={researchLoading || !researchQuery.trim()}
        className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium py-2 rounded transition-colors"
      >
        {researchLoading ? 'Thinking...' : 'Ask'}
      </button>

      {researchResponse && (
        <div className="flex-1 overflow-auto bg-gray-700 rounded p-3 text-sm text-gray-200 whitespace-pre-wrap">
          {researchResponse}
        </div>
      )}
    </div>
  );
}

export default function EditorPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const editorViewRef = useRef<EditorView | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const {
    article,
    showNlpPanel,
    showResearchPanel,
    loadArticle,
    onContentChange,
    onTitleChange,
    saveNow,
    toggleNlpPanel,
    toggleResearchPanel,
  } = useEditorStore();

  useEffect(() => {
    if (articleId) loadArticle(articleId);
  }, [articleId, loadArticle]);

  const handleBack = async () => {
    await saveNow();
    navigate('/');
  };

  const insertAtCursor = (before: string, after = '') => {
    const view = editorViewRef.current;
    if (!view) return;
    const { from, to } = view.state.selection.main;
    const selected = view.state.sliceDoc(from, to);
    view.dispatch({
      changes: { from, to, insert: before + selected + after },
      selection: { anchor: from + before.length + selected.length + after.length },
    });
    view.focus();
  };

  const toolbarButtons = [
    { label: 'B', title: 'Bold', action: () => insertAtCursor('**', '**') },
    { label: 'I', title: 'Italic', action: () => insertAtCursor('_', '_') },
    { label: 'H1', title: 'Heading 1', action: () => insertAtCursor('# ') },
    { label: 'H2', title: 'Heading 2', action: () => insertAtCursor('## ') },
    { label: 'H3', title: 'Heading 3', action: () => insertAtCursor('### ') },
    { label: '"', title: 'Blockquote', action: () => insertAtCursor('> ') },
    { label: '—', title: 'Em dash', action: () => insertAtCursor('—') },
    { label: '^', title: 'Superscript citation', action: () => insertAtCursor('^[ref]') },
    { label: '↓', title: 'Footnote', action: () => insertAtCursor('[^1]') },
    { label: '[@]', title: 'In-text citation', action: () => insertAtCursor('[@ref]') },
  ];

  const rightPanelOpen = showNlpPanel || showResearchPanel;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Top bar */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleBack}
          className="text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors text-sm"
        >
          ← Library
        </button>
        <input
          type="text"
          value={article.title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Untitled"
          className="flex-1 bg-transparent text-white text-base font-medium placeholder-gray-600 focus:outline-none px-2"
        />
        <span className="text-xs text-gray-500 mr-2">{article.wordCount.toLocaleString()} words</span>
        <button
          onClick={() => setPreviewMode(p => !p)}
          className={`text-xs px-2 py-1 rounded transition-colors ${previewMode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
          title="Toggle preview"
        >
          {previewMode ? 'Edit' : 'Preview'}
        </button>
        <button
          onClick={toggleNlpPanel}
          className={`text-xs px-2 py-1 rounded transition-colors ${showNlpPanel ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
          title="NLP Analysis"
        >
          NLP
        </button>
        <button
          onClick={toggleResearchPanel}
          className={`text-xs px-2 py-1 rounded transition-colors ${showResearchPanel ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
          title="Research Assistant"
        >
          Research
        </button>
        <Link
          to={`/references/${article.id}`}
          className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
        >
          Refs
        </Link>
        <Link
          to={`/focus/${article.id}`}
          className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
        >
          Focus
        </Link>
      </header>

      {/* Formatting toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-1 flex items-center gap-1 flex-shrink-0">
        {toolbarButtons.map(btn => (
          <button
            key={btn.label}
            onClick={btn.action}
            title={btn.title}
            disabled={previewMode}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-mono"
          >
            {btn.label}
          </button>
        ))}
        <button
          onClick={saveNow}
          className="ml-auto text-xs text-gray-500 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
        >
          Save
        </button>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main editor */}
        <div className="flex-1 overflow-hidden">
          {previewMode ? (
            <div className="h-full overflow-auto p-8">
              <div className="max-w-3xl mx-auto prose prose-invert prose-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {article.contentMd}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <MarkdownEditor
              value={article.contentMd}
              onChange={onContentChange}
              editorRef={editorViewRef}
            />
          )}
        </div>

        {/* Right panel */}
        {rightPanelOpen && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden flex-shrink-0">
            {showNlpPanel && <NlpPanel />}
            {showNlpPanel && showResearchPanel && <div className="border-t border-gray-700" />}
            {showResearchPanel && (
              <div className="flex-1 overflow-auto">
                <ResearchPanel />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
