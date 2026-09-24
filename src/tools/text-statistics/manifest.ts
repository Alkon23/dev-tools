import { FileText } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'text-statistics',
  title: 'Text statistics',
  description: 'Get character, word, line, and byte counts for any text.',
  category: 'Text',
  keywords: ['text', 'statistics', 'length', 'characters', 'count', 'size', 'bytes'],
  icon: FileText,
  order: 30,
});
