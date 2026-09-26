import { describe, expect, it } from 'vitest';
import {
  INITIAL_COLOR,
  formatColorValues,
  getInitialColorValues,
  getOpaqueHex,
  parseColor,
  updateColorAlpha,
} from './colorConverter';

describe('color conversion', () => {
  it('starts with the application accent color', () => {
    expect(INITIAL_COLOR).toBe('#d79f00');
    expect(getInitialColorValues().hex).toBe('#d79f00');
  });

  it('matches the reference conversions for a CSS color name', () => {
    const color = parseColor('olive');
    expect(color).toBeDefined();

    expect(formatColorValues(color!)).toEqual({
      hex: '#808000',
      rgb: 'rgb(128, 128, 0)',
      hsl: 'hsl(60, 100%, 25%)',
      name: 'olive',
      hwb: 'hwb(60 0% 50%)',
      lch: 'lch(52.15% 56.81 99.57)',
      cmyk: 'device-cmyk(0% 0% 100% 50%)',
    });
  });

  it('preserves alpha across supported formats', () => {
    const color = parseColor('rgba(255, 0, 0, 0.5)');
    expect(color).toBeDefined();

    const values = formatColorValues(color!);
    expect(values.hex).toBe('#ff000080');
    expect(values.rgb).toBe('rgba(255, 0, 0, 0.5)');
    expect(values.hwb).toBe('hwb(0 0% 0% / 0.5)');
  });

  it('rejects malformed colors and clamps opacity changes', () => {
    expect(parseColor('not-a-color')).toBeUndefined();

    const red = parseColor('red')!;
    expect(updateColorAlpha(red, -20).alpha()).toBe(0);
    expect(updateColorAlpha(red, 140).alpha()).toBe(1);
    expect(getOpaqueHex(updateColorAlpha(red, 50))).toBe('#ff0000');
  });
});
