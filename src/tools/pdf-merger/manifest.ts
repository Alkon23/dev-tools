import { Combine } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'pdf-merger',
  title: 'PDF merger',
  description: 'Combine PDFs in your chosen order, then download or edit the result.',
  category: 'PDF',
  keywords: ['pdf', 'merge', 'combine', 'join', 'reorder'],
  icon: Combine,
  order: 10,
});
