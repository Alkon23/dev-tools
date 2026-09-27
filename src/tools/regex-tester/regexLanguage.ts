import * as monaco from 'monaco-editor/editor/editor.api.js';

export const REGEX_LANGUAGE_ID = 'javascript-regexp';
export const REGEX_THEME_ID = 'regex-tester-light';

export function registerRegexLanguage(): void {
  if (!monaco.languages.getLanguages().some(({ id }) => id === REGEX_LANGUAGE_ID)) {
    monaco.languages.register({ id: REGEX_LANGUAGE_ID });
    monaco.languages.setMonarchTokensProvider(REGEX_LANGUAGE_ID, {
      tokenizer: {
        root: [
          [/\\[pP]\{[^}]+\}/, 'regexp.escape'],
          [/\\(?:[dDsSwWbBtrnvf0]|c[A-Za-z]|x[\da-fA-F]{2}|u(?:[\da-fA-F]{4}|\{[\da-fA-F]+\})|k<[^>]+>|[1-9]\d*|.)/, 'regexp.escape'],
          [/\[(?:\^)?/, { token: 'regexp.character-class', next: '@characterClass' }],
          [/\(\?(?:<[^=!][^>]*>|[:=!]|<[=!])/, 'regexp.group'],
          [/[()]/, 'regexp.group'],
          [/(?:\{\d+(?:,\d*)?\}|[*+?])\??/, 'regexp.quantifier'],
          [/[\^$]/, 'regexp.anchor'],
          [/\|/, 'regexp.alternation'],
          [/./, 'regexp.literal'],
        ],
        characterClass: [
          [/\\[pP]\{[^}]+\}/, 'regexp.escape'],
          [/\\./, 'regexp.escape'],
          [/\]/, { token: 'regexp.character-class', next: '@pop' }],
          [/-/, 'regexp.range'],
          [/./, 'regexp.character-class'],
        ],
      },
    });
  }

  monaco.editor.defineTheme(REGEX_THEME_ID, {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'regexp.literal', foreground: '2E3834' },
      { token: 'regexp.escape', foreground: '00756A', fontStyle: 'bold' },
      { token: 'regexp.character-class', foreground: '9A5B00', fontStyle: 'bold' },
      { token: 'regexp.range', foreground: 'B33B2E', fontStyle: 'bold' },
      { token: 'regexp.group', foreground: '6F42C1', fontStyle: 'bold' },
      { token: 'regexp.quantifier', foreground: 'B83C00', fontStyle: 'bold' },
      { token: 'regexp.anchor', foreground: 'B42366', fontStyle: 'bold' },
      { token: 'regexp.alternation', foreground: 'B33B2E', fontStyle: 'bold' },
    ],
    colors: {
      'editor.background': '#F8FAF9',
      'editor.foreground': '#211F1A',
      'editorCursor.foreground': '#8C6500',
      'editor.selectionBackground': '#F3D77A66',
      'editor.inactiveSelectionBackground': '#E8DFC466',
      'editorLineNumber.foreground': '#939C98',
    },
  });
}
