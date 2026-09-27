export type KeyboardLayoutId = 'ansi' | 'spanish-iso';

export interface KeyboardKeyDefinition {
  code: string;
  label: string;
  secondaryLabel?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  shape?: 'iso-enter';
}

export interface KeyboardLayout {
  id: KeyboardLayoutId;
  label: string;
  keyCount: number;
  keys: readonly KeyboardKeyDefinition[];
}

type KeyLabels = Record<string, readonly [string, string?]>;

const key = (
  code: string,
  label: string,
  x: number,
  y: number,
  width = 1,
  height = 1,
  secondaryLabel?: string,
  shape?: 'iso-enter',
): KeyboardKeyDefinition => ({ code, label, x, y, width, height, secondaryLabel, shape });

function row(
  definitions: readonly (readonly [code: string, width?: number])[],
  labels: KeyLabels,
  y: number,
  startX = 0,
): KeyboardKeyDefinition[] {
  let x = startX;
  return definitions.map(([code, width = 1]) => {
    const [label, secondaryLabel] = labels[code] ?? [code];
    const definition = key(code, label, x, y, width, 1, secondaryLabel);
    x += width;
    return definition;
  });
}

const COMMON_LABELS: KeyLabels = {
  Escape: ['Esc'], F1: ['F1'], F2: ['F2'], F3: ['F3'], F4: ['F4'], F5: ['F5'], F6: ['F6'],
  F7: ['F7'], F8: ['F8'], F9: ['F9'], F10: ['F10'], F11: ['F11'], F12: ['F12'],
  PrintScreen: ['Print', 'Screen'], ScrollLock: ['Scroll', 'Lock'], Pause: ['Pause'],
  KeyQ: ['Q'], KeyW: ['W'], KeyE: ['E'], KeyR: ['R'], KeyT: ['T'], KeyY: ['Y'], KeyU: ['U'],
  KeyI: ['I'], KeyO: ['O'], KeyP: ['P'], KeyA: ['A'], KeyS: ['S'], KeyD: ['D'], KeyF: ['F'],
  KeyG: ['G'], KeyH: ['H'], KeyJ: ['J'], KeyK: ['K'], KeyL: ['L'], KeyZ: ['Z'], KeyX: ['X'],
  KeyC: ['C'], KeyV: ['V'], KeyB: ['B'], KeyN: ['N'], KeyM: ['M'],
  ControlLeft: ['Ctrl'], MetaLeft: ['Meta'], AltLeft: ['Alt'], Space: ['Space'], AltRight: ['Alt'],
  MetaRight: ['Meta'], ContextMenu: ['Menu'], ControlRight: ['Ctrl'],
  Insert: ['Insert'], Home: ['Home'], PageUp: ['Page', 'Up'], Delete: ['Delete'], End: ['End'],
  PageDown: ['Page', 'Down'], ArrowUp: ['↑'], ArrowLeft: ['←'], ArrowDown: ['↓'], ArrowRight: ['→'],
  NumLock: ['Num', 'Lock'], NumpadDivide: ['/'], NumpadMultiply: ['×'], NumpadSubtract: ['−'],
  Numpad7: ['7'], Numpad8: ['8'], Numpad9: ['9'], NumpadAdd: ['+'], Numpad4: ['4'], Numpad5: ['5'],
  Numpad6: ['6'], Numpad1: ['1'], Numpad2: ['2'], Numpad3: ['3'], NumpadEnter: ['Enter'],
  Numpad0: ['0'], NumpadDecimal: ['.'],
};

const ANSI_LABELS: KeyLabels = {
  ...COMMON_LABELS,
  Backquote: ['`', '~'], Digit1: ['1', '!'], Digit2: ['2', '@'], Digit3: ['3', '#'], Digit4: ['4', '$'],
  Digit5: ['5', '%'], Digit6: ['6', '^'], Digit7: ['7', '&'], Digit8: ['8', '*'], Digit9: ['9', '('],
  Digit0: ['0', ')'], Minus: ['-', '_'], Equal: ['=', '+'], Backspace: ['Backspace'], Tab: ['Tab'],
  BracketLeft: ['[', '{'], BracketRight: [']', '}'], Backslash: ['\\', '|'], CapsLock: ['Caps Lock'],
  Semicolon: [';', ':'], Quote: ["'", '"'], Enter: ['Enter'], ShiftLeft: ['Shift'], Comma: [',', '<'],
  Period: ['.', '>'], Slash: ['/', '?'], ShiftRight: ['Shift'],
};

const SPANISH_LABELS: KeyLabels = {
  ...COMMON_LABELS,
  Backquote: ['º', 'ª'], Digit1: ['1', '!'], Digit2: ['2', '"'], Digit3: ['3', '·'], Digit4: ['4', '$'],
  Digit5: ['5', '%'], Digit6: ['6', '&'], Digit7: ['7', '/'], Digit8: ['8', '('], Digit9: ['9', ')'],
  Digit0: ['0', '='], Minus: ["'", '?'], Equal: ['¡', '¿'], Backspace: ['Retroceso'], Tab: ['Tab'],
  BracketLeft: ['`', '^'], BracketRight: ['+', '*'], Backslash: ['ç', 'Ç'], CapsLock: ['Bloq Mayús'],
  Semicolon: ['ñ', 'Ñ'], Quote: ['´', '¨'], Enter: ['Intro'], ShiftLeft: ['Mayús'], IntlBackslash: ['<', '>'],
  Comma: [',', ';'], Period: ['.', ':'], Slash: ['-', '_'], ShiftRight: ['Mayús'], AltRight: ['Alt Gr'],
};

const FUNCTION_KEYS: KeyboardKeyDefinition[] = [
  key('Escape', 'Esc', 0, 0),
  ...row([['F1'], ['F2'], ['F3'], ['F4']], COMMON_LABELS, 0, 2),
  ...row([['F5'], ['F6'], ['F7'], ['F8']], COMMON_LABELS, 0, 6.5),
  ...row([['F9'], ['F10'], ['F11'], ['F12']], COMMON_LABELS, 0, 11),
  ...row([['PrintScreen'], ['ScrollLock'], ['Pause']], COMMON_LABELS, 0, 15.5),
];

const NAVIGATION_KEYS: KeyboardKeyDefinition[] = [
  ...row([['Insert'], ['Home'], ['PageUp']], COMMON_LABELS, 1.5, 15.5),
  ...row([['Delete'], ['End'], ['PageDown']], COMMON_LABELS, 2.5, 15.5),
  key('ArrowUp', '↑', 16.5, 4.5),
  ...row([['ArrowLeft'], ['ArrowDown'], ['ArrowRight']], COMMON_LABELS, 5.5, 15.5),
];

const NUMPAD_KEYS: KeyboardKeyDefinition[] = [
  ...row([['NumLock'], ['NumpadDivide'], ['NumpadMultiply'], ['NumpadSubtract']], COMMON_LABELS, 1.5, 19),
  ...row([['Numpad7'], ['Numpad8'], ['Numpad9']], COMMON_LABELS, 2.5, 19),
  key('NumpadAdd', '+', 22, 2.5, 1, 2),
  ...row([['Numpad4'], ['Numpad5'], ['Numpad6']], COMMON_LABELS, 3.5, 19),
  ...row([['Numpad1'], ['Numpad2'], ['Numpad3']], COMMON_LABELS, 4.5, 19),
  key('NumpadEnter', 'Enter', 22, 4.5, 1, 2),
  key('Numpad0', '0', 19, 5.5, 2),
  key('NumpadDecimal', '.', 21, 5.5),
];

const ANSI_MAIN_KEYS: KeyboardKeyDefinition[] = [
  ...row([
    ['Backquote'], ['Digit1'], ['Digit2'], ['Digit3'], ['Digit4'], ['Digit5'], ['Digit6'], ['Digit7'],
    ['Digit8'], ['Digit9'], ['Digit0'], ['Minus'], ['Equal'], ['Backspace', 2],
  ], ANSI_LABELS, 1.5),
  ...row([
    ['Tab', 1.5], ['KeyQ'], ['KeyW'], ['KeyE'], ['KeyR'], ['KeyT'], ['KeyY'], ['KeyU'], ['KeyI'], ['KeyO'],
    ['KeyP'], ['BracketLeft'], ['BracketRight'], ['Backslash', 1.5],
  ], ANSI_LABELS, 2.5),
  ...row([
    ['CapsLock', 1.75], ['KeyA'], ['KeyS'], ['KeyD'], ['KeyF'], ['KeyG'], ['KeyH'], ['KeyJ'], ['KeyK'],
    ['KeyL'], ['Semicolon'], ['Quote'], ['Enter', 2.25],
  ], ANSI_LABELS, 3.5),
  ...row([
    ['ShiftLeft', 2.25], ['KeyZ'], ['KeyX'], ['KeyC'], ['KeyV'], ['KeyB'], ['KeyN'], ['KeyM'], ['Comma'],
    ['Period'], ['Slash'], ['ShiftRight', 2.75],
  ], ANSI_LABELS, 4.5),
  ...row([
    ['ControlLeft', 1.25], ['MetaLeft', 1.25], ['AltLeft', 1.25], ['Space', 6.25], ['AltRight', 1.25],
    ['MetaRight', 1.25], ['ContextMenu', 1.25], ['ControlRight', 1.25],
  ], ANSI_LABELS, 5.5),
];

const ISO_MAIN_KEYS: KeyboardKeyDefinition[] = [
  ...row([
    ['Backquote'], ['Digit1'], ['Digit2'], ['Digit3'], ['Digit4'], ['Digit5'], ['Digit6'], ['Digit7'],
    ['Digit8'], ['Digit9'], ['Digit0'], ['Minus'], ['Equal'], ['Backspace', 2],
  ], SPANISH_LABELS, 1.5),
  ...row([
    ['Tab', 1.5], ['KeyQ'], ['KeyW'], ['KeyE'], ['KeyR'], ['KeyT'], ['KeyY'], ['KeyU'], ['KeyI'], ['KeyO'],
    ['KeyP'], ['BracketLeft'], ['BracketRight'],
  ], SPANISH_LABELS, 2.5),
  ...row([
    ['CapsLock', 1.75], ['KeyA'], ['KeyS'], ['KeyD'], ['KeyF'], ['KeyG'], ['KeyH'], ['KeyJ'], ['KeyK'],
    ['KeyL'], ['Semicolon'], ['Quote'], ['Backslash'],
  ], SPANISH_LABELS, 3.5),
  key('Enter', 'Intro', 13.5, 2.5, 1.5, 2, undefined, 'iso-enter'),
  ...row([
    ['ShiftLeft', 1.25], ['IntlBackslash'], ['KeyZ'], ['KeyX'], ['KeyC'], ['KeyV'], ['KeyB'], ['KeyN'],
    ['KeyM'], ['Comma'], ['Period'], ['Slash'], ['ShiftRight', 2.75],
  ], SPANISH_LABELS, 4.5),
  ...row([
    ['ControlLeft', 1.25], ['MetaLeft', 1.25], ['AltLeft', 1.25], ['Space', 6.25], ['AltRight', 1.25],
    ['MetaRight', 1.25], ['ContextMenu', 1.25], ['ControlRight', 1.25],
  ], SPANISH_LABELS, 5.5),
];

function createLayout(id: KeyboardLayoutId, label: string, mainKeys: KeyboardKeyDefinition[]): KeyboardLayout {
  const keys = [...FUNCTION_KEYS, ...mainKeys, ...NAVIGATION_KEYS, ...NUMPAD_KEYS];
  return { id, label, keyCount: keys.length, keys };
}

export const KEYBOARD_LAYOUTS: Record<KeyboardLayoutId, KeyboardLayout> = {
  ansi: createLayout('ansi', 'Standard ANSI', ANSI_MAIN_KEYS),
  'spanish-iso': createLayout('spanish-iso', 'Spanish ISO', ISO_MAIN_KEYS),
};

export function getKeyboardLayout(id: KeyboardLayoutId): KeyboardLayout {
  return KEYBOARD_LAYOUTS[id];
}

export function isNumpadKey(key: KeyboardKeyDefinition): boolean {
  return key.code === 'NumLock' || key.code.startsWith('Numpad');
}
