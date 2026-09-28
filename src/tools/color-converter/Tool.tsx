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
    <div className="flex min-w-0 flex-col gap-[7px]">
      <label className="text-[11px] font-semibold text-[#45504c]" htmlFor={`color-${definition.id}`}>{definition.label}</label>
      <div className="grid grid-cols-[minmax(0,1fr)_42px]">
        <input
          className="input-control rounded-r-none font-mono text-xs focus:relative focus:z-1"
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
          className="copy-button"
          aria-label={`Copy ${definition.label}`}
          disabled={!value}
          onClick={() => onCopy(definition.id, value)}
          title={`Copy ${definition.label}`}
          type="button"
        >
          {copied ? <Check size={16} aria-hidden="true" /> : <Clipboard size={16} aria-hidden="true" />}
        </button>
      </div>
      {invalid && <p className="error-text" id={errorId}>Invalid {definition.label} format.</p>}
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
    <section className="tool-card mx-auto max-w-[960px]" aria-label="Color converter">
      <div className="grid grid-cols-[minmax(190px,0.72fr)_minmax(0,1.45fr)] gap-[clamp(24px,4vw,42px)] max-[760px]:grid-cols-[170px_minmax(0,1fr)] max-[420px]:grid-cols-1">
        <div className="min-h-[190px] overflow-hidden rounded-[11px] border border-[#ccd4d0] bg-[#eef1ef] bg-[linear-gradient(45deg,#d7ddda_25%,transparent_25%,transparent_75%,#d7ddda_75%),linear-gradient(45deg,#d7ddda_25%,transparent_25%,transparent_75%,#d7ddda_75%)] bg-[length:24px_24px] bg-[position:0_0,12px_12px] p-2.5 max-[420px]:min-h-[150px]" aria-label={`Color preview ${currentColor}`} role="img">
          <div className="h-full min-h-[168px] w-full rounded-[7px] shadow-[inset_0_0_0_1px_rgba(20,30,26,0.1)] max-[420px]:min-h-32" style={{ backgroundColor: currentColor }} />
        </div>

        <div className="flex min-w-0 flex-col justify-between">
          <div>
            <span className="section-index">LIVE COLOR</span>
            <h2 className="mt-2 mb-1 text-2xl font-semibold tracking-[-0.025em]">Pick a color</h2>
            <p className="m-0 text-xs leading-[1.5] text-muted">Choose visually or edit any format below.</p>
          </div>

          <div className="mt-[25px] grid grid-cols-[110px_minmax(0,1fr)] gap-[18px] max-[420px]:grid-cols-[100px_minmax(0,1fr)]">
            <label className="flex flex-col gap-[9px] text-[11px] font-semibold text-[#45504c]" htmlFor="color-picker">
              <span>Color</span>
              <span className="flex min-h-11 items-center gap-2 overflow-hidden rounded-[7px] border border-[#d8dfdc] bg-[#f8faf9] py-[5px] pr-[7px] pl-[11px] text-[#5f6a65] focus-within:shadow-[0_0_0_3px_rgba(252,186,3,0.2)] focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-accent-dark">
                <Pipette size={17} aria-hidden="true" />
                <input
                  className="ml-auto h-8 w-12 cursor-pointer border-0 bg-transparent p-0 [&::-moz-color-swatch]:rounded-[5px] [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-[5px] [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
                  aria-label="Choose color"
                  id="color-picker"
                  onChange={(event) => updatePicker(event.target.value)}
                  type="color"
                  value={getOpaqueHex(color)}
                />
              </span>
            </label>

            <label className="flex flex-col gap-[9px] text-[11px] font-semibold text-[#45504c]" htmlFor="color-opacity">
              <span className="flex justify-between">Opacity <output className="font-mono text-accent-dark" htmlFor="color-opacity">{opacity}%</output></span>
              <input
                className="m-0 h-11 w-full cursor-pointer accent-accent-dark"
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

      <div className="mt-[30px] mb-[17px] flex items-end justify-between border-t border-line pt-6 max-[420px]:items-start max-[420px]:flex-col max-[420px]:gap-1.5">
        <div className="flex items-baseline gap-2.5">
          <span className="section-index">01</span>
          <h2 className="m-0 text-base font-semibold">Common formats</h2>
        </div>
        <p className="m-0 text-xs leading-[1.5] text-muted">Every field accepts input and updates the rest.</p>
      </div>

      <div className="grid grid-cols-2 gap-[17px] max-[420px]:grid-cols-1">
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

      <details className="group mt-[27px] border-t border-line pt-5">
        <summary className="flex cursor-pointer list-none items-center justify-between text-[#45504c] [&::-webkit-details-marker]:hidden">
          <span className="flex items-baseline gap-2.5 text-sm font-semibold"><span className="section-index">02</span> Advanced formats</span>
          <small className="ml-auto text-[10px] font-medium text-muted max-[420px]:hidden">HWB, LCH, and CMYK</small>
          <span className="ml-3 font-mono text-xl text-accent-dark group-open:hidden" aria-hidden="true">+</span>
          <span className="ml-3 hidden font-mono text-xl text-accent-dark group-open:inline" aria-hidden="true">−</span>
        </summary>
        <div className="mt-5 grid grid-cols-2 gap-[17px] max-[420px]:grid-cols-1">
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
