import { describe, expect, it } from 'vitest';
import { decodeUrlComponent, encodeUrlComponent } from './urlEncoder';

describe('URL component conversion', () => {
  it('encodes spaces, reserved characters, and Unicode', () => {
    expect(encodeUrlComponent('Hello world :)')).toEqual({
      error: false,
      value: 'Hello%20world%20%3A)',
    });
    expect(encodeUrlComponent('café?x=1&y=2/+')).toEqual({
      error: false,
      value: 'caf%C3%A9%3Fx%3D1%26y%3D2%2F%2B',
    });
  });

  it('decodes percent escapes without treating plus as a space', () => {
    expect(decodeUrlComponent('Hello%20world%20%3A)')).toEqual({
      error: false,
      value: 'Hello world :)',
    });
    expect(decodeUrlComponent('a+b%2Bc')).toEqual({ error: false, value: 'a+b+c' });
  });

  it('accepts empty input and reports malformed values', () => {
    expect(encodeUrlComponent('')).toEqual({ error: false, value: '' });
    expect(decodeUrlComponent('')).toEqual({ error: false, value: '' });
    expect(decodeUrlComponent('%E0%A4%A')).toEqual({ error: true, value: '' });
    expect(encodeUrlComponent('\ud800')).toEqual({ error: true, value: '' });
  });
});
