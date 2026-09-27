import { describe, expect, it } from 'vitest';
import { cleanIdentifier, getExpectedCheckDigit, validateIdentifier } from './identifierValidator';

describe('identifier validation', () => {
  it('normalizes spaces, hyphens, and lowercase check characters', () => {
    expect(cleanIdentifier(' 2434-561x ')).toBe('2434561X');
  });

  it('validates ISSN identifiers and reports the expected check character', () => {
    expect(validateIdentifier('issn', '2049-3630').status).toBe('valid');
    expect(validateIdentifier('issn', '2434-561X').status).toBe('valid');
    expect(validateIdentifier('issn', '20493631')).toMatchObject({
      status: 'invalid',
      expectedCheckDigit: '0',
    });
  });

  it('validates ISBN-10 identifiers, including an X check character', () => {
    expect(validateIdentifier('isbn10', '0-306-40615-2').status).toBe('valid');
    expect(validateIdentifier('isbn10', '0-8044-2957-X').status).toBe('valid');
    expect(validateIdentifier('isbn10', '0306406153')).toMatchObject({
      status: 'invalid',
      expectedCheckDigit: '2',
    });
  });

  it('validates ISBN-13 checksums and rejects non-book EAN prefixes', () => {
    expect(validateIdentifier('isbn13', '978-0-306-40615-7').status).toBe('valid');
    expect(validateIdentifier('isbn13', '979-10-90636-07-1').status).toBe('valid');
    expect(validateIdentifier('isbn13', '4006381333931')).toMatchObject({
      status: 'invalid',
      message: 'ISBN-13 must begin with the 978 or 979 book prefix.',
    });
  });

  it('distinguishes empty, incomplete, and malformed values', () => {
    expect(validateIdentifier('issn', '').status).toBe('empty');
    expect(validateIdentifier('issn', '1234').status).toBe('incomplete');
    expect(validateIdentifier('isbn13', '97803064061X7').status).toBe('invalid');
  });

  it('calculates check digits for each format', () => {
    expect(getExpectedCheckDigit('issn', '2434561')).toBe('X');
    expect(getExpectedCheckDigit('isbn10', '080442957')).toBe('X');
    expect(getExpectedCheckDigit('isbn13', '978030640615')).toBe('7');
  });
});
