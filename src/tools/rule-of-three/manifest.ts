import { Calculator } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'rule-of-three',
  title: 'Rule of three',
  description: 'Find a missing value using direct or inverse proportion.',
  category: 'Math',
  keywords: ['rule of three', 'proportion', 'ratio', 'direct', 'inverse', 'calculator'],
  icon: Calculator,
});
