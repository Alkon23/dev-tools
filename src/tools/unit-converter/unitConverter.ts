export type UnitSectionId = 'temperature' | 'length' | 'byte-size';

export type UnitId =
  | 'celsius'
  | 'fahrenheit'
  | 'kelvin'
  | 'millimetre'
  | 'centimetre'
  | 'metre'
  | 'kilometre'
  | 'inch'
  | 'foot'
  | 'yard'
  | 'mile'
  | 'byte'
  | 'kilobyte'
  | 'megabyte'
  | 'gigabyte'
  | 'terabyte';

export interface UnitDefinition {
  id: UnitId;
  label: string;
  symbol: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

export interface UnitSectionDefinition {
  id: UnitSectionId;
  title: string;
  description: string;
  initialUnit: UnitId;
  initialValue: number;
  units: readonly UnitDefinition[];
}

function linearUnit(id: UnitId, label: string, symbol: string, unitsPerBase: number): UnitDefinition {
  return {
    id,
    label,
    symbol,
    toBase: (value) => value / unitsPerBase,
    fromBase: (value) => value * unitsPerBase,
  };
}

const temperatureUnits: readonly UnitDefinition[] = [
  {
    id: 'celsius',
    label: 'Celsius',
    symbol: '°C',
    toBase: (value) => value,
    fromBase: (value) => value,
  },
  {
    id: 'fahrenheit',
    label: 'Fahrenheit',
    symbol: '°F',
    toBase: (value) => (value - 32) * (5 / 9),
    fromBase: (value) => value * (9 / 5) + 32,
  },
  {
    id: 'kelvin',
    label: 'Kelvin',
    symbol: 'K',
    toBase: (value) => value - 273.15,
    fromBase: (value) => value + 273.15,
  },
];

const lengthUnits: readonly UnitDefinition[] = [
  linearUnit('millimetre', 'Millimetre', 'mm', 1000),
  linearUnit('centimetre', 'Centimetre', 'cm', 100),
  linearUnit('metre', 'Metre', 'm', 1),
  linearUnit('kilometre', 'Kilometre', 'km', 0.001),
  linearUnit('inch', 'Inch', 'in', 39.37007874015748),
  linearUnit('foot', 'Foot', 'ft', 3.280839895013123),
  linearUnit('yard', 'Yard', 'yd', 1.0936132983377078),
  linearUnit('mile', 'Mile', 'mi', 0.0006213711922373339),
];

const byteSizeUnits: readonly UnitDefinition[] = [
  linearUnit('byte', 'Byte', 'B', 1),
  linearUnit('kilobyte', 'Kilobyte', 'KB', 1 / 1024),
  linearUnit('megabyte', 'Megabyte', 'MB', 1 / 1024 ** 2),
  linearUnit('gigabyte', 'Gigabyte', 'GB', 1 / 1024 ** 3),
  linearUnit('terabyte', 'Terabyte', 'TB', 1 / 1024 ** 4),
];

export const UNIT_SECTIONS: readonly UnitSectionDefinition[] = [
  {
    id: 'temperature',
    title: 'Temperature',
    description: 'Convert between Celsius, Fahrenheit, and Kelvin.',
    initialUnit: 'celsius',
    initialValue: 0,
    units: temperatureUnits,
  },
  {
    id: 'length',
    title: 'Length',
    description: 'Convert between common metric and imperial measurements.',
    initialUnit: 'metre',
    initialValue: 1,
    units: lengthUnits,
  },
  {
    id: 'byte-size',
    title: 'Byte size',
    description: 'Convert storage units using binary multiples of 1,024.',
    initialUnit: 'megabyte',
    initialValue: 1,
    units: byteSizeUnits,
  },
];

export function parseUnitValue(value: string) {
  const trimmedValue = value.trim();
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(trimmedValue)) {
    return undefined;
  }

  const parsedValue = Number(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

export function formatUnitValue(value: number) {
  const normalizedValue = Math.abs(value) < 0.005 ? 0 : value;
  return normalizedValue.toFixed(2);
}

export function convertUnitValue(section: UnitSectionDefinition, sourceId: UnitId, value: number) {
  const source = section.units.find(({ id }) => id === sourceId);
  if (!source) {
    throw new Error(`Unknown ${section.id} unit: ${sourceId}`);
  }

  const baseValue = source.toBase(value);
  return Object.fromEntries(
    section.units.map((unit) => [unit.id, formatUnitValue(unit.fromBase(baseValue))]),
  ) as Record<UnitId, string>;
}

export function getInitialUnitValues(section: UnitSectionDefinition) {
  return convertUnitValue(section, section.initialUnit, section.initialValue);
}
