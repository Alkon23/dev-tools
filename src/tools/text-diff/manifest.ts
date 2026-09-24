import { FileDiff } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'text-diff',
  title: 'Text diff',
  description: 'Compare two texts and see the differences between them.',
  category: 'Text',
  keywords: ['text', 'diff', 'compare', 'string', 'code'],
  icon: FileDiff,
  order: 20,
});
