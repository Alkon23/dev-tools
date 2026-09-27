import RegexWorker from './regex.worker.ts?worker';
import { evaluateRegex, type RegexEvaluationInput, type RegexWorkerResult } from './regexTester';
import type { RegexWorkerRequest, RegexWorkerResponse } from './regex.worker';

interface WorkerLike {
  onerror: ((event: ErrorEvent) => void) | null;
  onmessage: ((event: MessageEvent<RegexWorkerResponse>) => void) | null;
  postMessage(message: RegexWorkerRequest): void;
  terminate(): void;
}

interface RegexWorkerClientOptions {
  createWorker?: () => WorkerLike;
  debounceMs?: number;
  timeoutMs?: number;
}

const canUseWorkers = typeof Worker !== 'undefined';

export class RegexWorkerClient {
  private activeRequestId: number | null = null;
  private callback: ((result: RegexWorkerResult) => void) | null = null;
  private readonly createWorker?: () => WorkerLike;
  private readonly debounceMs: number;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private requestId = 0;
  private readonly timeoutMs: number;
  private timeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private worker: WorkerLike | null = null;

  constructor(options: RegexWorkerClientOptions = {}) {
    this.createWorker = options.createWorker ?? (canUseWorkers ? () => new RegexWorker() : undefined);
    this.debounceMs = options.debounceMs ?? 140;
    this.timeoutMs = options.timeoutMs ?? 800;
  }

  evaluate(input: RegexEvaluationInput, callback: (result: RegexWorkerResult) => void): void {
    this.cancelPending();
    const id = ++this.requestId;
    this.callback = callback;
    this.debounceTimer = setTimeout(() => this.dispatch(id, input), this.debounceMs);
  }

  dispose(): void {
    this.cancelPending();
    this.callback = null;
  }

  private dispatch(id: number, input: RegexEvaluationInput): void {
    this.debounceTimer = null;

    if (!this.createWorker) {
      this.callback?.(evaluateRegex(input));
      return;
    }

    this.activeRequestId = id;
    this.worker = this.createWorker();
    this.worker.onmessage = (event) => {
      if (event.data.id !== this.activeRequestId) {
        return;
      }
      this.clearTimeout();
      this.activeRequestId = null;
      this.worker?.terminate();
      this.worker = null;
      this.callback?.(event.data.result);
    };
    this.worker.onerror = () => {
      if (id !== this.activeRequestId) {
        return;
      }
      this.finishWithError('The regex evaluator could not complete this request.');
    };
    this.worker.postMessage({ id, input });
    this.timeoutTimer = setTimeout(() => {
      if (id === this.activeRequestId) {
        this.finishWithTimeout();
      }
    }, this.timeoutMs);
  }

  private cancelPending(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.clearTimeout();
    this.activeRequestId = null;
    this.worker?.terminate();
    this.worker = null;
  }

  private clearTimeout(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }

  private finishWithError(message: string): void {
    this.cancelPending();
    this.callback?.({ matches: [], message, status: 'error', truncated: false });
  }

  private finishWithTimeout(): void {
    this.cancelPending();
    this.callback?.({
      matches: [],
      message: 'Evaluation took too long. This expression may cause excessive backtracking.',
      status: 'timeout',
      truncated: false,
    });
  }
}
