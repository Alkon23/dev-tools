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
    <section className={`identifier-row identifier-row-${result.status}`} aria-labelledby={`${definition.kind}-label`}>
      <div className="identifier-row-heading">
        <div>
          <h2 id={`${definition.kind}-label`}>{definition.label}</h2>
          <p id={`${definition.kind}-hint`}>Example: {definition.example}</p>
        </div>
        <span className={`identifier-badge identifier-badge-${result.status}`}>
          {result.status === 'valid' && <Check size={14} aria-hidden="true" />}
          {result.status === 'invalid' && <CircleAlert size={14} aria-hidden="true" />}
          {result.status === 'empty' ? 'Ready' : result.status}
        </span>
      </div>

      <div className="identifier-cells" role="group" aria-labelledby={`${definition.kind}-label`}>
        {characters.map((character, index) => (
          <div className="identifier-cell-group" key={index}>
            <input
              aria-describedby={describedBy}
              aria-invalid={result.status === 'invalid'}
              aria-label={`${definition.label} character ${index + 1} of ${definition.length}`}
              autoCapitalize="characters"
              autoComplete="off"
              className="identifier-cell"
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
            {separators.has(index) && <span className="identifier-separator" aria-hidden="true">-</span>}
          </div>
        ))}
      </div>

      <p className={`identifier-status identifier-status-${result.status}`} id={`${definition.kind}-status`} aria-live="polite">
        {result.message}
      </p>
    </section>
  );
}

export default function IssnIsbnValidatorTool() {
  return (
    <section className="tool-card identifier-validator" aria-label="ISSN and ISBN validator">
      <div className="identifier-intro">
        <span className="section-index">CHECK DIGITS</span>
        <p>Type each identifier below or paste a complete value into its first box.</p>
      </div>
      <div className="identifier-rows">
        {IDENTIFIER_DEFINITIONS.map((definition) => (
          <IdentifierRow definition={definition} key={definition.kind} />
        ))}
      </div>
    </section>
  );
}
