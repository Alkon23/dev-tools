import { QrCode } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'qr-generator',
  title: 'QR code generator',
  description: 'Create a styled QR code with custom colors, patterns, and a centered logo.',
  category: 'Generators',
  keywords: ['qr', 'code', 'generator', 'svg', 'logo'],
  icon: QrCode,
  order: 10,
});
