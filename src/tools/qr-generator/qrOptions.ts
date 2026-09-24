import type {
  CornerDotType,
  CornerSquareType,
  DotType,
  ErrorCorrectionLevel,
  Options,
} from 'qr-code-styling';

export interface QrSettings {
  content: string;
  foregroundColor: string;
  backgroundColor: string;
  transparentBackground: boolean;
  logo: string;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  errorCorrectionLevel: ErrorCorrectionLevel;
}

export const defaultQrSettings: QrSettings = {
  content: 'https://example.com',
  foregroundColor: '#211f1a',
  backgroundColor: '#ffffff',
  transparentBackground: false,
  logo: '',
  dotType: 'square',
  cornerSquareType: 'square',
  cornerDotType: 'square',
  errorCorrectionLevel: 'Q',
};

export function buildQrOptions(settings: QrSettings): Options {
  return {
    width: 300,
    height: 300,
    type: 'svg',
    data: settings.content || ' ',
    image: settings.logo,
    margin: 8,
    dotsOptions: {
      color: settings.foregroundColor,
      type: settings.dotType,
    },
    cornersSquareOptions: {
      color: settings.foregroundColor,
      type: settings.cornerSquareType,
    },
    cornersDotOptions: {
      color: settings.foregroundColor,
      type: settings.cornerDotType,
    },
    backgroundOptions: {
      color: settings.transparentBackground ? 'transparent' : settings.backgroundColor,
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      hideBackgroundDots: true,
      imageSize: 0.32,
      margin: 5,
      saveAsBlob: true,
    },
    qrOptions: {
      errorCorrectionLevel: settings.errorCorrectionLevel,
    },
  };
}
