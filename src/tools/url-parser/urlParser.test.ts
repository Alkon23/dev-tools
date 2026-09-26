import { describe, expect, it } from 'vitest';
import {
  INITIAL_URL,
  addQueryEntry,
  getQueryEntries,
  getUrlParts,
  parseUrl,
  removeQueryEntry,
  updateQueryEntry,
  updateUrlPart,
} from './urlParser';

describe('URL parsing and editing', () => {
  it('extracts every editable component from an absolute URL', () => {
    const url = parseUrl(INITIAL_URL);
    expect(url).toBeDefined();
    expect(getUrlParts(url!)).toEqual({
      protocol: 'https:',
      username: 'me',
      password: 'pwd',
      hostname: 'it-tools.tech',
      port: '3000',
      pathname: '/url-parser',
      search: '?key1=value&key2=value2',
      hash: '#the-hash',
    });
  });

  it('rejects relative URLs and invalid component assignments', () => {
    expect(parseUrl('/relative')).toBeUndefined();
    expect(updateUrlPart(INITIAL_URL, 'protocol', 'not a protocol').error).toBe(true);
    expect(updateUrlPart(INITIAL_URL, 'hostname', '').error).toBe(true);
    expect(updateUrlPart(INITIAL_URL, 'port', '70000').error).toBe(true);
  });

  it('edits and removes optional parts with native URL normalization', () => {
    expect(updateUrlPart(INITIAL_URL, 'protocol', 'http').value).toMatch(/^http:\/\//);
    expect(updateUrlPart(INITIAL_URL, 'pathname', '/a path').value).toContain('/a%20path');
    expect(updateUrlPart(INITIAL_URL, 'hash', '').value).not.toContain('#');
    expect(updateUrlPart('https://example.com:443', 'port', '443')).toEqual({
      error: false,
      value: 'https://example.com/',
    });
  });

  it('preserves duplicate query parameters while editing and removing exact entries', () => {
    const source = 'https://example.com/?tag=one&tag=two&empty=';
    expect(getQueryEntries(source)).toEqual([['tag', 'one'], ['tag', 'two'], ['empty', '']]);

    const edited = updateQueryEntry(source, 1, 'tag', 'two words');
    expect(edited).toBe('https://example.com/?tag=one&tag=two+words&empty=');
    expect(removeQueryEntry(edited, 0)).toBe('https://example.com/?tag=two+words&empty=');
    expect(addQueryEntry('https://example.com/')).toBe('https://example.com/?=');
  });
});
