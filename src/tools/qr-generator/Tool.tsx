import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Download, ImagePlus, Trash2 } from 'lucide-react';
import QRCodeStyling, {
  type CornerDotType,
  type CornerSquareType,
  type DotType,
  type ErrorCorrectionLevel,
} from 'qr-code-styling';
import { buildQrOptions, defaultQrSettings, type QrSettings } from './qrOptions';

const dotTypes: { label: string; value: DotType }[] = [
  { label: 'Square', value: 'square' },
  { label: 'Rounded', value: 'rounded' },
  { label: 'Dots', value: 'dots' },
  { label: 'Classy', value: 'classy' },
  { label: 'Classy rounded', value: 'classy-rounded' },
  { label: 'Extra rounded', value: 'extra-rounded' },
];

const cornerSquareTypes: { label: string; value: CornerSquareType }[] = [
  { label: 'Square', value: 'square' },
  { label: 'Extra rounded', value: 'extra-rounded' },
  { label: 'Dot', value: 'dot' },
];

const cornerDotTypes: { label: string; value: CornerDotType }[] = [
  { label: 'Square', value: 'square' },
  { label: 'Dot', value: 'dot' },
];

const correctionLevels: { label: string; value: ErrorCorrectionLevel }[] = [
  { label: 'Low (L) - 7%', value: 'L' },
  { label: 'Medium (M) - 15%', value: 'M' },
  { label: 'High (Q) - 25%', value: 'Q' },
  { label: 'Maximum (H) - 30%', value: 'H' },
];

export default function QrGeneratorTool() {
  const [settings, setSettings] = useState(defaultQrSettings);
  const [logoName, setLogoName] = useState('');
  const [logoError, setLogoError] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!previewRef.current) {
      return;
    }

    const preview = previewRef.current;
    const qrCode = new QRCodeStyling({ width: 300, height: 300, type: 'svg', data: ' ' });
    qrCode.append(preview);
    qrCodeRef.current = qrCode;

    return () => {
      if (qrCodeRef.current === qrCode) {
        qrCodeRef.current = null;
      }
      preview.replaceChildren();
    };
  }, []);

  useEffect(() => {
    qrCodeRef.current?.update(buildQrOptions(settings));
  }, [settings]);

  function updateSetting<K extends keyof QrSettings>(key: K, value: QrSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function handleLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setLogoError('Choose a valid image file.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setLogoError('The selected image could not be read.');
        return;
      }
      updateSetting('logo', reader.result);
      setLogoName(file.name);
      setLogoError('');
    };
    reader.onerror = () => setLogoError('The selected image could not be read.');
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    updateSetting('logo', '');
    setLogoName('');
    setLogoError('');
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  }

  async function downloadQrCode() {
    await qrCodeRef.current?.download({ name: 'qr-code', extension: 'svg' });
  }

  const hasContent = settings.content.trim().length > 0;

  return (
    <section className="tool-card mx-auto grid max-w-[760px] grid-cols-[minmax(0,1fr)_340px] gap-[clamp(28px,5vw,54px)] max-[760px]:grid-cols-1" aria-label="QR code generator">
      <div className="min-w-0">
        <div className="field-group">
          <label htmlFor="qr-content">URL or text</label>
          <textarea
            id="qr-content"
            onChange={(event) => updateSetting('content', event.target.value)}
            placeholder="Enter a URL or any text"
            rows={4}
            value={settings.content}
          />
        </div>

        <fieldset className="mt-[25px] border-0 border-t border-line pt-[22px]">
          <legend className="pr-2.5 text-xs font-semibold text-[#45504c]">Colors</legend>
          <div className="grid grid-cols-2 gap-3.5 max-[420px]:grid-cols-1">
            <label className="flex min-w-0 flex-col gap-2" htmlFor="qr-foreground">
              <span className="text-xs font-semibold text-[#45504c]">QR color</span>
              <input
                className="h-[42px] w-full cursor-pointer rounded-[7px] border border-[#d8dfdc] bg-[#f8faf9] p-1 focus:border-accent focus:shadow-focus focus:outline-0"
                id="qr-foreground"
                type="color"
                value={settings.foregroundColor}
                onChange={(event) => updateSetting('foregroundColor', event.target.value)}
              />
            </label>
            <label className="flex min-w-0 flex-col gap-2" htmlFor="qr-background">
              <span className="text-xs font-semibold text-[#45504c]">Background</span>
              <input
                disabled={settings.transparentBackground}
                className="h-[42px] w-full cursor-pointer rounded-[7px] border border-[#d8dfdc] bg-[#f8faf9] p-1 focus:border-accent focus:shadow-focus focus:outline-0 disabled:cursor-not-allowed disabled:opacity-40"
                id="qr-background"
                type="color"
                value={settings.backgroundColor}
                onChange={(event) => updateSetting('backgroundColor', event.target.value)}
              />
            </label>
          </div>
          <label className="mt-3.5 flex cursor-pointer items-center gap-[9px] text-xs text-[#5f6a65]" htmlFor="qr-transparent">
            <input
              className="size-[17px] accent-accent-dark"
              checked={settings.transparentBackground}
              id="qr-transparent"
              type="checkbox"
              onChange={(event) => updateSetting('transparentBackground', event.target.checked)}
            />
            Transparent background
          </label>
        </fieldset>

        <fieldset className="mt-[25px] border-0 border-t border-line pt-[22px]">
          <legend className="pr-2.5 text-xs font-semibold text-[#45504c]">Pattern</legend>
          <div className="grid grid-cols-2 gap-3.5 max-[420px]:grid-cols-1 [&_label]:flex [&_label]:min-w-0 [&_label]:flex-col [&_label]:gap-2 [&_span]:text-xs [&_span]:font-semibold [&_span]:text-[#45504c]">
            <label htmlFor="qr-dot-type">
              <span>Modules</span>
              <select
                className="select-control"
                id="qr-dot-type"
                value={settings.dotType}
                onChange={(event) => updateSetting('dotType', event.target.value as DotType)}
              >
                {dotTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label htmlFor="qr-corner-square">
              <span>Corner markers</span>
              <select
                className="select-control"
                id="qr-corner-square"
                value={settings.cornerSquareType}
                onChange={(event) => updateSetting('cornerSquareType', event.target.value as CornerSquareType)}
              >
                {cornerSquareTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label htmlFor="qr-corner-dot">
              <span>Corner eyes</span>
              <select
                className="select-control"
                id="qr-corner-dot"
                value={settings.cornerDotType}
                onChange={(event) => updateSetting('cornerDotType', event.target.value as CornerDotType)}
              >
                {cornerDotTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label htmlFor="qr-correction">
              <span>Error correction</span>
              <select
                className="select-control"
                id="qr-correction"
                value={settings.errorCorrectionLevel}
                onChange={(event) => updateSetting('errorCorrectionLevel', event.target.value as ErrorCorrectionLevel)}
              >
                {correctionLevels.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset className="mt-[25px] border-0 border-t border-line pt-[22px]">
          <legend className="pr-2.5 text-xs font-semibold text-[#45504c]">Center logo</legend>
          <label className="flex min-h-[46px] cursor-pointer items-center gap-[9px] overflow-hidden rounded-[7px] border border-dashed border-[#c5cfcb] bg-[#f8faf9] px-[13px] py-2.5 text-xs text-[#5f6a65] focus-within:border-accent focus-within:shadow-focus [&_span]:overflow-hidden [&_span]:text-ellipsis [&_span]:whitespace-nowrap [&_input]:absolute [&_input]:size-px [&_input]:overflow-hidden [&_input]:opacity-0" htmlFor="qr-logo">
            <ImagePlus size={18} aria-hidden="true" />
            <span>{logoName || 'Choose an image'}</span>
            <input ref={logoInputRef} accept="image/*" id="qr-logo" type="file" onChange={handleLogo} />
          </label>
          {logoError && <p className="mt-2 text-xs text-[#a53b32]" role="alert">{logoError}</p>}
          {settings.logo && (
            <button className="button button-secondary mt-2.5" onClick={removeLogo} type="button">
              <Trash2 size={16} aria-hidden="true" />
              Remove logo
            </button>
          )}
        </fieldset>
      </div>

      <div className="flex min-w-0 flex-col items-stretch justify-center max-[760px]:mx-auto max-[760px]:w-full max-[760px]:max-w-[340px]">
        <div className="flex min-h-[324px] items-center justify-center overflow-hidden rounded-[10px] border border-[#d0d8d4] bg-[#eef1ef] bg-[linear-gradient(45deg,#dce2df_25%,transparent_25%,transparent_75%,#dce2df_75%),linear-gradient(45deg,#dce2df_25%,transparent_25%,transparent_75%,#dce2df_75%)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] p-3" role="img" aria-label="Generated QR code preview">
          <div className="flex w-full max-w-[300px] shadow-[0_10px_28px_rgba(29,46,40,0.15)] [&_canvas]:block [&_canvas]:h-auto [&_canvas]:w-full [&_canvas]:max-w-full [&_svg]:block [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-full" ref={previewRef} />
        </div>
        <p className="mt-3 mb-4 text-center font-mono text-[9px] tracking-[0.05em] text-muted uppercase" aria-live="polite">
          {hasContent ? 'Preview updates automatically' : 'Enter content to enable download'}
        </p>
        <button className="button button-primary w-full" disabled={!hasContent} onClick={downloadQrCode} type="button">
          <Download size={17} aria-hidden="true" />
          Download SVG
        </button>
      </div>
    </section>
  );
}
