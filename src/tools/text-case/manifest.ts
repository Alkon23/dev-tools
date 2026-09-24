import { CaseSensitive } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'text-case',
  title: 'Text case converter',
  description: 'Switch text between common naming and writing conventions.',
  category: 'Text',
  keywords: ['text', 'case', 'camel', 'kebab', 'title'],
  icon: CaseSensitive,
  order: 10,
});
