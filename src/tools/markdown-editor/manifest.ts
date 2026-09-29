import { FilePenLine } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'markdown-editor',
  title: 'Markdown editor',
  description: 'Write Markdown and see a live preview. Import or download a local file.',
  category: 'Text',
  keywords: ['markdown', 'editor', 'preview', 'gfm', 'md', 'writing'],
  icon: FilePenLine,
});
