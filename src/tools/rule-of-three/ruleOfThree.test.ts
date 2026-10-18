import { describe, expect, it } from 'vitest';
import { calculateRuleOfThree, formatResult, parseNumber } from './ruleOfThree';

describe('rule of three', () => {
  it('calculates direct and inverse proportions', () => {
    expect(calculateRuleOfThree(2, 10, 5, 'direct')).toBe(25);
    expect(calculateRuleOfThree(4, 6, 8, 'inverse')).toBe(3);
    expect(calculateRuleOfThree(2.5, -10, 5, 'direct')).toBe(-20);
    expect(calculateRuleOfThree(2, 0, 5, 'direct')).toBe(0);
    expect(calculateRuleOfThree(0, 6, 8, 'inverse')).toBe(0);
  });

  it('rejects zero divisors and non-finite results or operands', () => {
    expect(calculateRuleOfThree(0, 10, 5, 'direct')).toBeUndefined();
    expect(calculateRuleOfThree(4, 6, 0, 'inverse')).toBeUndefined();
    expect(calculateRuleOfThree(1, Infinity, 5, 'direct')).toBeUndefined();
    expect(calculateRuleOfThree(NaN, 6, 8, 'inverse')).toBeUndefined();
    expect(calculateRuleOfThree(1e-300, 1e300, 1e300, 'direct')).toBeUndefined();
    expect(calculateRuleOfThree(1e300, 1e-300, 1e-300, 'direct')).toBeUndefined();
  });

  it('avoids intermediate overflow and preserves small results', () => {
    expect(calculateRuleOfThree(1e200, 1e200, 1e200, 'direct')).toBe(1e200);
    expect(calculateRuleOfThree(1e-200, 1e-200, 1e-200, 'direct')).toBe(1e-200);
    expect(formatResult(1e-10)).toBe('1e-10');
    expect(formatResult(1 / 3)).toBe('0.333333333333');
    expect(formatResult(-0)).toBe('0');
  });

  it('distinguishes empty, malformed, and numeric input', () => {
    expect(parseNumber('  ')).toEqual({ status: 'empty' });
    for (const input of ['12 items', '0x10', '1,5', 'Infinity', '1e999', '.', '1e']) {
      expect(parseNumber(input)).toEqual({ status: 'invalid' });
    }
    expect(parseNumber(' -2.5e2 ')).toEqual({ status: 'valid', value: -250 });
    expect(parseNumber('.5')).toEqual({ status: 'valid', value: 0.5 });
  });
});
