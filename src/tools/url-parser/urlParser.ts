export const INITIAL_URL = 'https://me:pwd@it-tools.tech:3000/url-parser?key1=value&key2=value2#the-hash';

export type UrlPart = 'protocol' | 'username' | 'password' | 'hostname' | 'port' | 'pathname' | 'search' | 'hash';

export type UrlParts = Record<UrlPart, string>;

export interface UrlUpdateResult {
  error: boolean;
  value: string;
}

export function parseUrl(value: string): URL | undefined {
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

export function getUrlParts(url: URL): UrlParts {
  return {
    protocol: url.protocol,
    username: url.username,
    password: url.password,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
  };
}

export function updateUrlPart(source: string, part: UrlPart, value: string): UrlUpdateResult {
  const url = parseUrl(source);
  if (!url) {
    return { error: true, value: source };
  }

  if (part === 'protocol' && !/^[a-z][a-z\d+.-]*:?$/i.test(value)) {
    return { error: true, value: source };
  }

  if (part === 'port' && value !== '' && (!/^\d+$/.test(value) || Number(value) > 65535)) {
    return { error: true, value: source };
  }

  const previousValue = url[part];
  url[part] = value;

  const requestedProtocol = value.endsWith(':') ? value.toLowerCase() : `${value.toLowerCase()}:`;
  const assignmentWasRejected = part === 'protocol'
    ? url.protocol !== requestedProtocol
    : part === 'hostname' && value !== previousValue && url.hostname === previousValue;

  if (assignmentWasRejected) {
    return { error: true, value: source };
  }

  return { error: false, value: url.href };
}

export function getQueryEntries(source: string): Array<[string, string]> {
  const url = parseUrl(source);
  return url ? [...url.searchParams.entries()] : [];
}

function replaceQueryEntries(source: string, entries: Array<[string, string]>): string {
  const url = new URL(source);
  url.search = '';
  for (const [key, value] of entries) {
    url.searchParams.append(key, value);
  }
  return url.href;
}

export function updateQueryEntry(source: string, index: number, key: string, value: string): string {
  const entries = getQueryEntries(source);
  entries[index] = [key, value];
  return replaceQueryEntries(source, entries);
}

export function addQueryEntry(source: string): string {
  return replaceQueryEntries(source, [...getQueryEntries(source), ['', '']]);
}

export function removeQueryEntry(source: string, index: number): string {
  return replaceQueryEntries(source, getQueryEntries(source).filter((_, entryIndex) => entryIndex !== index));
}
