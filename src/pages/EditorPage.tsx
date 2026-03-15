import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { EditorView } from '@codemirror/view';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkSupersub from 'remark-supersub';
import { useEditorStore } from '../stores/editorStore';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { useFocusStore } from '../stores/focusStore';
import { storeImage, resolveImageUrl } from '../utils/imageStore';

function NlpPanel() {
  const { nlpResult } = useEditorStore();
  if (!nlpResult) return (
    <div className="p-4 text-gray-500 text-sm">Save or wait 3 seconds for NLP analysis.</div>
  );
  const { readabilityGrade, passivePct, hedgePct, wordCount, sentenceCount } = nlpResult;

  if (wordCount < 20 || sentenceCount < 2) return (
    <div className="p-4 space-y-2">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">NLP Analysis</h3>
      <div className="text-xs text-gray-400">{wordCount} words &bull; {sentenceCount} sentences</div>
      <p className="text-xs text-yellow-500">Write at least 20 words across 2+ sentences for meaningful analysis.</p>
    </div>
  );

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
  const { researchQuery, researchResponse, researchLoading, researchSource, corpusTagFilter, availableCorpusTags, setResearchQuery, setResearchSource, toggleCorpusTag, loadCorpusTags, submitResearchQuery } = useEditorStore();

  useEffect(() => {
    if (researchSource === 'LOCAL') loadCorpusTags();
  }, [researchSource, loadCorpusTags]);

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
          onClick={() => { setResearchSource('LOCAL'); loadCorpusTags(); }}
          className={`flex-1 text-xs py-1.5 rounded transition-colors ${researchSource === 'LOCAL' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
        >
          Local (Ollama)
        </button>
      </div>

      {researchSource === 'LOCAL' && availableCorpusTags.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Filter corpus by tag <span className="text-gray-600">(none = all docs)</span></p>
          <div className="flex flex-wrap gap-1">
            {availableCorpusTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleCorpusTag(tag)}
                className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                  corpusTagFilter.includes(tag)
                    ? 'bg-amber-700 border-amber-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {corpusTagFilter.length > 0 && (
            <p className="text-xs text-amber-400 mt-1">{corpusTagFilter.length} tag{corpusTagFilter.length > 1 ? 's' : ''} selected</p>
          )}
        </div>
      )}

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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function EditorPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const editorViewRef = useRef<EditorView | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastValidTitleRef = useRef<string>('');
  const [previewMode, setPreviewMode] = useState(false);

  // Image panel state
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [imgAlt, setImgAlt] = useState('');
  const [imgTab, setImgTab] = useState<'url' | 'file'>('url');

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

  const { sessionActive, remainingSeconds, nudgeVisible, endSession, dismissNudge } = useFocusStore();

  useEffect(() => {
    if (articleId) loadArticle(articleId);
  }, [articleId, loadArticle]);

  // Track last non-empty title for revert-on-blur
  useEffect(() => {
    if (article.title.trim()) lastValidTitleRef.current = article.title;
  }, [article.title]);

  const handleTitleBlur = () => {
    if (!article.title.trim()) {
      const fallback = lastValidTitleRef.current || 'Untitled';
      onTitleChange(fallback);
    }
  };

  // Auto-dismiss nudge after 6 seconds
  useEffect(() => {
    if (!nudgeVisible) return;
    const t = setTimeout(() => dismissNudge(), 6000);
    return () => clearTimeout(t);
  }, [nudgeVisible, dismissNudge]);

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

  const insertTable = () => {
    const view = editorViewRef.current;
    if (!view) return;
    const { from } = view.state.selection.main;
    const table = '\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell     | Cell     | Cell     |\n';
    view.dispatch({ changes: { from, to: from, insert: table }, selection: { anchor: from + table.length } });
    view.focus();
  };

  const handleInsertImageUrl = () => {
    insertAtCursor('![' + imgAlt + '](', imgUrl + ')');
    setShowImagePanel(false);
    setImgUrl('');
    setImgAlt('');
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const id = storeImage(dataUrl);
      const alt = file.name.replace(/[[\]]/g, '');
      insertAtCursor(`![${alt}](likhatu-img://`, `${id})`);
      setShowImagePanel(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const toolbarButtons = [
    { label: 'B', title: 'Bold', action: () => insertAtCursor('**', '**') },
    { label: 'I', title: 'Italic', action: () => insertAtCursor('_', '_') },
    { label: 'S̶', title: 'Strikethrough', action: () => insertAtCursor('~~', '~~') },
    { label: 'H1', title: 'Heading 1', action: () => insertAtCursor('# ') },
    { label: 'H2', title: 'Heading 2', action: () => insertAtCursor('## ') },
    { label: 'H3', title: 'Heading 3', action: () => insertAtCursor('### ') },
    { label: '"', title: 'Blockquote', action: () => insertAtCursor('> ') },
    { label: '⊞', title: 'Insert Table', action: insertTable },
    { label: '`·`', title: 'Inline Code', action: () => insertAtCursor('`', '`') },
    { label: '```', title: 'Code Block', action: () => insertAtCursor('\n```\n', '\n```\n') },
    { label: 'x²', title: 'Superscript', action: () => insertAtCursor('^', '^') },
    { label: 'x₂', title: 'Subscript', action: () => insertAtCursor('~', '~') },
    { label: '[@]', title: 'In-text citation', action: () => insertAtCursor('[@ref]') },
    { label: 'IMG', title: 'Insert Image', action: () => setShowImagePanel(p => !p) },
  ];

  const rightPanelOpen = showNlpPanel || showResearchPanel;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Top bar */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleBack}
          className="text-sm px-3 py-1.5 rounded border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
        >
          ← Back
        </button>
        <input
          type="text"
          value={article.title}
          onChange={e => onTitleChange(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="Title required"
          className="flex-1 bg-transparent text-white text-base font-medium placeholder-gray-600 focus:outline-none px-2"
        />
        <span className="text-xs text-gray-500 mr-2">{article.wordCount.toLocaleString()} words</span>
        {/* Timer chip */}
        {sessionActive && (
          <span className="focus-timer-chip bg-blue-900 text-blue-200 rounded px-2 py-1 text-xs flex items-center gap-2">
            ⏱ {formatTime(remainingSeconds)}
            <button
              onClick={endSession}
              className="focus-timer-end text-blue-300 hover:text-white transition-colors"
            >
              End
            </button>
          </span>
        )}
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
        {sessionActive ? (
          <span className="text-xs text-gray-600 px-2 py-1 rounded cursor-not-allowed" title="Session in progress">Focus</span>
        ) : (
          <Link
            to={`/focus/${article.id}`}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
          >
            Focus
          </Link>
        )}
      </header>

      {/* Formatting toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-1 flex items-center gap-1 flex-shrink-0">
        {toolbarButtons.map(btn => (
          <button
            key={btn.label}
            onClick={btn.action}
            title={btn.title}
            disabled={previewMode}
            className={`text-xs px-2 py-1 rounded transition-colors font-mono disabled:opacity-40 disabled:cursor-not-allowed ${
              btn.label === 'IMG' && showImagePanel
                ? 'bg-blue-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {btn.label}
          </button>
        ))}
        <button
          onClick={async () => { await saveNow(); setShowSaved(true); setTimeout(() => setShowSaved(false), 2000); }}
          className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
        >
          <span className={`inline-block w-2 h-2 rounded-full transition-colors duration-300 ${showSaved ? 'bg-green-400' : 'bg-gray-600'}`} />
          Save
        </button>
      </div>

      {/* Image panel */}
      {showImagePanel && (
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setImgTab('url')}
              className={`text-xs px-3 py-1 rounded transition-colors ${imgTab === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
            >
              URL
            </button>
            <button
              onClick={() => setImgTab('file')}
              className={`text-xs px-3 py-1 rounded transition-colors ${imgTab === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
            >
              File
            </button>
            <button
              onClick={() => { setShowImagePanel(false); setImgUrl(''); setImgAlt(''); }}
              className="ml-auto text-xs text-gray-500 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
            >
              ×
            </button>
          </div>
          {imgTab === 'url' ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={imgAlt}
                onChange={e => setImgAlt(e.target.value)}
                placeholder="Alt text"
                className="w-32 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={imgUrl}
                onChange={e => setImgUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && imgUrl.trim()) handleInsertImageUrl(); }}
                placeholder="https://example.com/image.png"
                className="flex-1 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleInsertImageUrl}
                disabled={!imgUrl.trim()}
                className="text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-3 py-1 rounded transition-colors"
              >
                Insert
              </button>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors"
              >
                Choose image...
              </button>
            </div>
          )}
        </div>
      )}

      {/* Nudge banner (F8) */}
      {nudgeVisible && (
        <div className="bg-green-800/50 border-b border-green-700 px-4 py-2 text-sm text-green-300 flex items-center justify-between flex-shrink-0">
          <span>Focus session complete! Great work.</span>
          <button
            onClick={dismissNudge}
            className="text-green-400 hover:text-white ml-4 transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* Editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main editor */}
        <div className="flex-1 overflow-hidden">
          {previewMode ? (
            <div className="h-full overflow-auto p-8">
              <div className="max-w-3xl mx-auto text-gray-300 leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkSupersub, [remarkGfm, { singleTilde: false }]]}
                  urlTransform={(url) => resolveImageUrl(url)}
                  components={{
                  h1: ({children}) => <h1 className="text-3xl font-bold text-gray-100 mb-4 mt-6 border-b border-gray-700 pb-2">{children}</h1>,
                  h2: ({children}) => <h2 className="text-2xl font-semibold text-gray-100 mb-3 mt-5">{children}</h2>,
                  h3: ({children}) => <h3 className="text-xl font-semibold text-gray-200 mb-2 mt-4">{children}</h3>,
                  h4: ({children}) => <h4 className="text-lg font-semibold text-gray-200 mb-2 mt-3">{children}</h4>,
                  p: ({children}) => <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>,
                  strong: ({children}) => <strong className="font-bold text-white">{children}</strong>,
                  em: ({children}) => <em className="italic text-gray-200">{children}</em>,
                  del: ({children}) => <del className="line-through text-gray-500">{children}</del>,
                  blockquote: ({children}) => <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-400 my-3">{children}</blockquote>,
                  code: ({className, children, ...props}: any) => {
                    const isBlock = className?.startsWith('language-');
                    return isBlock
                      ? <code className="block bg-gray-800 text-blue-300 p-4 rounded text-sm font-mono overflow-auto">{children}</code>
                      : <code className="bg-gray-800 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>;
                  },
                  pre: ({children}) => <pre className="bg-gray-800 rounded overflow-auto my-3">{children}</pre>,
                  ul: ({children}) => <ul className="list-disc pl-5 space-y-1 text-gray-300 mb-3">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal pl-5 space-y-1 text-gray-300 mb-3">{children}</ol>,
                  li: ({children}) => <li className="text-gray-300">{children}</li>,
                  a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">{children}</a>,
                  table: ({children}) => <div className="overflow-x-auto my-4"><table className="w-full border-collapse text-sm">{children}</table></div>,
                  thead: ({children}) => <thead className="bg-gray-800">{children}</thead>,
                  tbody: ({children}) => <tbody className="divide-y divide-gray-700">{children}</tbody>,
                  tr: ({children}) => <tr className="hover:bg-gray-800/50">{children}</tr>,
                  th: ({children}) => <th className="px-4 py-2 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-gray-600">{children}</th>,
                  td: ({children}) => <td className="px-4 py-2 text-gray-300">{children}</td>,
                  hr: () => <hr className="border-gray-700 my-6" />,
                  img: ({node: _node, ...props}) => <img {...props} className="max-w-full h-auto rounded my-3" />,
                }}>
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
