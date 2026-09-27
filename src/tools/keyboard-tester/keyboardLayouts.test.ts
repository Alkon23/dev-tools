import { describe, expect, it } from 'vitest';
import { getKeyboardLayout, isNumpadKey, KEYBOARD_LAYOUTS } from './keyboardLayouts';

describe('keyboard layouts', () => {
  it('defines a unique physical code for every key', () => {
    Object.values(KEYBOARD_LAYOUTS).forEach((layout) => {
      const codes = layout.keys.map((key) => key.code);
      expect(new Set(codes).size).toBe(codes.length);
      expect(layout.keyCount).toBe(codes.length);
    });
  });

  it('provides full-size ANSI and Spanish ISO layouts', () => {
    expect(getKeyboardLayout('ansi').keyCount).toBe(104);
    expect(getKeyboardLayout('spanish-iso').keyCount).toBe(105);
  });

  it('adds the ISO key and ISO enter shape only to the Spanish layout', () => {
    const ansi = getKeyboardLayout('ansi');
    const spanish = getKeyboardLayout('spanish-iso');

    expect(ansi.keys.some((key) => key.code === 'IntlBackslash')).toBe(false);
    expect(ansi.keys.find((key) => key.code === 'Enter')?.shape).toBeUndefined();
    expect(spanish.keys.find((key) => key.code === 'IntlBackslash')?.label).toBe('<');
    expect(spanish.keys.find((key) => key.code === 'Enter')?.shape).toBe('iso-enter');
    expect(spanish.keys.find((key) => key.code === 'Semicolon')?.label).toBe('ñ');
  });

  it('excludes media keys', () => {
    Object.values(KEYBOARD_LAYOUTS).forEach((layout) => {
      expect(layout.keys.some((key) => /Audio|Media|Volume/.test(key.code))).toBe(false);
    });
  });

  it('identifies the 17-key numeric pad', () => {
    Object.values(KEYBOARD_LAYOUTS).forEach((layout) => {
      expect(layout.keys.filter(isNumpadKey)).toHaveLength(17);
    });
  });
});
