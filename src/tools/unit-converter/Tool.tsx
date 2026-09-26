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
    <section className={`tool-card unit-converter-section unit-converter-${definition.id}`} aria-labelledby={`unit-section-${definition.id}`}>
      <div className="unit-section-heading">
        <div className="unit-section-icon"><Icon size={21} aria-hidden /></div>
        <div>
          <span className="section-index">{String(index + 1).padStart(2, '0')}</span>
          <h2 id={`unit-section-${definition.id}`}>{definition.title}</h2>
          <p>{definition.description}</p>
        </div>
      </div>

      <div className="unit-fields" aria-live="polite">
        {definition.units.map((unit, unitIndex) => {
          const rawValue = values[unit.id];
          const invalid = rawValue.trim() !== '' && parseUnitValue(rawValue) === undefined;
          const errorId = `unit-${definition.id}-${unit.id}-error`;
          const label = `${unit.label} (${unit.symbol})`;

          return (
            <div className="unit-field" key={unit.id}>
              <label htmlFor={`unit-${definition.id}-${unit.id}`}>{label}</label>
              <div className="unit-input-group">
                <input
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
                <span className="unit-symbol" aria-hidden="true">{unit.symbol}</span>
                <button
                  aria-label={`Copy ${label}`}
                  disabled={!rawValue || invalid}
                  onClick={() => onCopy(unit.id, rawValue)}
                  title={`Copy ${label}`}
                  type="button"
                >
                  {copiedUnit === unit.id ? <Check size={16} aria-hidden="true" /> : <Clipboard size={16} aria-hidden="true" />}
                </button>
              </div>
              {invalid && <p className="unit-field-error" id={errorId}>Enter a valid number.</p>}
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
    <div className="unit-converter-tool" aria-label="Unit converter" role="region">
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
