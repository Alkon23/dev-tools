import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TextDiffTool from './Tool';

const monacoMock = vi.hoisted(() => {
  const wrappingObserver = { dispose: vi.fn() };
  const originalEditor = {
    onDidLayoutChange: vi.fn<(listener: (layout: { contentWidth: number }) => void) => typeof wrappingObserver>(() => wrappingObserver),
    updateOptions: vi.fn(),
  };
  const editor = {
    dispose: vi.fn(),
    getOriginalEditor: vi.fn(() => originalEditor),
    setModel: vi.fn(),
  };
  const models: Array<{ dispose: ReturnType<typeof vi.fn>; value: string }> = [];

  return {
    createDiffEditor: vi.fn(() => editor),
    createModel: vi.fn((value: string) => {
      const model = { dispose: vi.fn(), value };
      models.push(model);
      return model;
    }),
    editor,
    originalEditor,
    wrappingObserver,
    setTheme: vi.fn(),
    models,
  };
});

vi.mock('monaco-editor/editor/editor.api.js', () => ({
  editor: {
    createDiffEditor: monacoMock.createDiffEditor,
    createModel: monacoMock.createModel,
    setTheme: monacoMock.setTheme,
  },
}));

vi.mock('monaco-editor/features/codicon/register.js', () => ({}));

vi.mock('monaco-editor/editor/editor.worker.js?worker', () => ({
  default: class EditorWorker {},
}));

describe('TextDiffTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    monacoMock.models.length = 0;
  });

  it('creates an editable, responsive diff editor with starter text', () => {
    render(<TextDiffTool />);

    expect(screen.getByRole('region', { name: 'Text diff' })).toBeInTheDocument();
    expect(monacoMock.createModel).toHaveBeenNthCalledWith(1, 'original text', 'plaintext');
    expect(monacoMock.createModel).toHaveBeenNthCalledWith(2, 'modified text', 'plaintext');
    expect(monacoMock.createDiffEditor).toHaveBeenCalledWith(expect.any(HTMLDivElement), expect.objectContaining({
      automaticLayout: true,
      minimap: { enabled: false },
      originalEditable: true,
      useInlineViewWhenSpaceIsLimited: true,
    }));
    expect(monacoMock.editor.setModel).toHaveBeenCalledWith({
      original: monacoMock.models[0],
      modified: monacoMock.models[1],
    });
  });

  it('wraps long lines in both panes without a horizontal scrollbar', () => {
    render(<TextDiffTool />);

    expect(monacoMock.createDiffEditor).toHaveBeenCalledWith(expect.any(HTMLDivElement), expect.objectContaining({
      diffWordWrap: 'on',
      scrollbar: { horizontal: 'hidden' },
      wordWrap: 'on',
    }));
  });

  it('keeps the original responsive editor height', () => {
    render(<TextDiffTool />);

    const container = screen.getByRole('region', { name: 'Text diff' }).firstElementChild;
    expect(container).toHaveClass('h-[clamp(520px,calc(100vh-260px),800px)]', 'max-[760px]:h-[max(480px,calc(100vh-250px))]');
  });

  it('restores original-pane wrapping when returning from inline to side-by-side view', () => {
    render(<TextDiffTool />);

    const onLayoutChange = monacoMock.originalEditor.onDidLayoutChange.mock.calls[0][0];
    onLayoutChange({ contentWidth: -10 });
    expect(monacoMock.originalEditor.updateOptions).not.toHaveBeenCalled();

    onLayoutChange({ contentWidth: 600 });
    expect(monacoMock.originalEditor.updateOptions).toHaveBeenCalledWith({ wordWrapOverride2: 'on' });
  });

  it('disposes the editor and its models on unmount', () => {
    const view = render(<TextDiffTool />);

    view.unmount();

    expect(monacoMock.editor.dispose).toHaveBeenCalledOnce();
    expect(monacoMock.wrappingObserver.dispose).toHaveBeenCalledOnce();
    expect(monacoMock.models[0].dispose).toHaveBeenCalledOnce();
    expect(monacoMock.models[1].dispose).toHaveBeenCalledOnce();
  });
});
