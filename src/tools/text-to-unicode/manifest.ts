import { WrapText } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'text-to-unicode',
  title: 'Text to Unicode',
  description: 'Parse and convert text to Unicode and vice versa.',
  category: 'Text',
  keywords: ['text', 'unicode', 'entity', 'character', 'encode', 'decode'],
  icon: WrapText,
  order: 40,
});
