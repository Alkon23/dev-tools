export type IdentifierKind = 'issn' | 'isbn10' | 'isbn13';

export interface IdentifierDefinition {
  kind: IdentifierKind;
  label: string;
  length: number;
  groups: readonly number[];
  example: string;
}

export type ValidationStatus = 'empty' | 'incomplete' | 'valid' | 'invalid';

export interface ValidationResult {
  status: ValidationStatus;
  message: string;
  normalized: string;
  expectedCheckDigit?: string;
}

export const IDENTIFIER_DEFINITIONS: readonly IdentifierDefinition[] = [
  { kind: 'issn', label: 'ISSN', length: 8, groups: [4, 4], example: '2049-3630' },
  { kind: 'isbn10', label: 'ISBN-10', length: 10, groups: [1, 3, 5, 1], example: '0-306-40615-2' },
  { kind: 'isbn13', label: 'ISBN-13', length: 13, groups: [3, 1, 3, 5, 1], example: '978-0-306-40615-7' },
];

export function cleanIdentifier(value: string) {
  return value.replace(/[\s-]/g, '').toUpperCase();
}

export function isAllowedCharacter(kind: IdentifierKind, character: string, index: number) {
  if (/^\d$/.test(character)) {
    return true;
  }

  const definition = IDENTIFIER_DEFINITIONS.find((item) => item.kind === kind)!;
  return character.toUpperCase() === 'X' && kind !== 'isbn13' && index === definition.length - 1;
}

function issnCheckDigit(body: string) {
  const sum = [...body].reduce((total, digit, index) => total + Number(digit) * (8 - index), 0);
  const check = (11 - (sum % 11)) % 11;
  return check === 10 ? 'X' : String(check);
}

function isbn10CheckDigit(body: string) {
  const sum = [...body].reduce((total, digit, index) => total + Number(digit) * (10 - index), 0);
  const check = (11 - (sum % 11)) % 11;
  return check === 10 ? 'X' : String(check);
}

function isbn13CheckDigit(body: string) {
  const sum = [...body].reduce(
    (total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3),
    0,
  );
  return String((10 - (sum % 10)) % 10);
}

export function getExpectedCheckDigit(kind: IdentifierKind, body: string) {
  if (kind === 'issn') {
    return issnCheckDigit(body);
  }
  if (kind === 'isbn10') {
    return isbn10CheckDigit(body);
  }
  return isbn13CheckDigit(body);
}

export function validateIdentifier(kind: IdentifierKind, value: string): ValidationResult {
  const definition = IDENTIFIER_DEFINITIONS.find((item) => item.kind === kind)!;
  const normalized = cleanIdentifier(value);

  if (!normalized) {
    return { status: 'empty', message: `Enter an ${definition.label} to test.`, normalized };
  }

  if (normalized.length < definition.length) {
    const remaining = definition.length - normalized.length;
    return {
      status: 'incomplete',
      message: `${remaining} ${remaining === 1 ? 'character' : 'characters'} remaining.`,
      normalized,
    };
  }

  const pattern = kind === 'isbn13' ? /^\d{13}$/ : /^\d+?[\dX]$/;
  if (normalized.length !== definition.length || !pattern.test(normalized)) {
    return { status: 'invalid', message: `${definition.label} has an invalid format.`, normalized };
  }

  if (kind === 'isbn13' && !/^(978|979)/.test(normalized)) {
    return {
      status: 'invalid',
      message: 'ISBN-13 must begin with the 978 or 979 book prefix.',
      normalized,
    };
  }

  const expectedCheckDigit = getExpectedCheckDigit(kind, normalized.slice(0, -1));
  if (normalized.at(-1) !== expectedCheckDigit) {
    return {
      status: 'invalid',
      message: `Invalid checksum. The check character should be ${expectedCheckDigit}.`,
      normalized,
      expectedCheckDigit,
    };
  }

  return { status: 'valid', message: `${definition.label} is valid.`, normalized };
}
