/// <reference lib="webworker" />

import { evaluateRegex, type RegexEvaluationInput } from './regexTester';

export interface RegexWorkerRequest {
  id: number;
  input: RegexEvaluationInput;
}

export interface RegexWorkerResponse {
  id: number;
  result: ReturnType<typeof evaluateRegex>;
}

self.onmessage = (event: MessageEvent<RegexWorkerRequest>) => {
  const response: RegexWorkerResponse = {
    id: event.data.id,
    result: evaluateRegex(event.data.input),
  };
  self.postMessage(response);
};
