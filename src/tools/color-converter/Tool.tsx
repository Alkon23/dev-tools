import { useEffect, useRef, useState } from 'react';
import { Check, Clipboard, Pipette } from 'lucide-react';
import {
  COLOR_FORMATS,
  INITIAL_COLOR,
  formatColorValues,
  getInitialColorValues,
  getOpaqueHex,
  parseColor,
  updateColorAlpha,
  type ColorFormatDefinition,
  type ColorFormatId,
} from './colorConverter';

interface ColorFieldProps {
  copied: boolean;
  definition: ColorFormatDefinition;
  invalid: boolean;
  onChange: (id: ColorFormatId, value: string) => void;
  onCopy: (id: ColorFormatId, value: string) => void;
  value: string;
}

function ColorField({ copied, definition, invalid, onChange, onCopy, value }: ColorFieldProps) {
  const errorId = `color-${definition.id}-error`;

  return (
    <div className="color-format-field">
      <label htmlFor={`color-${definition.id}`}>{definition.label}</label>
      <div className="color-copy-field">
        <input
          aria-describedby={invalid ? errorId : undefined}
          aria-invalid={invalid}
          id={`color-${definition.id}`}
          onChange={(event) => onChange(definition.id, event.target.value)}
          placeholder={definition.placeholder}
          spellCheck={false}
          type="text"
          value={value}
        />
        <button
          aria-label={`Copy ${definition.label}`}
          disabled={!value}
          onClick={() => onCopy(definition.id, value)}
          title={`Copy ${definition.label}`}
          type="button"
        >
          {copied ? <Check size={16} aria-hidden="true" /> : <Clipboard size={16} aria-hidden="true" />}
        </button>
      </div>
      {invalid && <p className="color-format-error" id={errorId}>Invalid {definition.label} format.</p>}
    </div>
  );
}

const commonFormats = COLOR_FORMATS.filter(({ advanced }) => !advanced);
const advancedFormats = COLOR_FORMATS.filter(({ advanced }) => advanced);

export default function ColorConverterTool() {
  const [currentColor, setCurrentColor] = useState(INITIAL_COLOR);
  const [values, setValues] = useState(getInitialColorValues);
  const [copiedFormat, setCopiedFormat] = useState<ColorFormatId | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const color = parseColor(currentColor)!;
  const opacity = Math.round(color.alpha() * 100);

  useEffect(() => () => {
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
  }, []);

  function applyColor(nextColor: NonNullable<ReturnType<typeof parseColor>>) {
    setCurrentColor(nextColor.toHex());
    setValues(formatColorValues(nextColor));
  }

  function updateFormat(id: ColorFormatId, value: string) {
    const nextColor = parseColor(value);
    if (!nextColor) {
      setValues((currentValues) => ({ ...currentValues, [id]: value }));
      return;
    }

    setCurrentColor(nextColor.toHex());
    setValues({ ...formatColorValues(nextColor), [id]: value });
  }

  function updatePicker(hex: string) {
    const pickedColor = parseColor(hex);
    if (pickedColor) {
      applyColor(pickedColor.alpha(color.alpha()));
    }
  }

  function updateOpacity(percentage: number) {
    applyColor(updateColorAlpha(color, percentage));
  }

  async function copyValue(id: ColorFormatId, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedFormat(id);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => setCopiedFormat(null), 1600);
  }

  return (
    <section className="tool-card color-converter-tool" aria-label="Color converter">
      <div className="color-converter-hero">
        <div className="color-preview-checker" aria-label={`Color preview ${currentColor}`} role="img">
          <div className="color-preview-swatch" style={{ backgroundColor: currentColor }} />
        </div>

        <div className="color-picker-controls">
          <div className="color-picker-heading">
            <span className="section-index">LIVE COLOR</span>
            <h2>Pick a color</h2>
            <p>Choose visually or edit any format below.</p>
          </div>

          <div className="color-picker-row">
            <label className="color-picker-input" htmlFor="color-picker">
              <span>Color</span>
              <span className="color-picker-button">
                <Pipette size={17} aria-hidden="true" />
                <input
                  aria-label="Choose color"
                  id="color-picker"
                  onChange={(event) => updatePicker(event.target.value)}
                  type="color"
                  value={getOpaqueHex(color)}
                />
              </span>
            </label>

            <label className="color-opacity-control" htmlFor="color-opacity">
              <span>Opacity <output htmlFor="color-opacity">{opacity}%</output></span>
              <input
                id="color-opacity"
                max="100"
                min="0"
                onChange={(event) => updateOpacity(Number(event.target.value))}
                type="range"
                value={opacity}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="color-section-heading">
        <div>
          <span className="section-index">01</span>
          <h2>Common formats</h2>
        </div>
        <p>Every field accepts input and updates the rest.</p>
      </div>

      <div className="color-format-grid">
        {commonFormats.map((definition) => (
          <ColorField
            copied={copiedFormat === definition.id}
            definition={definition}
            invalid={values[definition.id] !== '' && !parseColor(values[definition.id])}
            key={definition.id}
            onChange={updateFormat}
            onCopy={copyValue}
            value={values[definition.id]}
          />
        ))}
      </div>

      <details className="color-advanced-formats">
        <summary>
          <span><span className="section-index">02</span> Advanced formats</span>
          <small>HWB, LCH, and CMYK</small>
        </summary>
        <div className="color-format-grid color-advanced-grid">
          {advancedFormats.map((definition) => (
            <ColorField
              copied={copiedFormat === definition.id}
              definition={definition}
              invalid={values[definition.id] !== '' && !parseColor(values[definition.id])}
              key={definition.id}
              onChange={updateFormat}
              onCopy={copyValue}
              value={values[definition.id]}
            />
          ))}
        </div>
      </details>
    </section>
  );
}
