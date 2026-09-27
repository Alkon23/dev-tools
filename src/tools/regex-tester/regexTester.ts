export interface RegexFlags {
  global: boolean;
  ignoreCase: boolean;
  multiline: boolean;
  dotAll: boolean;
  sticky: boolean;
  unicodeMode: '' | 'u' | 'v';
}

export interface RegexMatchRange {
  end: number;
  start: number;
}

export interface RegexEvaluationInput {
  flags: RegexFlags;
  pattern: string;
  text: string;
}

export type RegexEvaluation =
  | { matches: []; status: 'idle'; truncated: false }
  | { matches: RegexMatchRange[]; status: 'valid'; truncated: boolean }
  | { matches: []; message: string; status: 'error'; truncated: false };

export type RegexWorkerResult = RegexEvaluation
  | { matches: []; message: string; status: 'timeout'; truncated: false };

export const DEFAULT_REGEX_FLAGS: Readonly<RegexFlags> = {
  global: true,
  ignoreCase: false,
  multiline: false,
  dotAll: false,
  sticky: false,
  unicodeMode: '',
};

export const MAX_REGEX_MATCHES = 500;

export function buildRegexFlags(flags: Readonly<RegexFlags>, includeIndices = false): string {
  return [
    includeIndices ? 'd' : '',
    flags.global ? 'g' : '',
    flags.ignoreCase ? 'i' : '',
    flags.multiline ? 'm' : '',
    flags.dotAll ? 's' : '',
    flags.unicodeMode,
    flags.sticky ? 'y' : '',
  ].join('');
}

function advanceStringIndex(value: string, index: number, unicode: boolean): number {
  if (!unicode || index + 1 >= value.length) {
    return index + 1;
  }

  const first = value.charCodeAt(index);
  const second = value.charCodeAt(index + 1);
  const isSurrogatePair = first >= 0xd800 && first <= 0xdbff && second >= 0xdc00 && second <= 0xdfff;
  return index + (isSurrogatePair ? 2 : 1);
}

export function evaluateRegex(
  input: RegexEvaluationInput,
  limit = MAX_REGEX_MATCHES,
): RegexEvaluation {
  if (input.pattern === '') {
    return { matches: [], status: 'idle', truncated: false };
  }

  try {
    const expression = new RegExp(input.pattern, buildRegexFlags(input.flags, true));
    const matches: RegexMatchRange[] = [];
    const shouldContinue = input.flags.global;
    const usesUnicode = input.flags.unicodeMode !== '';
    let match = expression.exec(input.text);

    while (match) {
      matches.push({ start: match.index, end: match.index + match[0].length });

      if (!shouldContinue) {
        break;
      }

      if (matches.length >= limit) {
        return { matches, status: 'valid', truncated: true };
      }

      if (match[0] === '') {
        expression.lastIndex = advanceStringIndex(input.text, expression.lastIndex, usesUnicode);
      }

      match = expression.exec(input.text);
    }

    return { matches, status: 'valid', truncated: false };
  } catch (error) {
    return {
      matches: [],
      message: error instanceof Error ? error.message : 'This regular expression is invalid.',
      status: 'error',
      truncated: false,
    };
  }
}

export function supportsUnicodeSets(): boolean {
  try {
    new RegExp('', 'v');
    return true;
  } catch {
    return false;
  }
}
