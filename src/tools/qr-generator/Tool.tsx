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
    <section className="tool-card qr-tool" aria-label="QR code generator">
      <div className="qr-controls">
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

        <fieldset className="qr-fieldset">
          <legend>Colors</legend>
          <div className="qr-color-grid">
            <label className="qr-color-field" htmlFor="qr-foreground">
              <span>QR color</span>
              <input
                id="qr-foreground"
                type="color"
                value={settings.foregroundColor}
                onChange={(event) => updateSetting('foregroundColor', event.target.value)}
              />
            </label>
            <label className="qr-color-field" htmlFor="qr-background">
              <span>Background</span>
              <input
                disabled={settings.transparentBackground}
                id="qr-background"
                type="color"
                value={settings.backgroundColor}
                onChange={(event) => updateSetting('backgroundColor', event.target.value)}
              />
            </label>
          </div>
          <label className="qr-check-field" htmlFor="qr-transparent">
            <input
              checked={settings.transparentBackground}
              id="qr-transparent"
              type="checkbox"
              onChange={(event) => updateSetting('transparentBackground', event.target.checked)}
            />
            Transparent background
          </label>
        </fieldset>

        <fieldset className="qr-fieldset">
          <legend>Pattern</legend>
          <div className="qr-select-grid">
            <label htmlFor="qr-dot-type">
              <span>Modules</span>
              <select
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
                id="qr-correction"
                value={settings.errorCorrectionLevel}
                onChange={(event) => updateSetting('errorCorrectionLevel', event.target.value as ErrorCorrectionLevel)}
              >
                {correctionLevels.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset className="qr-fieldset">
          <legend>Center logo</legend>
          <label className="qr-file-field" htmlFor="qr-logo">
            <ImagePlus size={18} aria-hidden="true" />
            <span>{logoName || 'Choose an image'}</span>
            <input ref={logoInputRef} accept="image/*" id="qr-logo" type="file" onChange={handleLogo} />
          </label>
          {logoError && <p className="qr-field-error" role="alert">{logoError}</p>}
          {settings.logo && (
            <button className="button button-secondary qr-remove-logo" onClick={removeLogo} type="button">
              <Trash2 size={16} aria-hidden="true" />
              Remove logo
            </button>
          )}
        </fieldset>
      </div>

      <div className="qr-output">
        <div className="qr-preview-frame" role="img" aria-label="Generated QR code preview">
          <div className="qr-preview" ref={previewRef} />
        </div>
        <p className="qr-preview-note" aria-live="polite">
          {hasContent ? 'Preview updates automatically' : 'Enter content to enable download'}
        </p>
        <button className="button button-primary qr-download" disabled={!hasContent} onClick={downloadQrCode} type="button">
          <Download size={17} aria-hidden="true" />
          Download SVG
        </button>
      </div>
    </section>
  );
}
