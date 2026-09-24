import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import QrGeneratorTool from './Tool';

const qrMock = vi.hoisted(() => ({
  append: vi.fn(),
  download: vi.fn().mockResolvedValue(undefined),
  update: vi.fn(),
}));

vi.mock('qr-code-styling', () => ({
  default: class QRCodeStyling {
    append = qrMock.append;
    download = qrMock.download;
    update = qrMock.update;
  },
}));

describe('QrGeneratorTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates the preview and only enables download for non-empty content', async () => {
    const user = userEvent.setup();
    render(<QrGeneratorTool />);

    expect(qrMock.append).toHaveBeenCalledOnce();
    const content = screen.getByLabelText('URL or text');
    const download = screen.getByRole('button', { name: 'Download SVG' });

    await user.clear(content);
    expect(download).toBeDisabled();

    await user.type(content, 'Ship it');
    expect(download).toBeEnabled();
    await user.click(download);

    expect(qrMock.download).toHaveBeenCalledWith({ name: 'qr-code', extension: 'svg' });
    expect(qrMock.update).toHaveBeenLastCalledWith(expect.objectContaining({ data: 'Ship it' }));
  });

  it('applies visual settings and supports adding and removing a logo', async () => {
    const user = userEvent.setup();
    render(<QrGeneratorTool />);

    await user.selectOptions(screen.getByLabelText('Modules'), 'dots');
    await user.selectOptions(screen.getByLabelText('Corner markers'), 'extra-rounded');
    await user.selectOptions(screen.getByLabelText('Corner eyes'), 'dot');
    await user.selectOptions(screen.getByLabelText('Error correction'), 'H');
    await user.click(screen.getByLabelText('Transparent background'));

    expect(qrMock.update).toHaveBeenLastCalledWith(expect.objectContaining({
      backgroundOptions: { color: 'transparent' },
      cornersDotOptions: expect.objectContaining({ type: 'dot' }),
      cornersSquareOptions: expect.objectContaining({ type: 'extra-rounded' }),
      dotsOptions: expect.objectContaining({ type: 'dots' }),
      qrOptions: { errorCorrectionLevel: 'H' },
    }));

    const logo = new File(['logo'], 'logo.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText(/Choose an image/), logo);

    const removeLogo = await screen.findByRole('button', { name: 'Remove logo' });
    await waitFor(() => expect(qrMock.update).toHaveBeenLastCalledWith(
      expect.objectContaining({ image: expect.stringMatching(/^data:image\/png;base64,/) }),
    ));

    await user.click(removeLogo);
    expect(qrMock.update).toHaveBeenLastCalledWith(expect.objectContaining({ image: '' }));
  });
});
