import { Braces } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'json-formatter',
  title: 'JSON formatter',
  description: 'Prettify or minify JSON5 input into valid JSON.',
  category: 'Data',
  keywords: ['json', 'json5', 'prettify', 'format', 'minify', 'validate'],
  icon: Braces,
  order: 10,
});
