import { Files } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'pdf-page-manager',
  title: 'PDF page manager',
  description: 'Reorder, duplicate, or remove pages from a PDF before downloading it.',
  category: 'PDF',
  keywords: ['pdf', 'pages', 'reorder', 'duplicate', 'delete', 'organize'],
  icon: Files,
  order: 20,
});
