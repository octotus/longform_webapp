import { useEffect, useRef } from 'react';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { GFM, Superscript, Subscript } from '@lezer/markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';

interface Props {
  value: string;
  onChange: (val: string) => void;
  editorRef?: React.MutableRefObject<EditorView | null>;
}

export function MarkdownEditor({ value, onChange, editorRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          lineNumbers(),
          markdown({ base: markdownLanguage, extensions: [...GFM, Superscript, Subscript] }),
          oneDark,
          EditorView.inputHandler.of((view, from, to, text) => {
            if (text === '-' && view.state.doc.sliceString(from - 1, from) === '-') {
              view.dispatch({ changes: { from: from - 1, to, insert: '—' }, selection: { anchor: from } });
              return true;
            }
            return false;
          }),
          EditorView.lineWrapping,
          EditorView.updateListener.of(update => {
            if (update.docChanged) onChange(update.state.doc.toString());
          }),
        ],
      }),
      parent: containerRef.current,
    });
    viewRef.current = view;
    if (editorRef) editorRef.current = view;
    return () => { view.destroy(); viewRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only mount once

  // Sync external value changes (e.g. after async loadArticle) into CodeMirror
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  return <div ref={containerRef} className="h-full overflow-auto [&_.cm-editor]:h-full [&_.cm-scroller]:h-full" />;
}
