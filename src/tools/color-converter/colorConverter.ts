import { colord, extend, type Colord } from 'colord';
import cmykPlugin from 'colord/plugins/cmyk';
import hwbPlugin from 'colord/plugins/hwb';
import lchPlugin from 'colord/plugins/lch';
import namesPlugin from 'colord/plugins/names';

extend([cmykPlugin, hwbPlugin, lchPlugin, namesPlugin]);

export type ColorFormatId = 'hex' | 'rgb' | 'hsl' | 'name' | 'hwb' | 'lch' | 'cmyk';

export interface ColorFormatDefinition {
  id: ColorFormatId;
  label: string;
  placeholder: string;
  advanced?: boolean;
  format: (color: Colord) => string;
}

export const INITIAL_COLOR = '#d79f00';

export const COLOR_FORMATS: readonly ColorFormatDefinition[] = [
  {
    id: 'hex',
    label: 'HEX',
    placeholder: 'e.g. #ff0000',
    format: (color) => color.toHex(),
  },
  {
    id: 'rgb',
    label: 'RGB',
    placeholder: 'e.g. rgb(255, 0, 0)',
    format: (color) => color.toRgbString(),
  },
  {
    id: 'hsl',
    label: 'HSL',
    placeholder: 'e.g. hsl(0, 100%, 50%)',
    format: (color) => color.toHslString(),
  },
  {
    id: 'name',
    label: 'Closest CSS color name',
    placeholder: 'e.g. red',
    format: (color) => color.toName({ closest: true }) ?? 'Unknown',
  },
  {
    id: 'hwb',
    label: 'HWB',
    placeholder: 'e.g. hwb(0 0% 0%)',
    advanced: true,
    format: (color) => color.toHwbString(),
  },
  {
    id: 'lch',
    label: 'LCH',
    placeholder: 'e.g. lch(53.24% 104.55 40.85)',
    advanced: true,
    format: (color) => color.toLchString(),
  },
  {
    id: 'cmyk',
    label: 'CMYK',
    placeholder: 'e.g. device-cmyk(0% 100% 100% 0%)',
    advanced: true,
    format: (color) => color.toCmykString(),
  },
];

export type ColorValues = Record<ColorFormatId, string>;

export function parseColor(value: string) {
  const color = colord(value);
  return color.isValid() ? color : undefined;
}

export function formatColorValues(color: Colord): ColorValues {
  return Object.fromEntries(
    COLOR_FORMATS.map(({ id, format }) => [id, format(color)]),
  ) as ColorValues;
}

export function getInitialColorValues() {
  return formatColorValues(colord(INITIAL_COLOR));
}

export function updateColorAlpha(color: Colord, percentage: number) {
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));
  return color.alpha(normalizedPercentage / 100);
}

export function getOpaqueHex(color: Colord) {
  return color.alpha(1).toHex();
}
