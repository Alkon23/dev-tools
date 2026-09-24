export interface TextStatistics {
  characters: number;
  words: number;
  lines: number;
  bytes: number;
}

export function getTextStatistics(text: string): TextStatistics {
  const trimmed = text.trim();

  return {
    characters: text.length,
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    lines: text ? text.split(/\r\n|\r|\n/).length : 0,
    bytes: new TextEncoder().encode(text).byteLength,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = Number.parseFloat((bytes / 1024 ** unitIndex).toFixed(2));

  return `${value} ${units[unitIndex]}`;
}
