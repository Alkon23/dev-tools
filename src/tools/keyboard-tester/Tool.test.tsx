import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import KeyboardTesterTool from './Tool';

describe('KeyboardTesterTool', () => {
  it('starts with a complete ANSI keyboard and marks globally pressed keys', () => {
    render(<KeyboardTesterTool />);

    expect(screen.getByRole('region', { name: 'Keyboard tester' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Standard ANSI' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('of 87 keys tested')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'TKL' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Full' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByTestId('key-Numpad0')).not.toBeInTheDocument();

    expect(fireEvent.keyDown(document, { code: 'KeyA', key: 'a' })).toBe(false);
    expect(screen.getByTestId('key-KeyA')).toHaveClass('is-tested', 'is-held');
    expect(screen.getByText('KeyA')).toBeInTheDocument();

    expect(fireEvent.keyUp(document, { code: 'KeyA', key: 'a' })).toBe(false);
    expect(screen.getByTestId('key-KeyA')).toHaveClass('is-tested');
    expect(screen.getByTestId('key-KeyA')).not.toHaveClass('is-held');
    expect(screen.getByText('of 87 keys tested').previousElementSibling).toHaveTextContent('1');
  });

  it('keeps the five most recent non-repeated key presses', () => {
    render(<KeyboardTesterTool />);

    ['KeyA', 'KeyB', 'KeyC', 'KeyD', 'KeyE', 'KeyF'].forEach((code) => {
      fireEvent.keyDown(document, { code, key: code.at(-1)?.toLowerCase() });
      fireEvent.keyUp(document, { code, key: code.at(-1)?.toLowerCase() });
    });
    fireEvent.keyDown(document, { code: 'KeyF', key: 'f', repeat: true });

    const history = screen.getByLabelText('Last five pressed keys');
    expect(history).not.toHaveTextContent('KeyA');
    expect(history).toHaveTextContent('KeyB');
    expect(history).toHaveTextContent('KeyC');
    expect(history).toHaveTextContent('KeyD');
    expect(history).toHaveTextContent('KeyE');
    expect(history).toHaveTextContent('KeyF');
    expect(history.querySelectorAll('span')).toHaveLength(5);
    expect(history.lastElementChild).toHaveClass('is-latest');
  });

  it('switches to Spanish ISO for the session and resets progress', async () => {
    const user = userEvent.setup();
    render(<KeyboardTesterTool />);
    fireEvent.keyDown(document, { code: 'KeyA', key: 'a' });

    await user.click(screen.getByRole('button', { name: 'Spanish ISO' }));

    expect(screen.getByRole('button', { name: 'Spanish ISO' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('of 88 keys tested').previousElementSibling).toHaveTextContent('0');
    expect(screen.getByTestId('key-IntlBackslash')).toBeInTheDocument();
    expect(screen.getByTestId('key-Semicolon')).toHaveTextContent('ñ');
    expect(screen.getByTestId('key-Enter')).toHaveClass('keyboard-key-iso-enter');
  });

  it('ignores media keys and clears held keys when the window loses focus', () => {
    render(<KeyboardTesterTool />);

    expect(fireEvent.keyDown(document, { code: 'AudioVolumeUp', key: 'AudioVolumeUp' })).toBe(true);
    expect(screen.getByText('of 87 keys tested').previousElementSibling).toHaveTextContent('0');

    fireEvent.keyDown(document, { code: 'ShiftLeft', key: 'Shift' });
    expect(screen.getByTestId('key-ShiftLeft')).toHaveClass('is-held');
    fireEvent.blur(window);
    expect(screen.getByTestId('key-ShiftLeft')).not.toHaveClass('is-held');
  });

  it('shows and captures the numeric pad only when enabled', async () => {
    const user = userEvent.setup();
    render(<KeyboardTesterTool />);

    expect(fireEvent.keyDown(document, { code: 'Numpad0', key: '0' })).toBe(true);
    expect(screen.getByText('of 87 keys tested').previousElementSibling).toHaveTextContent('0');

    await user.click(screen.getByRole('button', { name: 'Full' }));
    expect(screen.getByRole('button', { name: 'Full' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('of 104 keys tested')).toBeInTheDocument();
    expect(screen.getByTestId('key-Numpad0')).toBeInTheDocument();
    expect(fireEvent.keyDown(document, { code: 'Numpad0', key: '0' })).toBe(false);
    expect(screen.getByText('of 104 keys tested').previousElementSibling).toHaveTextContent('1');
  });

  it('toggles failed keys on right-click and reset clears every state', async () => {
    const user = userEvent.setup();
    render(<KeyboardTesterTool />);
    const key = screen.getByTestId('key-KeyF');

    const failedEvent = fireEvent.contextMenu(key);
    expect(failedEvent).toBe(false);
    expect(key).toHaveClass('is-failed');
    expect(key).toHaveAccessibleName('F key, failed');

    fireEvent.keyDown(document, { code: 'KeyF', key: 'f' });
    expect(key).toHaveClass('is-failed', 'is-held', 'is-tested');
    expect(key).toHaveAccessibleName('F key, pressed');
    expect(key.querySelector('i')).not.toBeInTheDocument();
    fireEvent.keyUp(document, { code: 'KeyF', key: 'f' });
    expect(key).toHaveAccessibleName('F key, failed');
    expect(key.querySelector('i')).toHaveTextContent('!');

    fireEvent.contextMenu(key);
    expect(key).not.toHaveClass('is-failed');
    fireEvent.contextMenu(key);
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(key).not.toHaveClass('is-failed', 'is-tested', 'is-held');
  });
});
