import { ListTree } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'ascii-tree',
  title: 'ASCII tree generator',
  description: 'Build and rearrange nested entries, then copy their ASCII trees.',
  category: 'Generators',
  keywords: ['ascii', 'tree', 'hierarchy', 'diagram', 'text', 'folder'],
  icon: ListTree,
});
