import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AsciiTreeTool from './Tool';

describe('AsciiTreeTool', () => {
  it('builds independent roots and nested entries and copies the result', async () => {
    const user = userEvent.setup();
    render(<AsciiTreeTool />);
    expect(screen.getByLabelText('Generated ASCII trees')).toHaveValue('');

    await user.click(screen.getByRole('button', { name: 'Add tree' }));
    await user.type(screen.getByRole('textbox', { name: 'Name for untitled entry' }), 'Project');
    await user.click(screen.getByRole('button', { name: 'Add child to Project' }));
    await user.type(screen.getByRole('textbox', { name: 'Name for untitled entry' }), 'src');
    await user.click(screen.getByRole('button', { name: 'Add sibling after src' }));
    await user.type(screen.getByRole('textbox', { name: 'Name for untitled entry' }), 'README.md');
    await user.click(screen.getByRole('button', { name: 'Add tree' }));
    await user.type(screen.getByRole('textbox', { name: 'Name for untitled entry' }), 'Another');

    const expected = 'Project\n├── src\n└── README.md\n\nAnother';
    expect(screen.getByLabelText('Generated ASCII trees')).toHaveValue(expected);
    await user.click(screen.getByRole('button', { name: 'Copy ASCII tree' }));
    expect(await navigator.clipboard.readText()).toBe(expected);

    await user.click(screen.getByRole('button', { name: 'Move README.md up' }));
    expect(screen.getByLabelText('Generated ASCII trees')).toHaveValue('Project\n├── README.md\n└── src\n\nAnother');
    await user.click(screen.getByRole('button', { name: 'Delete Project and children' }));
    expect(screen.getByLabelText('Generated ASCII trees')).toHaveValue('Another');
  });

  it('copies each tree-drawing character independently of the generated output', async () => {
    const user = userEvent.setup();
    render(<AsciiTreeTool />);

    expect(screen.getByRole('button', { name: 'Copy ASCII tree' })).toBeDisabled();
    for (const character of ['├', '└', '│', '─']) {
      await user.click(screen.getByRole('button', { name: `Copy ${character} character` }));
      expect(await navigator.clipboard.readText()).toBe(character);
    }
  });

  it('moves entries by pointer onto another root or into a separate tree', async () => {
    const user = userEvent.setup();
    render(<AsciiTreeTool />);
    await user.click(screen.getByRole('button', { name: 'Add tree' }));
    await user.type(screen.getByRole('textbox', { name: 'Name for untitled entry' }), 'First');
    await user.click(screen.getByRole('button', { name: 'Add tree' }));
    await user.type(screen.getByRole('textbox', { name: 'Name for untitled entry' }), 'Second');

    const grip = screen.getByRole('button', { name: 'Drag Second' });
    grip.setPointerCapture = vi.fn();
    const firstInput = screen.getByRole('textbox', { name: 'Name for First' });
    firstInput.closest('[data-tree-entry]')!.getBoundingClientRect = () => ({ top: 0, height: 90 }) as DOMRect;
    document.elementFromPoint = vi.fn().mockReturnValue(firstInput);
    fireEvent.pointerDown(grip, { pointerId: 1, button: 0, clientX: 20, clientY: 45 });
    fireEvent.pointerMove(grip, { pointerId: 1, clientX: 45, clientY: 45 });
    fireEvent.pointerUp(grip, { pointerId: 1, clientX: 45, clientY: 45 });
    expect(screen.getByLabelText('Generated ASCII trees')).toHaveValue('First\n└── Second');

    const nestedGrip = screen.getByRole('button', { name: 'Drag Second' });
    nestedGrip.setPointerCapture = vi.fn();
    fireEvent.pointerDown(nestedGrip, { pointerId: 2, pointerType: 'touch', button: 0, clientX: 20, clientY: 45 });
    document.elementFromPoint = vi.fn().mockReturnValue(nestedGrip);
    fireEvent.pointerMove(nestedGrip, { pointerId: 2, pointerType: 'touch', clientX: 30, clientY: 45 });
    document.elementFromPoint = vi.fn().mockImplementation(() => screen.getByLabelText('Drop as a new tree at the end'));
    fireEvent.pointerMove(nestedGrip, { pointerId: 2, pointerType: 'touch', clientX: 45, clientY: 45 });
    fireEvent.pointerUp(nestedGrip, { pointerId: 2, pointerType: 'touch', clientX: 45, clientY: 45 });
    expect(screen.getByLabelText('Generated ASCII trees')).toHaveValue('First\n\nSecond');
  });
});
