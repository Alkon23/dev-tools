export interface TreeEntry {
  id: string;
  label: string;
  children: TreeEntry[];
}

export type Placement = 'before' | 'after' | 'child' | 'root';

export interface TreeRow {
  entry: TreeEntry;
  depth: number;
  index: number;
  siblings: number;
  parentId: string | null;
  previousSiblingId: string | null;
}

export function flattenTree(entries: TreeEntry[]): TreeRow[] {
  const rows: TreeRow[] = [];
  function visit(siblings: TreeEntry[], depth: number, parentId: string | null) {
    siblings.forEach((entry, index) => {
      rows.push({ entry, depth, index, siblings: siblings.length, parentId, previousSiblingId: siblings[index - 1]?.id ?? null });
      visit(entry.children, depth + 1, entry.id);
    });
  }
  visit(entries, 0, null);
  return rows;
}

export function updateEntry(entries: TreeEntry[], id: string, label: string): TreeEntry[] {
  return entries.map((entry) => entry.id === id
    ? { ...entry, label }
    : { ...entry, children: updateEntry(entry.children, id, label) });
}

export function removeEntry(entries: TreeEntry[], id: string): TreeEntry[] {
  return entries.filter((entry) => entry.id !== id).map((entry) => ({
    ...entry,
    children: removeEntry(entry.children, id),
  }));
}

function findEntry(entries: TreeEntry[], id: string): TreeEntry | undefined {
  for (const entry of entries) {
    if (entry.id === id) return entry;
    const child = findEntry(entry.children, id);
    if (child) return child;
  }
  return undefined;
}

function insertAt(entries: TreeEntry[], targetId: string, placement: Exclude<Placement, 'root'>, item: TreeEntry): TreeEntry[] {
  if (placement === 'child') {
    return entries.map((entry) => entry.id === targetId
      ? { ...entry, children: [...entry.children, item] }
      : { ...entry, children: insertAt(entry.children, targetId, placement, item) });
  }
  const index = entries.findIndex((entry) => entry.id === targetId);
  if (index !== -1) {
    const position = index + (placement === 'after' ? 1 : 0);
    return [...entries.slice(0, position), item, ...entries.slice(position)];
  }
  return entries.map((entry) => ({ ...entry, children: insertAt(entry.children, targetId, placement, item) }));
}

export function addEntry(entries: TreeEntry[], targetId: string | null, placement: Placement, item: TreeEntry): TreeEntry[] {
  if (placement === 'root') return [...entries, item];
  if (!targetId || !findEntry(entries, targetId)) return entries;
  return insertAt(entries, targetId, placement, item);
}

export function canMove(entries: TreeEntry[], sourceId: string, targetId: string | null, placement: Placement): boolean {
  const source = findEntry(entries, sourceId);
  if (!source) return false;
  if (placement === 'root') return true;
  return !!targetId && sourceId !== targetId && !!findEntry(entries, targetId) && !findEntry(source.children, targetId);
}

export function moveEntry(entries: TreeEntry[], sourceId: string, targetId: string | null, placement: Placement): TreeEntry[] {
  if (!canMove(entries, sourceId, targetId, placement)) return entries;
  const item = findEntry(entries, sourceId)!;
  const withoutSource = removeEntry(entries, sourceId);
  return addEntry(withoutSource, targetId, placement, item);
}

export function renderAsciiTree(entries: TreeEntry[]): string {
  function renderChildren(children: TreeEntry[], prefix: string): string[] {
    return children.flatMap((entry, index) => {
      const last = index === children.length - 1;
      return [
        `${prefix}${last ? '└── ' : '├── '}${entry.label.trim().replace(/\s+/g, ' ') || '(untitled)'}`,
        ...renderChildren(entry.children, `${prefix}${last ? '    ' : '│   '}`),
      ];
    });
  }
  return entries.map((entry) => [
    entry.label.trim().replace(/\s+/g, ' ') || '(untitled)',
    ...renderChildren(entry.children, ''),
  ].join('\n')).join('\n\n');
}
