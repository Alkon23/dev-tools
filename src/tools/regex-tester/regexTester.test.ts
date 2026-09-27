import { describe, expect, it } from 'vitest';
import { DEFAULT_REGEX_FLAGS, buildRegexFlags, evaluateRegex } from './regexTester';

describe('regex evaluation', () => {
  it('builds flags in a stable order', () => {
    expect(buildRegexFlags({
      global: true,
      ignoreCase: true,
      multiline: true,
      dotAll: true,
      sticky: true,
      unicodeMode: 'u',
    })).toBe('gimsuy');
  });

  it('treats a blank pattern as idle', () => {
    expect(evaluateRegex({ pattern: '', text: 'abc', flags: DEFAULT_REGEX_FLAGS })).toEqual({
      matches: [],
      status: 'idle',
      truncated: false,
    });
  });

  it('returns every global match range', () => {
    expect(evaluateRegex({ pattern: '[A-Z]\\w+', text: 'Regex and Testing tools', flags: DEFAULT_REGEX_FLAGS })).toEqual({
      matches: [{ start: 0, end: 5 }, { start: 10, end: 17 }],
      status: 'valid',
      truncated: false,
    });
  });

  it('stops after one match when global matching is disabled', () => {
    expect(evaluateRegex({
      pattern: 'a',
      text: 'banana',
      flags: { ...DEFAULT_REGEX_FLAGS, global: false },
    })).toMatchObject({ matches: [{ start: 1, end: 2 }] });
  });

  it('applies case-insensitive, multiline, and dot-all flags', () => {
    expect(evaluateRegex({
      pattern: '^a.*z$',
      text: 'A\nZ',
      flags: { ...DEFAULT_REGEX_FLAGS, dotAll: true, ignoreCase: true, multiline: true },
    })).toMatchObject({ matches: [{ start: 0, end: 3 }] });
  });

  it('returns syntax errors without throwing', () => {
    const result = evaluateRegex({ pattern: '(', text: 'abc', flags: DEFAULT_REGEX_FLAGS });

    expect(result.status).toBe('error');
    expect(result).toHaveProperty('message');
  });

  it('retains zero-width matches and terminates', () => {
    expect(evaluateRegex({ pattern: '(?=a)', text: 'aaa', flags: DEFAULT_REGEX_FLAGS })).toEqual({
      matches: [{ start: 0, end: 0 }, { start: 1, end: 1 }, { start: 2, end: 2 }],
      status: 'valid',
      truncated: false,
    });
  });

  it('advances zero-width Unicode matches by code point', () => {
    const result = evaluateRegex({
      pattern: '(?=.)',
      text: '😀a',
      flags: { ...DEFAULT_REGEX_FLAGS, unicodeMode: 'u' },
    });

    expect(result).toMatchObject({ matches: [{ start: 0, end: 0 }, { start: 2, end: 2 }] });
  });

  it('caps dense results and marks them as truncated', () => {
    expect(evaluateRegex({ pattern: '.', text: 'abcdef', flags: DEFAULT_REGEX_FLAGS }, 3)).toEqual({
      matches: [{ start: 0, end: 1 }, { start: 1, end: 2 }, { start: 2, end: 3 }],
      status: 'valid',
      truncated: true,
    });
  });
});
