export function convertTextToUnicode(text: string): string {
  return text.split('').map((character) => `&#${character.charCodeAt(0)};`).join('');
}

export function convertUnicodeToText(unicode: string): string {
  return unicode.replace(/&#(\d+);/g, (_entity, value: string) => String.fromCharCode(Number(value)));
}
