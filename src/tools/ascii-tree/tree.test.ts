import { describe, expect, it } from 'vitest';
import { addEntry, canMove, moveEntry, removeEntry, renderAsciiTree, updateEntry, type TreeEntry } from './tree';

const node = (id: string, children: TreeEntry[] = []): TreeEntry => ({ id, label: id, children });
const forest = [node('A', [node('B', [node('C')]), node('D')]), node('E')];

describe('ASCII tree operations', () => {
  it('renders separate roots with correctly continued branches', () => {
    expect(renderAsciiTree(forest)).toBe('A\n├── B\n│   └── C\n└── D\n\nE');
    expect(renderAsciiTree([])).toBe('');
    expect(renderAsciiTree([node('root', [{ id: 'empty', label: ' \n ', children: [] }])])).toBe('root\n└── (untitled)');
  });

  it('adds siblings, children, and separate roots, and edits or deletes whole subtrees', () => {
    const child = addEntry(forest, 'D', 'child', node('F'));
    const sibling = addEntry(child, 'B', 'after', node('G'));
    const root = addEntry(sibling, null, 'root', node('H'));
    expect(renderAsciiTree(root)).toBe('A\n├── B\n│   └── C\n├── G\n└── D\n    └── F\n\nE\n\nH');
    expect(renderAsciiTree(updateEntry(root, 'G', ' renamed\n label '))).toContain('├── renamed label');
    expect(renderAsciiTree(removeEntry(root, 'B'))).not.toContain('C');
    expect(addEntry(root, 'missing', 'child', node('X'))).toBe(root);
  });

  it('moves a subtree within a tree or into a different root without losing its children', () => {
    expect(renderAsciiTree(moveEntry(forest, 'B', 'E', 'child'))).toBe('A\n└── D\n\nE\n└── B\n    └── C');
    expect(renderAsciiTree(moveEntry(forest, 'D', 'B', 'before'))).toBe('A\n├── D\n└── B\n    └── C\n\nE');
    expect(renderAsciiTree(moveEntry(forest, 'C', null, 'root'))).toBe('A\n├── B\n└── D\n\nE\n\nC');
  });

  it('rejects self, descendant, and missing targets without mutating the forest', () => {
    for (const [source, target, placement] of [
      ['A', 'C', 'child'], ['B', 'C', 'after'], ['B', 'B', 'before'], ['A', 'missing', 'child'],
    ] as const) {
      expect(canMove(forest, source, target, placement)).toBe(false);
      expect(moveEntry(forest, source, target, placement)).toBe(forest);
    }
    expect(canMove(forest, 'missing', null, 'root')).toBe(false);
    expect(forest[0].children[0].children[0].id).toBe('C');
  });
});
