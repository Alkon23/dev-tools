import { ListTree } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'url-parser',
  title: 'URL parser',
  description: 'Inspect, edit, remove, and rebuild the individual parts of a URL.',
  category: 'Web',
  keywords: ['url', 'parse', 'protocol', 'hostname', 'port', 'query', 'fragment'],
  icon: ListTree,
  order: 20,
});
