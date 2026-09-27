import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import IssnIsbnValidatorTool from './Tool';

describe('IssnIsbnValidatorTool', () => {
  it('renders three independent boxed identifier rows', () => {
    render(<IssnIsbnValidatorTool />);

    expect(screen.getAllByRole('textbox')).toHaveLength(31);
    expect(screen.getByRole('heading', { name: 'ISSN' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ISBN-10' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ISBN-13' })).toBeInTheDocument();
  });

  it('advances while typing and validates a completed ISSN', async () => {
    const user = userEvent.setup();
    render(<IssnIsbnValidatorTool />);
    const first = screen.getByLabelText('ISSN character 1 of 8');

    await user.click(first);
    await user.keyboard('20493630');

    expect(screen.getByText('ISSN is valid.')).toBeInTheDocument();
    expect(screen.getByLabelText('ISSN character 8 of 8')).toHaveValue('0');
  });

  it('fills a row from a formatted paste and reports checksum errors', () => {
    render(<IssnIsbnValidatorTool />);
    const first = screen.getByLabelText('ISBN-10 character 1 of 10');

    fireEvent.paste(first, {
      clipboardData: { getData: () => '0-306-40615-3' },
    });

    expect(screen.getByLabelText('ISBN-10 character 10 of 10')).toHaveValue('3');
    expect(screen.getByText('Invalid checksum. The check character should be 2.')).toBeInTheDocument();
  });

  it('supports arrow navigation and backspace into the previous box', async () => {
    const user = userEvent.setup();
    render(<IssnIsbnValidatorTool />);
    const first = screen.getByLabelText('ISSN character 1 of 8');
    const second = screen.getByLabelText('ISSN character 2 of 8');

    await user.click(first);
    await user.keyboard('2');
    expect(second).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(first).toHaveFocus();
    await user.keyboard('{ArrowRight}{Backspace}');
    expect(first).toHaveFocus();
    expect(first).toHaveValue('');
  });

  it('accepts X only in the final ISSN and ISBN-10 boxes', async () => {
    const user = userEvent.setup();
    render(<IssnIsbnValidatorTool />);
    const first = screen.getByLabelText('ISSN character 1 of 8');
    const last = screen.getByLabelText('ISSN character 8 of 8');

    await user.type(first, 'x');
    expect(first).toHaveValue('');
    await user.type(last, 'x');
    expect(last).toHaveValue('X');
  });
});
