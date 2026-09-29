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
    const syncTheme = () => monaco.editor.setTheme(document.documentElement.dataset.theme === 'dark' ? 'vs-dark' : 'vs');
    syncTheme();
    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
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
      themeObserver.disconnect();
      editor.dispose();
      originalModel.dispose();
      modifiedModel.dispose();
    };
  }, []);

  return (
    <section className="tool-card overflow-hidden p-0" aria-label="Text diff">
      <div className="h-[clamp(520px,calc(100vh-260px),800px)] min-w-0 w-full max-[760px]:h-[max(480px,calc(100vh-250px))]" ref={editorContainerRef} />
    </section>
  );
}
