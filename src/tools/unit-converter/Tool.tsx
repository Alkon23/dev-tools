import { useEffect, useRef, useState, type ComponentType } from 'react';
import { Check, Clipboard, Database, Ruler, Thermometer } from 'lucide-react';
import {
  UNIT_SECTIONS,
  convertUnitValue,
  getInitialUnitValues,
  parseUnitValue,
  type UnitId,
  type UnitSectionDefinition,
  type UnitSectionId,
} from './unitConverter';

const sectionIcons: Record<UnitSectionId, ComponentType<{ size?: number; 'aria-hidden'?: boolean }>> = {
  temperature: Thermometer,
  length: Ruler,
  'byte-size': Database,
};

interface UnitSectionProps {
  copiedUnit: UnitId | null;
  definition: UnitSectionDefinition;
  index: number;
  onCopy: (unitId: UnitId, value: string) => void;
}

function UnitSection({ copiedUnit, definition, index, onCopy }: UnitSectionProps) {
  const [values, setValues] = useState(() => getInitialUnitValues(definition));
  const Icon = sectionIcons[definition.id];

  function updateValue(unitId: UnitId, rawValue: string) {
    const value = parseUnitValue(rawValue);
    if (value === undefined) {
      setValues((currentValues) => ({ ...currentValues, [unitId]: rawValue }));
      return;
    }

    setValues({ ...convertUnitValue(definition, unitId, value), [unitId]: rawValue });
  }

  function normalizeValue(unitId: UnitId) {
    const value = parseUnitValue(values[unitId]);
    if (value !== undefined) {
      setValues(convertUnitValue(definition, unitId, value));
    }
  }

  return (
    <section className="tool-card p-[clamp(22px,3vw,32px)]" aria-labelledby={`unit-section-${definition.id}`}>
      <div className="mb-[22px] flex items-start gap-3.5 border-b border-line pb-[18px]">
        <div className="flex size-[42px] shrink-0 items-center justify-center rounded-lg bg-[#fff3c9] text-accent-dark"><Icon size={21} aria-hidden /></div>
        <div className="min-w-0">
          <span className="section-index">{String(index + 1).padStart(2, '0')}</span>
          <h2 className="ml-[9px] inline text-lg font-semibold" id={`unit-section-${definition.id}`}>{definition.title}</h2>
          <p className="mt-1.5 mb-0 text-xs leading-[1.5] text-muted">{definition.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(205px,1fr))] gap-[17px] max-[760px]:grid-cols-1" aria-live="polite">
        {definition.units.map((unit, unitIndex) => {
          const rawValue = values[unit.id];
          const invalid = rawValue.trim() !== '' && parseUnitValue(rawValue) === undefined;
          const errorId = `unit-${definition.id}-${unit.id}-error`;
          const label = `${unit.label} (${unit.symbol})`;

          return (
            <div className="flex min-w-0 flex-col gap-[7px]" key={unit.id}>
              <label className="text-[11px] font-semibold text-[#45504c]" htmlFor={`unit-${definition.id}-${unit.id}`}>{label}</label>
              <div className="grid grid-cols-[minmax(0,1fr)_auto_42px]">
                <input
                  className="input-control rounded-r-none font-mono text-xs focus:relative focus:z-1"
                  aria-describedby={invalid ? errorId : undefined}
                  aria-invalid={invalid}
                  autoFocus={index === 0 && unitIndex === 0}
                  id={`unit-${definition.id}-${unit.id}`}
                  inputMode="decimal"
                  onBlur={() => normalizeValue(unit.id)}
                  onChange={(event) => updateValue(unit.id, event.target.value)}
                  spellCheck={false}
                  type="text"
                  value={rawValue}
                />
                <span className="flex min-w-[38px] items-center justify-center border-y border-[#d8dfdc] bg-[#eef1ef] px-2 font-mono text-[10px] text-[#65706c]" aria-hidden="true">{unit.symbol}</span>
                <button
                  className="copy-button border-l"
                  aria-label={`Copy ${label}`}
                  disabled={!rawValue || invalid}
                  onClick={() => onCopy(unit.id, rawValue)}
                  title={`Copy ${label}`}
                  type="button"
                >
                  {copiedUnit === unit.id ? <Check size={16} aria-hidden="true" /> : <Clipboard size={16} aria-hidden="true" />}
                </button>
              </div>
              {invalid && <p className="error-text" id={errorId}>Enter a valid number.</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function UnitConverterTool() {
  const [copiedUnit, setCopiedUnit] = useState<UnitId | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
  }, []);

  async function copyValue(unitId: UnitId, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedUnit(unitId);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => setCopiedUnit(null), 1600);
  }

  return (
    <div className="mx-auto flex max-w-[1040px] flex-col gap-[18px]" aria-label="Unit converter" role="region">
      {UNIT_SECTIONS.map((definition, index) => (
        <UnitSection
          copiedUnit={copiedUnit}
          definition={definition}
          index={index}
          key={definition.id}
          onCopy={copyValue}
        />
      ))}
    </div>
  );
}
