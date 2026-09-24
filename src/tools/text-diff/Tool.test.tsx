import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TextDiffTool from './Tool';

const monacoMock = vi.hoisted(() => {
  const editor = {
    dispose: vi.fn(),
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
    models,
  };
});

vi.mock('monaco-editor/editor/editor.api.js', () => ({
  editor: {
    createDiffEditor: monacoMock.createDiffEditor,
    createModel: monacoMock.createModel,
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

  it('disposes the editor and its models on unmount', () => {
    const view = render(<TextDiffTool />);

    view.unmount();

    expect(monacoMock.editor.dispose).toHaveBeenCalledOnce();
    expect(monacoMock.models[0].dispose).toHaveBeenCalledOnce();
    expect(monacoMock.models[1].dispose).toHaveBeenCalledOnce();
  });
});
