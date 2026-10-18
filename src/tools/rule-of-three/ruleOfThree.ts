export type ProportionMode = 'direct' | 'inverse';
export type ParsedNumber =
  | { status: 'empty' | 'invalid' }
  | { status: 'valid'; value: number };

export function parseNumber(input: string): ParsedNumber {
  const text = input.trim();
  if (!text) return { status: 'empty' };
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) {
    return { status: 'invalid' };
  }
  const value = Number(text);
  return Number.isFinite(value) ? { status: 'valid', value } : { status: 'invalid' };
}

export function calculateRuleOfThree(a: number, b: number, c: number, mode: ProportionMode): number | undefined {
  if (![a, b, c].every(Number.isFinite)) return undefined;
  const denominator = mode === 'direct' ? a : c;
  const factor = mode === 'direct' ? c : a;
  if (denominator === 0) return undefined;
  if (b === 0 || factor === 0) return 0;

  // Try alternate operation orders to avoid intermediate overflow or underflow.
  const candidates = [b * factor / denominator, (b / denominator) * factor, (factor / denominator) * b];
  return candidates.find((value) => Number.isFinite(value) && value !== 0);
}

export function formatResult(value: number): string {
  return Object.is(value, -0) ? '0' : Number(value.toPrecision(12)).toString();
}
