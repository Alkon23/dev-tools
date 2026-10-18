import { ScanLine } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'qr-reader',
  title: 'QR code reader',
  description: 'Read a QR code from an uploaded image or a pasted screenshot.',
  category: 'Converters',
  keywords: ['qr', 'code', 'reader', 'scanner', 'image', 'clipboard', 'decode'],
  icon: ScanLine,
});
