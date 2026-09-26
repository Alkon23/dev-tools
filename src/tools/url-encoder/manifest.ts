import { Braces } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'url-encoder',
  title: 'URL encoder / decoder',
  description: 'Encode text as a URL component or decode percent-encoded text.',
  category: 'Web',
  keywords: ['url', 'encode', 'decode', 'percent', 'uri', 'component'],
  icon: Braces,
  order: 10,
});
