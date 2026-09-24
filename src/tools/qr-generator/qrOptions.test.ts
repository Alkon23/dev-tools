import { describe, expect, it } from 'vitest';
import { buildQrOptions, defaultQrSettings } from './qrOptions';

describe('buildQrOptions', () => {
  it('maps visual and error-correction settings to QR options', () => {
    const options = buildQrOptions({
      ...defaultQrSettings,
      content: 'Ship it',
      foregroundColor: '#123456',
      backgroundColor: '#fedcba',
      dotType: 'classy-rounded',
      cornerSquareType: 'extra-rounded',
      cornerDotType: 'dot',
      errorCorrectionLevel: 'H',
    });

    expect(options).toMatchObject({
      data: 'Ship it',
      type: 'svg',
      dotsOptions: { color: '#123456', type: 'classy-rounded' },
      cornersSquareOptions: { color: '#123456', type: 'extra-rounded' },
      cornersDotOptions: { color: '#123456', type: 'dot' },
      backgroundOptions: { color: '#fedcba' },
      qrOptions: { errorCorrectionLevel: 'H' },
    });
  });

  it('uses a transparent background when requested', () => {
    const options = buildQrOptions({ ...defaultQrSettings, transparentBackground: true });

    expect(options.backgroundOptions?.color).toBe('transparent');
  });

  it('keeps the renderer stable for empty content', () => {
    const options = buildQrOptions({ ...defaultQrSettings, content: '' });

    expect(options.data).toBe(' ');
  });

  it('configures an uploaded logo for readable SVG output', () => {
    const options = buildQrOptions({ ...defaultQrSettings, logo: 'data:image/png;base64,logo' });

    expect(options.image).toBe('data:image/png;base64,logo');
    expect(options.imageOptions).toMatchObject({
      hideBackgroundDots: true,
      imageSize: 0.32,
      margin: 5,
      saveAsBlob: true,
    });
  });
});
