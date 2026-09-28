import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { Check, CircleAlert } from 'lucide-react';
import {
  IDENTIFIER_DEFINITIONS,
  cleanIdentifier,
  isAllowedCharacter,
  validateIdentifier,
  type IdentifierDefinition,
} from './identifierValidator';

interface IdentifierRowProps {
  definition: IdentifierDefinition;
}

function IdentifierRow({ definition }: IdentifierRowProps) {
  const [characters, setCharacters] = useState(() => Array<string>(definition.length).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const value = characters.join('');
  const result = validateIdentifier(definition.kind, value);
  const describedBy = `${definition.kind}-hint ${definition.kind}-status`;
  const separators = new Set<number>();
  let groupEnd = 0;

  for (const size of definition.groups.slice(0, -1)) {
    groupEnd += size;
    separators.add(groupEnd - 1);
  }

  function focusCell(index: number) {
    inputRefs.current[Math.max(0, Math.min(index, definition.length - 1))]?.focus();
  }

  function updateCharacter(index: number, rawValue: string) {
    const nextCharacter = rawValue.slice(-1).toUpperCase();
    if (nextCharacter && !isAllowedCharacter(definition.kind, nextCharacter, index)) {
      return;
    }

    setCharacters((current) => current.map((character, cellIndex) => (
      cellIndex === index ? nextCharacter : character
    )));
    if (nextCharacter && index < definition.length - 1) {
      focusCell(index + 1);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusCell(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusCell(index + 1);
    } else if (event.key === 'Backspace' && !characters[index] && index > 0) {
      event.preventDefault();
      setCharacters((current) => current.map((character, cellIndex) => (
        cellIndex === index - 1 ? '' : character
      )));
      focusCell(index - 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>, startIndex: number) {
    event.preventDefault();
    const pasted = cleanIdentifier(event.clipboardData.getData('text'));
    const accepted = [...pasted].filter((character, offset) => (
      isAllowedCharacter(definition.kind, character, startIndex + offset)
    ));

    if (!accepted.length) {
      return;
    }

    setCharacters((current) => {
      const next = [...current];
      accepted.slice(0, definition.length - startIndex).forEach((character, offset) => {
        next[startIndex + offset] = character;
      });
      return next;
    });
    focusCell(Math.min(startIndex + accepted.length, definition.length - 1));
  }

  return (
    <section className="border-line py-[clamp(24px,3vw,34px)] not-first:border-t max-[760px]:overflow-x-auto max-[760px]:pb-5" aria-labelledby={`${definition.kind}-label`}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="mt-0 mb-1 text-[17px]" id={`${definition.kind}-label`}>{definition.label}</h2>
          <p className="m-0 font-mono text-[10px] text-muted" id={`${definition.kind}-hint`}>Example: {definition.example}</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-[9px] py-1.5 font-mono text-[9px] font-semibold tracking-[0.06em] uppercase ${result.status === 'valid' ? 'bg-[#e4f4e9] text-[#28733e]' : result.status === 'invalid' ? 'bg-[#fae7e5] text-[#9a382f]' : 'bg-[#f1f4f2] text-[#66716d]'}`}>
          {result.status === 'valid' && <Check size={14} aria-hidden="true" />}
          {result.status === 'invalid' && <CircleAlert size={14} aria-hidden="true" />}
          {result.status === 'empty' ? 'Ready' : result.status}
        </span>
      </div>

      <div className="flex min-w-max gap-2.5" role="group" aria-labelledby={`${definition.kind}-label`}>
        {characters.map((character, index) => (
          <div className="flex items-center gap-2.5" key={index}>
            <input
              aria-describedby={describedBy}
              aria-invalid={result.status === 'invalid'}
              aria-label={`${definition.label} character ${index + 1} of ${definition.length}`}
              autoCapitalize="characters"
              autoComplete="off"
              className={`aspect-square w-[54px] rounded-[9px] border bg-[#f8faf9] p-0 text-center font-mono text-[22px] font-semibold text-ink transition-[border-color,box-shadow,background] focus:border-accent focus:bg-[#fffdf5] focus:shadow-focus focus:outline-0 aria-invalid:border-[#d49690] max-[760px]:w-12 ${result.status === 'valid' ? 'border-[#96cda6]' : 'border-[#d8dfdc]'}`}
              inputMode={index === definition.length - 1 && definition.kind !== 'isbn13' ? 'text' : 'numeric'}
              maxLength={1}
              onChange={(event) => updateCharacter(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onPaste={(event) => handlePaste(event, index)}
              ref={(element) => { inputRefs.current[index] = element; }}
              spellCheck={false}
              type="text"
              value={character}
            />
            {separators.has(index) && <span className="font-mono text-[21px] font-semibold text-[#53605b]" aria-hidden="true">-</span>}
          </div>
        ))}
      </div>

      <p className={`mt-[13px] mb-0 min-h-[18px] text-xs ${result.status === 'valid' ? 'text-[#28733e]' : result.status === 'invalid' ? 'text-[#a53b32]' : 'text-muted'}`} id={`${definition.kind}-status`} aria-live="polite">
        {result.message}
      </p>
    </section>
  );
}

export default function IssnIsbnValidatorTool() {
  return (
    <section className="tool-card mx-auto max-w-[1180px] overflow-hidden max-[420px]:px-[18px]" aria-label="ISSN and ISBN validator">
      <div className="mb-1 flex items-baseline justify-between gap-[18px] border-b border-line pb-5 max-[760px]:items-start max-[760px]:flex-col max-[760px]:gap-2">
        <span className="section-index">CHECK DIGITS</span>
        <p className="m-0 text-xs text-muted">Type each identifier below or paste a complete value into its first box.</p>
      </div>
      <div className="flex flex-col">
        {IDENTIFIER_DEFINITIONS.map((definition) => (
          <IdentifierRow definition={definition} key={definition.kind} />
        ))}
      </div>
    </section>
  );
}
