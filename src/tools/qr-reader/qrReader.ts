import jsQR from 'jsqr';

export function decodeQrPixels(image: ImageData): string {
  const result = jsQR(image.data, image.width, image.height, { inversionAttempts: 'attemptBoth' });
  if (!result) throw new Error('No QR code found. Try a clearer image with the entire QR code visible.');
  return result.data;
}

export async function readQrImage(file: File): Promise<{ text: string; preview: string }> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > 20 * 1024 * 1024) throw new Error('Choose an image smaller than 20 MB.');

  const preview = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result)
      : reject(new Error('The image could not be read.'));
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error('The image could not be opened. Try a PNG, JPEG, or WebP image.'));
    element.src = preview;
  });
  // Bound pixel allocation and decoding work for large screenshots/photos.
  if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 16_000_000) {
    throw new Error('The image is too large. Choose an image with at most 16 megapixels.');
  }
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not process this image.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);
  return { text: decodeQrPixels(context.getImageData(0, 0, canvas.width, canvas.height)), preview };
}
