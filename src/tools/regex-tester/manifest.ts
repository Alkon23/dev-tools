import { Regex } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'regex-tester',
  title: 'Regex tester',
  description: 'Test JavaScript regular expressions with syntax coloring and live match highlights.',
  category: 'Testing',
  keywords: ['regex', 'regexp', 'regular expression', 'javascript', 'test', 'match', 'pattern'],
  icon: Regex,
});
