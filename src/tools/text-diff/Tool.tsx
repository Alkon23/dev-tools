import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor/editor/editor.api.js';
import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker';
import 'monaco-editor/features/codicon/register.js';

(globalThis as typeof globalThis & { MonacoEnvironment: { getWorker: () => Worker } }).MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
};

export default function TextDiffTool() {
  const editorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorContainerRef.current) {
      return;
    }

    const originalModel = monaco.editor.createModel('original text', 'plaintext');
    const modifiedModel = monaco.editor.createModel('modified text', 'plaintext');
    const editor = monaco.editor.createDiffEditor(editorContainerRef.current, {
      automaticLayout: true,
      minimap: { enabled: false },
      modifiedAriaLabel: 'Modified text',
      originalAriaLabel: 'Original text',
      originalEditable: true,
      renderSideBySide: true,
      useInlineViewWhenSpaceIsLimited: true,
    });

    editor.setModel({ original: originalModel, modified: modifiedModel });

    return () => {
      editor.dispose();
      originalModel.dispose();
      modifiedModel.dispose();
    };
  }, []);

  return (
    <section className="tool-card text-diff-tool" aria-label="Text diff">
      <div className="text-diff-editor" ref={editorContainerRef} />
    </section>
  );
}
