export interface UrlConversionResult {
  error: boolean;
  value: string;
}

function convert(value: string, converter: (input: string) => string): UrlConversionResult {
  try {
    return { error: false, value: converter(value) };
  } catch {
    return { error: true, value: '' };
  }
}

export function encodeUrlComponent(value: string): UrlConversionResult {
  return convert(value, encodeURIComponent);
}

export function decodeUrlComponent(value: string): UrlConversionResult {
  return convert(value, decodeURIComponent);
}
