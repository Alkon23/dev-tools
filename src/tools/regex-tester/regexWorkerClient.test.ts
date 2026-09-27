import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_REGEX_FLAGS } from './regexTester';
import { RegexWorkerClient } from './regexWorkerClient';
import type { RegexWorkerResponse } from './regex.worker';

class FakeWorker {
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessage: ((event: MessageEvent<RegexWorkerResponse>) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();
}

const input = { flags: DEFAULT_REGEX_FLAGS, pattern: 'a', text: 'banana' };

describe('RegexWorkerClient', () => {
  afterEach(() => vi.useRealTimers());

  it('debounces requests and ignores replaced work', () => {
    vi.useFakeTimers();
    const worker = new FakeWorker();
    const client = new RegexWorkerClient({ createWorker: () => worker, debounceMs: 100 });
    const callback = vi.fn();

    client.evaluate(input, callback);
    client.evaluate({ ...input, pattern: 'b' }, callback);
    vi.advanceTimersByTime(100);

    expect(worker.postMessage).toHaveBeenCalledOnce();
    expect(worker.postMessage).toHaveBeenCalledWith(expect.objectContaining({
      id: 2,
      input: expect.objectContaining({ pattern: 'b' }),
    }));
  });

  it('returns the matching worker response', () => {
    vi.useFakeTimers();
    const worker = new FakeWorker();
    const client = new RegexWorkerClient({ createWorker: () => worker, debounceMs: 0 });
    const callback = vi.fn();

    client.evaluate(input, callback);
    vi.runOnlyPendingTimers();
    worker.onmessage?.({ data: {
      id: 1,
      result: { matches: [{ start: 1, end: 2 }], status: 'valid', truncated: false },
    } } as MessageEvent<RegexWorkerResponse>);

    expect(callback).toHaveBeenCalledWith(expect.objectContaining({ status: 'valid' }));
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it('terminates expressions that exceed the timeout', () => {
    vi.useFakeTimers();
    const worker = new FakeWorker();
    const client = new RegexWorkerClient({ createWorker: () => worker, debounceMs: 0, timeoutMs: 50 });
    const callback = vi.fn();

    client.evaluate(input, callback);
    vi.advanceTimersByTime(51);

    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(expect.objectContaining({ status: 'timeout' }));
  });

  it('cleans up pending work on disposal', () => {
    vi.useFakeTimers();
    const worker = new FakeWorker();
    const client = new RegexWorkerClient({ createWorker: () => worker, debounceMs: 0 });

    client.evaluate(input, vi.fn());
    vi.runOnlyPendingTimers();
    client.dispose();

    expect(worker.terminate).toHaveBeenCalledOnce();
  });
});
