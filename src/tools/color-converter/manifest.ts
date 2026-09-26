import { Palette } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'color-converter',
  title: 'Color converter',
  description: 'Convert colors between HEX, RGB, HSL, CSS names, and advanced color spaces.',
  category: 'Converters',
  keywords: ['color', 'hex', 'rgb', 'hsl', 'hwb', 'lch', 'cmyk', 'picker'],
  icon: Palette,
});
