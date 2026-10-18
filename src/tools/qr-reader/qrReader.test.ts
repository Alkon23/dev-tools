import { describe, expect, it } from 'vitest';
import { decodeQrPixels, readQrImage } from './qrReader';

describe('QR image reader', () => {
  // Version 1-L QR encoding "hello", including the mandatory quiet zone when rasterized.
  const matrix = [
    '111111100011101111111', '100000101110101000001', '101110100011101011101',
    '101110101100101011101', '101110100100101011101', '100000101001001000001',
    '111111101010101111111', '000000000100000000000', '111110111001010101010',
    '101110001101111001101', '010001100110101101110', '111101010001111001100',
    '001100111000100100001', '000000001100100101001', '111111101001010010110',
    '100000100110000111110', '101110101001010010010', '101110101011111101000',
    '101110101000101100100', '100000101101111011100', '111111101100100010010',
  ];

  it.each([false, true])('decodes real QR pixels (inverted: %s)', (inverted) => {
    const width = (matrix.length + 8) * 5;
    const data = new Uint8ClampedArray(width * width * 4);
    for (let y = 0; y < width; y++) {
      for (let x = 0; x < width; x++) {
        const dark = matrix[Math.floor(y / 5) - 4]?.[Math.floor(x / 5) - 4] === '1';
        const value = dark !== inverted ? 0 : 255;
        const offset = (y * width + x) * 4;
        data.set([value, value, value, 255], offset);
      }
    }
    expect(decodeQrPixels({ data, width, height: width } as ImageData)).toBe('hello');
  });

  it('reports images with no QR code', () => {
    const data = new Uint8ClampedArray(100 * 100 * 4).fill(255);
    expect(() => decodeQrPixels({ data, width: 100, height: 100 } as ImageData)).toThrow('No QR code found');
  });

  it('rejects non-image files', async () => {
    await expect(readQrImage(new File(['hello'], 'hello.txt', { type: 'text/plain' }))).rejects.toThrow('Choose an image file');
  });

  it('rejects oversized images before attempting to load them', async () => {
    const file = new File([], 'large.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 21 * 1024 * 1024 });
    await expect(readQrImage(file)).rejects.toThrow('smaller than 20 MB');
  });

  it('rejects malformed image data', async () => {
    const originalImage = globalThis.Image;
    class BrokenImage {
      onerror: (() => void) | null = null;
      set src(_value: string) { queueMicrotask(() => this.onerror?.()); }
    }
    globalThis.Image = BrokenImage as unknown as typeof Image;
    try {
      await expect(readQrImage(new File(['broken'], 'broken.png', { type: 'image/png' }))).rejects.toThrow('could not be opened');
    } finally {
      globalThis.Image = originalImage;
    }
  });
});
