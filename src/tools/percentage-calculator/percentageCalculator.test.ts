import { describe, expect, it } from 'vitest';
import {
  calculatePercentageChange,
  calculatePercentageOf,
  calculatePercentageRatio,
  formatPercentageResult,
  parsePercentageInput,
} from './percentageCalculator';

describe('percentage calculations', () => {
  it('calculates the three reference formulas', () => {
    expect(calculatePercentageOf(123, 456)).toBe(560.88);
    expect(calculatePercentageRatio(123, 456)).toBeCloseTo(26.973684210526315);
    expect(calculatePercentageChange(123, 456)).toBeCloseTo(270.7317073170732);
  });

  it('supports decimal, negative, and scientific notation input', () => {
    expect(parsePercentageInput('-12.5')).toEqual({ status: 'valid', value: -12.5 });
    expect(parsePercentageInput('.25')).toEqual({ status: 'valid', value: 0.25 });
    expect(parsePercentageInput('1e3')).toEqual({ status: 'valid', value: 1000 });
    expect(calculatePercentageChange(-50, -25)).toBe(-50);
  });

  it('distinguishes empty input from malformed or non-finite input', () => {
    expect(parsePercentageInput('  ')).toEqual({ status: 'empty' });
    expect(parsePercentageInput('12 percent')).toEqual({ status: 'invalid' });
    expect(parsePercentageInput('0x10')).toEqual({ status: 'invalid' });
    expect(parsePercentageInput('1e999')).toEqual({ status: 'invalid' });
  });

  it('rejects calculations with a zero denominator or non-finite result', () => {
    expect(calculatePercentageRatio(10, 0)).toBeUndefined();
    expect(calculatePercentageChange(0, 10)).toBeUndefined();
    expect(calculatePercentageOf(Number.MAX_VALUE, Number.MAX_VALUE)).toBeUndefined();
  });

  it('formats results to six decimal places without trailing or negative zeroes', () => {
    expect(formatPercentageResult(26.973684210526315)).toBe('26.973684');
    expect(formatPercentageResult(560.88)).toBe('560.88');
    expect(formatPercentageResult(1)).toBe('1');
    expect(formatPercentageResult(-0.0000001)).toBe('0');
  });
});
