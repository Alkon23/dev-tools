interface Cell {
  value: string;
  start: number;
  end: number;
  contentStart: number;
}

interface Row {
  cells: Cell[];
  indent: string;
}

interface PositionMap {
  oldStart: number;
  oldEnd: number;
  newStart: number;
  newEnd: number;
}

type Alignment = 'plain' | 'left' | 'right' | 'center';

function parseRow(line: string): Row | null {
  const indent = line.match(/^ */)?.[0] ?? '';
  const trimmed = line.trim();
  if (!trimmed.includes('|') || indent.length > 3) return null;

  const bodyStart = line.indexOf(trimmed) + (trimmed.startsWith('|') ? 1 : 0);
  const body = trimmed.slice(trimmed.startsWith('|') ? 1 : 0, trimmed.endsWith('|') ? -1 : undefined);
  const cells: Cell[] = [];
  let start = 0;

  function addCell(end: number) {
    const raw = body.slice(start, end);
    cells.push({
      value: raw.trim(),
      start: bodyStart + start,
      end: bodyStart + end,
      contentStart: bodyStart + start + (raw.match(/^\s*/)?.[0].length ?? 0),
    });
    start = end + 1;
  }

  for (let index = 0; index < body.length; index++) {
    if (body[index] === '`') {
      let end = index + 1;
      while (body[end] === '`') end++;
      const closing = body.indexOf('`'.repeat(end - index), end);
      if (closing !== -1) { index = closing + end - index - 1; continue; }
    }
    if (body[index] !== '|') continue;
    let escapes = 0;
    for (let previous = index - 1; body[previous] === '\\'; previous--) escapes++;
    if (escapes % 2 === 0) addCell(index);
  }
  addCell(body.length);
  return { cells, indent };
}

function alignment(cell: Cell): Alignment | null {
  return /^:?-{3,}:?$/.test(cell.value)
    ? cell.value.startsWith(':') && cell.value.endsWith(':') ? 'center'
      : cell.value.endsWith(':') ? 'right' : cell.value.startsWith(':') ? 'left' : 'plain'
    : null;
}

function formatRow(row: Row, widths: number[], alignments: Alignment[], separator: boolean) {
  let output = `${row.indent}|`;
  const positions: PositionMap[] = [];
  row.cells.forEach((cell, index) => {
    const align = alignments[index];
    const width = widths[index];
    const content = separator
      ? `${align === 'center' || align === 'left' ? ':' : ''}${'-'.repeat(width - (align === 'center' ? 2 : align === 'right' || align === 'left' ? 1 : 0))}${align === 'right' || align === 'center' ? ':' : ''}`
      : cell.value;
    const extra = width - content.length;
    const left = separator ? 0 : align === 'right' ? extra : align === 'center' ? Math.floor(extra / 2) : 0;
    const right = separator ? 0 : extra - left;
    const newStart = output.length + 1 + left;
    output += ` ${' '.repeat(left)}${content}${' '.repeat(right)} |`;
    positions.push({ oldStart: cell.contentStart, oldEnd: cell.contentStart + cell.value.length, newStart, newEnd: newStart + content.length });
  });

  return { text: output, mapColumn(column: number) {
    if (column === 0) return 0;
    for (const position of positions) {
      if (column < position.oldStart) return position.newStart;
      if (column <= position.oldEnd) return position.newStart + column - position.oldStart;
    }
    return output.length;
  } };
}

export function alignMarkdownTables(source: string) {
  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  const original = source.split(newline);
  const formatted = original.map((line) => ({ text: line, mapColumn: (column: number) => column }));
  let fence: { marker: string; length: number } | null = null;

  for (let index = 0; index < original.length; index++) {
    const marker = original[index].match(/^ {0,3}(`{3,}|~{3,})/);
    if (marker) {
      const sequence = marker[1];
      if (!fence) fence = { marker: sequence[0], length: sequence.length };
      else if (sequence[0] === fence.marker && sequence.length >= fence.length) fence = null;
      continue;
    }
    if (fence || index + 1 >= original.length) continue;

    const header = parseRow(original[index]);
    const divider = parseRow(original[index + 1]);
    if (!header || !divider || header.cells.length < 2 || header.cells.length !== divider.cells.length) continue;
    const alignments = divider.cells.map(alignment);
    if (alignments.some((value) => value === null)) continue;

    const rows = [header, divider];
    while (index + rows.length < original.length) {
      const next = parseRow(original[index + rows.length]);
      if (!next || next.cells.length !== header.cells.length) break;
      rows.push(next);
    }
    const widths = header.cells.map((_, column) => Math.max(
      3,
      ...rows.filter((_, row) => row !== 1).map((row) => row.cells[column].value.length),
      alignments[column] === 'center' ? 2 : 1,
    ));
    rows.forEach((row, rowIndex) => {
      formatted[index + rowIndex] = formatRow(row, widths, alignments as Alignment[], rowIndex === 1);
    });
    index += rows.length - 1;
  }

  const text = formatted.map((line) => line.text).join(newline);
  return { text, mapOffset(offset: number) {
    let oldStart = 0;
    let newStart = 0;
    for (let index = 0; index < original.length; index++) {
      const end = oldStart + original[index].length;
      if (offset <= end || index === original.length - 1) {
        return newStart + formatted[index].mapColumn(Math.max(0, Math.min(offset - oldStart, original[index].length)));
      }
      oldStart = end + newline.length;
      newStart += formatted[index].text.length + newline.length;
    }
    return text.length;
  } };
}
