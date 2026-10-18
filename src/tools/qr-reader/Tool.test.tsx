import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import QrReaderTool from './Tool';
import { readQrImage } from './qrReader';

vi.mock('./qrReader', () => ({ readQrImage: vi.fn() }));
const decoded = { text: 'https://example.com/?hello=world', preview: 'data:image/png;base64,AA==' };

describe('QR code reader', () => {
  beforeEach(() => { vi.mocked(readQrImage).mockReset(); });

  it('starts empty, reads an upload, copies text, and clears the result', async () => {
    const user = userEvent.setup();
    vi.mocked(readQrImage).mockResolvedValue(decoded);
    render(<QrReaderTool />);
    expect(screen.queryByLabelText('Decoded text')).not.toBeInTheDocument();
    const file = new File(['image'], 'qr.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Upload QR code image'), file);
    expect(await screen.findByLabelText('Decoded text')).toHaveValue(decoded.text);
    expect(readQrImage).toHaveBeenCalledWith(file);
    expect(screen.getByAltText('Uploaded QR code')).toHaveAttribute('src', decoded.preview);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Copy text' }));
    expect(await navigator.clipboard.readText()).toBe(decoded.text);
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.queryByLabelText('Decoded text')).not.toBeInTheDocument();
  });

  it('reads pasted images and leaves ordinary text paste untouched', async () => {
    vi.mocked(readQrImage).mockResolvedValue(decoded);
    render(<QrReaderTool />);
    fireEvent.paste(document, { clipboardData: { items: [{ kind: 'string', type: 'text/plain' }] } });
    expect(readQrImage).not.toHaveBeenCalled();
    const file = new File(['image'], 'clipboard.png', { type: 'image/png' });
    fireEvent.paste(document, { clipboardData: { items: [{ kind: 'file', type: 'image/png', getAsFile: () => file }] } });
    expect(await screen.findByLabelText('Decoded text')).toHaveValue(decoded.text);
    expect(readQrImage).toHaveBeenCalledWith(file);
  });

  it('shows decoder errors and clears stale results', async () => {
    const user = userEvent.setup();
    vi.mocked(readQrImage).mockResolvedValueOnce(decoded).mockRejectedValueOnce(new Error('No QR code found.'));
    render(<QrReaderTool />);
    const input = screen.getByLabelText('Upload QR code image');
    const file = new File(['image'], 'qr.png', { type: 'image/png' });
    await user.upload(input, file);
    await screen.findByLabelText('Decoded text');
    await user.upload(input, file);
    expect(await screen.findByRole('alert')).toHaveTextContent('No QR code found.');
    expect(screen.queryByLabelText('Decoded text')).not.toBeInTheDocument();
  });

  it('does not restore a pending result after clearing', async () => {
    const user = userEvent.setup();
    let resolve!: (value: typeof decoded) => void;
    vi.mocked(readQrImage).mockReturnValue(new Promise((done) => { resolve = done; }));
    render(<QrReaderTool />);
    await user.upload(screen.getByLabelText('Upload QR code image'), new File(['image'], 'qr.png', { type: 'image/png' }));
    expect(screen.getByRole('status')).toHaveTextContent('Reading');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    await act(async () => resolve(decoded));
    expect(screen.queryByLabelText('Decoded text')).not.toBeInTheDocument();
  });

  it('reports clipboard write failures', async () => {
    const user = userEvent.setup();
    vi.mocked(readQrImage).mockResolvedValue(decoded);
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(new Error('denied'));
    render(<QrReaderTool />);
    await user.upload(screen.getByLabelText('Upload QR code image'), new File(['image'], 'qr.png', { type: 'image/png' }));
    await user.click(await screen.findByRole('button', { name: 'Copy text' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copy failed'));
  });
});
