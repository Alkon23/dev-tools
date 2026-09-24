export type TextCase = 'sentence' | 'title' | 'camel' | 'kebab';

function words(value: string): string[] {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

export function convertTextCase(value: string, target: TextCase): string {
  const parts = words(value);

  if (parts.length === 0) {
    return '';
  }

  switch (target) {
    case 'sentence':
      return `${parts.join(' ').replace(/^./, (letter) => letter.toUpperCase())}.`;
    case 'title':
      return parts.map((word) => word.replace(/^./, (letter) => letter.toUpperCase())).join(' ');
    case 'camel':
      return parts[0] + parts.slice(1).map((word) => word.replace(/^./, (letter) => letter.toUpperCase())).join('');
    case 'kebab':
      return parts.join('-');
  }
}
