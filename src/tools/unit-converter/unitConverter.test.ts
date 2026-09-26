import { describe, expect, it } from 'vitest';
import {
  UNIT_SECTIONS,
  convertUnitValue,
  formatUnitValue,
  parseUnitValue,
} from './unitConverter';

function section(id: (typeof UNIT_SECTIONS)[number]['id']) {
  return UNIT_SECTIONS.find((candidate) => candidate.id === id)!;
}

describe('unit conversion', () => {
  it('converts between the common temperature scales', () => {
    expect(convertUnitValue(section('temperature'), 'celsius', 0)).toMatchObject({
      celsius: '0.00',
      fahrenheit: '32.00',
      kelvin: '273.15',
    });
    expect(convertUnitValue(section('temperature'), 'fahrenheit', 212).celsius).toBe('100.00');
  });

  it('uses exact metric and imperial length factors', () => {
    const fromInch = convertUnitValue(section('length'), 'inch', 1);
    expect(fromInch.millimetre).toBe('25.40');
    expect(fromInch.centimetre).toBe('2.54');

    const fromMetre = convertUnitValue(section('length'), 'metre', 1);
    expect(fromMetre.inch).toBe('39.37');
    expect(fromMetre.foot).toBe('3.28');
  });

  it('uses powers of 1024 for byte sizes', () => {
    expect(convertUnitValue(section('byte-size'), 'megabyte', 1)).toMatchObject({
      byte: '1048576.00',
      kilobyte: '1024.00',
      megabyte: '1.00',
      gigabyte: '0.00',
      terabyte: '0.00',
    });
  });

  it('parses decimal and scientific input while rejecting malformed values', () => {
    expect(parseUnitValue('-12.5')).toBe(-12.5);
    expect(parseUnitValue('1e3')).toBe(1000);
    expect(parseUnitValue('')).toBeUndefined();
    expect(parseUnitValue('0x10')).toBeUndefined();
    expect(parseUnitValue('12px')).toBeUndefined();
  });

  it('formats strict two-decimal values without negative zero', () => {
    expect(formatUnitValue(1.236)).toBe('1.24');
    expect(formatUnitValue(0.004)).toBe('0.00');
    expect(formatUnitValue(-0.004)).toBe('0.00');
  });
});
