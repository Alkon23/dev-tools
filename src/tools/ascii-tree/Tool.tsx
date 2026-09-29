import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Clipboard, GripVertical, Plus, Trash2 } from 'lucide-react';
import { addEntry, canMove, flattenTree, moveEntry, removeEntry, renderAsciiTree, updateEntry, type Placement, type TreeEntry } from './tree';

const TREE_CHARACTERS = ['├', '└', '│', '─'] as const;

export default function AsciiTreeTool() {
  const [entries, setEntries] = useState<TreeEntry[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const nextId = useRef(0);
  const pointerDrag = useRef<{ id: string; pointerId: number; x: number; y: number; active: boolean } | null>(null);
  const focusId = useRef<string | null>(null);
  const copyTimer = useRef<number | null>(null);
  const rows = flattenTree(entries);
  const output = renderAsciiTree(entries);

  useEffect(() => () => {
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
  }, []);

  function createEntry(targetId: string | null, placement: Placement) {
    const id = `entry-${++nextId.current}`;
    focusId.current = id;
    setEntries((current) => addEntry(current, targetId, placement, { id, label: '', children: [] }));
  }

  function finishDrag() {
    pointerDrag.current = null;
    setDraggedId(null);
    setDropTarget(null);
  }

  function targetAt(x: number, y: number, sourceId: string): { id: string | null; placement: Placement } | null {
    const element = document.elementFromPoint(x, y);
    if (element?.closest('[data-tree-root]')) return { id: null, placement: 'root' };
    const row = element?.closest<HTMLElement>('[data-tree-entry]');
    if (!row) return null;
    const id = row.dataset.treeEntry ?? null;
    const bounds = row.getBoundingClientRect();
    const position = (y - bounds.top) / bounds.height;
    const placement = position < 0.3 ? 'before' : position > 0.7 ? 'after' : 'child';
    return canMove(entries, sourceId, id, placement) ? { id, placement } : null;
  }

  function startPointer(event: PointerEvent<HTMLButtonElement>, id: string) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerDrag.current = { id, pointerId: event.pointerId, x: event.clientX, y: event.clientY, active: false };
  }

  function movePointer(event: PointerEvent<HTMLButtonElement>) {
    const drag = pointerDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.active) {
      if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 5) return;
      drag.active = true;
      setDraggedId(drag.id);
    }
    const target = targetAt(event.clientX, event.clientY, drag.id);
    setDropTarget(target ? `${target.id ?? 'root'}-${target.placement}` : null);
  }

  function endPointer(event: PointerEvent<HTMLButtonElement>) {
    const drag = pointerDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.active) {
      const target = targetAt(event.clientX, event.clientY, drag.id);
      if (target) setEntries((current) => moveEntry(current, drag.id, target.id, target.placement));
    }
    finishDrag();
  }

  async function copyText(value: string, key: string) {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <section className="mx-auto grid w-full max-w-[1400px] grid-cols-2 items-start gap-[18px] max-[760px]:grid-cols-1" aria-label="ASCII tree generator">
      <div className="tool-card min-w-0">
        <span className="section-index">INPUT</span>
        <h2 className="mt-2 mb-1 text-[19px] font-semibold">Build your trees</h2>
        <p className="mt-0 mb-5 text-xs leading-5 text-muted">Add roots, siblings, or children. Drag the grip onto an entry: top to place before, middle to make a child, bottom to place after.</p>

        <div className="mb-4 flex flex-wrap gap-2">
          <button className="button button-primary" onClick={() => createEntry(null, 'root')} type="button"><Plus size={16} aria-hidden="true" /> Add tree</button>
          <button className="button button-secondary" disabled={!entries.length} onClick={() => setEntries([])} type="button">Clear all</button>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-[8px] border border-dashed border-[#d8dfdc] bg-[#f8faf9] px-4 py-8 text-center text-xs text-muted">Add a tree to get started.</p>
        ) : (
          <div aria-label="Tree entries" className="space-y-1.5" role="list">
            {rows.map(({ entry, depth, index, siblings, parentId, previousSiblingId }) => {
              const name = entry.label.trim() || 'untitled entry';
              return (
                <div className="min-w-0" key={entry.id} role="listitem" style={{ paddingInlineStart: `${depth * 16}px` }}>
                  <div
                    className={`relative rounded-[8px] border p-2 ${draggedId === entry.id ? 'border-accent opacity-50' : dropTarget?.startsWith(`${entry.id}-`) ? 'border-accent-dark bg-[#fff8e4]' : 'border-[#d8dfdc] bg-[#f8faf9]'}`}
                    data-tree-entry={entry.id}
                  >
                    {dropTarget?.startsWith(`${entry.id}-`) && <span className="pointer-events-none absolute -top-2 right-2 rounded bg-accent-dark px-1.5 py-0.5 text-[10px] font-semibold text-white">{dropTarget.endsWith('-child') ? 'Make child' : dropTarget.endsWith('-before') ? 'Place before' : 'Place after'}</span>}
                    <div className="flex min-w-0 items-center gap-1.5">
                      <button
                        aria-label={`Drag ${name}`}
                        className="shrink-0 cursor-grab touch-none rounded p-1 text-muted hover:bg-[#e9edeb] active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-accent-dark"
                        onPointerCancel={finishDrag}
                        onPointerDown={(event) => startPointer(event, entry.id)}
                        onPointerMove={movePointer}
                        onPointerUp={endPointer}
                        title={`Drag ${name}`}
                        type="button"
                      ><GripVertical size={17} aria-hidden="true" /></button>
                      <input
                        aria-label={`Name for ${name}`}
                        className="input-control min-w-0 flex-1 py-1.5 text-xs"
                        maxLength={200}
                        onChange={(event) => setEntries((current) => updateEntry(current, entry.id, event.target.value))}
                        placeholder="New entry"
                        ref={(element) => {
                          if (element && focusId.current === entry.id) { element.focus(); element.select(); focusId.current = null; }
                        }}
                        value={entry.label}
                      />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1 pl-7">
                      <button aria-label={`Add sibling after ${name}`} className="button button-secondary min-h-8 px-2 py-1" onClick={() => createEntry(entry.id, 'after')} title="Add sibling" type="button"><Plus size={14} aria-hidden="true" /> Sibling</button>
                      <button aria-label={`Add child to ${name}`} className="button button-secondary min-h-8 px-2 py-1" onClick={() => createEntry(entry.id, 'child')} title="Add child" type="button"><Plus size={14} aria-hidden="true" /> Child</button>
                      <button aria-label={`Move ${name} up`} className="button button-secondary min-h-8 px-2 py-1" disabled={index === 0} onClick={() => setEntries((current) => moveEntry(current, entry.id, previousSiblingId, 'before'))} title="Move up" type="button"><ArrowUp size={14} aria-hidden="true" /></button>
                      <button aria-label={`Move ${name} down`} className="button button-secondary min-h-8 px-2 py-1" disabled={index === siblings - 1} onClick={() => {
                        const rowIndex = rows.findIndex((row) => row.entry.id === entry.id);
                        const nextSibling = rows.slice(rowIndex + 1).find((row) => row.depth === depth);
                        if (nextSibling) setEntries((current) => moveEntry(current, entry.id, nextSibling.entry.id, 'after'));
                      }} title="Move down" type="button"><ArrowDown size={14} aria-hidden="true" /></button>
                      <button aria-label={`Indent ${name}`} className="button button-secondary min-h-8 px-2 py-1" disabled={!previousSiblingId} onClick={() => setEntries((current) => moveEntry(current, entry.id, previousSiblingId, 'child'))} title="Make child of previous sibling" type="button"><ArrowRight size={14} aria-hidden="true" /></button>
                      <button aria-label={`Outdent ${name}`} className="button button-secondary min-h-8 px-2 py-1" disabled={!parentId} onClick={() => setEntries((current) => moveEntry(current, entry.id, parentId, 'after'))} title="Move after parent" type="button"><ArrowLeft size={14} aria-hidden="true" /></button>
                      <button aria-label={`Delete ${name} and children`} className="button button-secondary min-h-8 px-2 py-1" onClick={() => setEntries((current) => removeEntry(current, entry.id))} title="Delete entry and children" type="button"><Trash2 size={14} aria-hidden="true" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
            {draggedId && (
              <div
                aria-label="Drop as a new tree at the end"
                data-tree-root=""
                className={`rounded-[8px] border-2 border-dashed px-3 py-3 text-center text-xs ${dropTarget === 'root-root' ? 'border-accent-dark bg-[#fff2c2]' : 'border-[#d8dfdc] text-muted'}`}
              >Drop here to make a separate tree</div>
            )}
          </div>
        )}
      </div>

      <div className="tool-card min-w-0">
        <span className="section-index">RESULT</span>
        <h2 className="mt-2 mb-1 text-[19px] font-semibold">ASCII output</h2>
        <p className="mt-0 mb-5 text-xs leading-5 text-muted">Each top-level entry starts a separate tree.</p>
        <label className="sr-only" htmlFor="ascii-tree-output">Generated ASCII trees</label>
        <textarea className="min-h-[360px] font-mono text-xs" id="ascii-tree-output" placeholder="Your ASCII trees will appear here..." readOnly spellCheck={false} value={output} />
        <div className="mt-4 border-t border-line pt-4">
          <p className="mt-0 mb-2 text-xs font-semibold text-[#45504c]">Copy a tree character</p>
          <div className="flex flex-wrap gap-2">
            {TREE_CHARACTERS.map((character) => (
              <button
                aria-label={`Copy ${character} character`}
                className="button button-secondary min-h-10 min-w-11 px-3 font-mono text-lg"
                key={character}
                onClick={() => copyText(character, `character-${character}`)}
                title={`Copy ${character}`}
                type="button"
              >{character}{copied === `character-${character}` && <Check size={13} aria-hidden="true" />}</button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="button button-primary" disabled={!output} onClick={() => copyText(output, 'output')} type="button">
            {copied === 'output' ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}
            {copied === 'output' ? 'Copied' : 'Copy ASCII tree'}
          </button>
        </div>
      </div>
    </section>
  );
}
