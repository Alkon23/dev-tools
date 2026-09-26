import { FileCode2 } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'xml-formatter',
  title: 'XML formatter',
  description: 'Prettify, minify, and validate XML in one large editor.',
  category: 'Data',
  keywords: ['xml', 'prettify', 'format', 'minify', 'validate'],
  icon: FileCode2,
  order: 20,
});
