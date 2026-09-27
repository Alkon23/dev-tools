export type ParsedPercentageInput =
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'valid'; value: number };

export function parsePercentageInput(input: string): ParsedPercentageInput {
  const value = input.trim();
  if (!value) {
    return { status: 'empty' };
  }

  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) {
    return { status: 'invalid' };
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue)
    ? { status: 'valid', value: parsedValue }
    : { status: 'invalid' };
}

export function calculatePercentageOf(percentage: number, value: number) {
  const result = (percentage / 100) * value;
  return Number.isFinite(result) ? result : undefined;
}

export function calculatePercentageRatio(part: number, whole: number) {
  if (whole === 0) {
    return undefined;
  }

  const result = (part / whole) * 100;
  return Number.isFinite(result) ? result : undefined;
}

export function calculatePercentageChange(from: number, to: number) {
  if (from === 0) {
    return undefined;
  }

  const result = ((to - from) / from) * 100;
  return Number.isFinite(result) ? result : undefined;
}

export function formatPercentageResult(value: number) {
  const roundedValue = Number(value.toFixed(6));
  return Object.is(roundedValue, -0) ? '0' : roundedValue.toString();
}
