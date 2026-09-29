import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegexTesterTool from './Tool';
import type { RegexWorkerResult } from './regexTester';

const monacoMock = vi.hoisted(() => {
  const collections: Array<{ clear: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> }> = [];
  const editors: Array<{ createDecorationsCollection: ReturnType<typeof vi.fn>; dispose: ReturnType<typeof vi.fn> }> = [];
  const models: Array<ReturnType<typeof createModel>> = [];

  function createModel(value: string, language: string) {
    let listener: (() => void) | undefined;
    return {
      dispose: vi.fn(),
      getFullModelRange: vi.fn(() => ({ startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: value.length + 1 })),
      getPositionAt: vi.fn((offset: number) => ({ lineNumber: 1, column: offset + 1 })),
      getValue: vi.fn(() => value),
      language,
      onDidChangeContent: vi.fn((nextListener: () => void) => {
        listener = nextListener;
        return { dispose: vi.fn() };
      }),
      triggerChange: () => listener?.(),
      value,
    };
  }

  return {
    collections,
    create: vi.fn(() => {
      const collection = { clear: vi.fn(), set: vi.fn() };
      const editor = { createDecorationsCollection: vi.fn(() => collection), dispose: vi.fn() };
      collections.push(collection);
      editors.push(editor);
      return editor;
    }),
    createModel: vi.fn((value: string, language: string) => {
      const model = createModel(value, language);
      models.push(model);
      return model;
    }),
    defineTheme: vi.fn(),
    editors,
    getLanguages: vi.fn(() => []),
    models,
    register: vi.fn(),
    setModelMarkers: vi.fn(),
    setTheme: vi.fn(),
    setMonarchTokensProvider: vi.fn(),
  };
});

const workerClientMock = vi.hoisted(() => ({
  callback: null as ((result: RegexWorkerResult) => void) | null,
  dispose: vi.fn(),
  evaluate: vi.fn((_input: unknown, callback: (result: RegexWorkerResult) => void) => {
    workerClientMock.callback = callback;
  }),
}));

vi.mock('monaco-editor/editor/editor.api.js', () => ({
  MarkerSeverity: { Error: 8 },
  Range: class Range {
    constructor(
      public startLineNumber: number,
      public startColumn: number,
      public endLineNumber: number,
      public endColumn: number,
    ) {}
  },
  editor: {
    create: monacoMock.create,
    createModel: monacoMock.createModel,
    defineTheme: monacoMock.defineTheme,
    setModelMarkers: monacoMock.setModelMarkers,
    setTheme: monacoMock.setTheme,
  },
  languages: {
    getLanguages: monacoMock.getLanguages,
    register: monacoMock.register,
    setMonarchTokensProvider: monacoMock.setMonarchTokensProvider,
  },
}));

vi.mock('monaco-editor/features/codicon/register.js', () => ({}));
vi.mock('monaco-editor/editor/editor.worker.js?worker', () => ({ default: class EditorWorker {} }));
vi.mock('./regexWorkerClient', () => ({
  RegexWorkerClient: class RegexWorkerClient {
    dispose = workerClientMock.dispose;
    evaluate = workerClientMock.evaluate;
  },
}));

describe('RegexTesterTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    monacoMock.collections.length = 0;
    monacoMock.editors.length = 0;
    monacoMock.models.length = 0;
    workerClientMock.callback = null;
  });

  it('creates accessible pattern and text editors with a cheatsheet', () => {
    render(<RegexTesterTool />);

    expect(screen.getByRole('region', { name: 'Regex tester' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'JavaScript regex cheatsheet' })).toBeInTheDocument();
    expect(monacoMock.createModel).toHaveBeenNthCalledWith(1, '([A-Z])\\w+', 'javascript-regexp');
    expect(monacoMock.createModel).toHaveBeenNthCalledWith(2, expect.stringContaining('Regex Tester'), 'plaintext');
    expect(monacoMock.create).toHaveBeenNthCalledWith(1, expect.any(HTMLDivElement), expect.objectContaining({
      ariaLabel: 'Regular expression pattern',
      lineNumbers: 'off',
    }));
    expect(monacoMock.create).toHaveBeenNthCalledWith(2, expect.any(HTMLDivElement), expect.objectContaining({
      ariaLabel: 'Test text',
      wordWrap: 'on',
    }));
  });

  it('evaluates flag changes and renders match decorations', async () => {
    const user = userEvent.setup();
    render(<RegexTesterTool />);

    await user.click(screen.getByLabelText(/Ignore case/));
    expect(workerClientMock.evaluate).toHaveBeenLastCalledWith(
      expect.objectContaining({ flags: expect.objectContaining({ ignoreCase: true }) }),
      expect.any(Function),
    );

    act(() => workerClientMock.callback?.({
      matches: [{ start: 0, end: 5 }, { start: 12, end: 12 }],
      status: 'valid',
      truncated: false,
    }));

    expect(screen.getByText('2 matches')).toBeInTheDocument();
    expect(monacoMock.collections[1].set).toHaveBeenCalledWith([
      expect.objectContaining({ options: expect.objectContaining({ inlineClassName: 'regex-match-highlight' }) }),
      expect.objectContaining({ options: expect.objectContaining({ after: expect.any(Object) }) }),
    ]);
  });

  it('shows syntax errors, clears matches, and disposes editor resources', () => {
    const view = render(<RegexTesterTool />);

    act(() => workerClientMock.callback?.({
      matches: [],
      message: 'Invalid regular expression',
      status: 'error',
      truncated: false,
    }));

    expect(screen.getByText('Invalid regular expression')).toBeInTheDocument();
    expect(monacoMock.setModelMarkers).toHaveBeenCalledWith(
      monacoMock.models[0],
      'regex-tester',
      [expect.objectContaining({ severity: 8 })],
    );
    expect(monacoMock.collections[1].clear).toHaveBeenCalled();

    view.unmount();
    expect(monacoMock.editors.every((editor) => editor.dispose.mock.calls.length === 1)).toBe(true);
    expect(monacoMock.models.every((model) => model.dispose.mock.calls.length === 1)).toBe(true);
    expect(workerClientMock.dispose).toHaveBeenCalledOnce();
  });
});
