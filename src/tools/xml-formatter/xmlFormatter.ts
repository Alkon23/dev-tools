import xmlFormat from 'xml-formatter';

export type XmlFormatMode = 'prettify' | 'minify';

export interface XmlFormatOptions {
  collapseContent: boolean;
  indentSize: number;
  mode: XmlFormatMode;
}

export interface XmlFormatResult {
  error: boolean;
  value: string;
}

const PARSER_ERROR_NAMESPACE = 'http://www.mozilla.org/newlayout/xml/parsererror.xml';

function isValidXml(input: string): boolean {
  const document = new DOMParser().parseFromString(input, 'application/xml');
  return document.getElementsByTagNameNS(PARSER_ERROR_NAMESPACE, 'parsererror').length === 0;
}

export function formatXml(input: string, options: XmlFormatOptions): XmlFormatResult {
  if (input === '') {
    return { error: false, value: '' };
  }

  const xml = input.trim();
  if (xml === '' || !isValidXml(xml)) {
    return { error: true, value: '' };
  }

  try {
    const sharedOptions = {
      collapseContent: options.collapseContent,
      strictMode: true,
    };
    const value = options.mode === 'minify'
      ? xmlFormat.minify(xml, sharedOptions)
      : xmlFormat(xml, {
          ...sharedOptions,
          indentation: ' '.repeat(Math.min(10, Math.max(0, options.indentSize))),
          lineSeparator: '\n',
        });
    return { error: false, value };
  } catch {
    return { error: true, value: '' };
  }
}
