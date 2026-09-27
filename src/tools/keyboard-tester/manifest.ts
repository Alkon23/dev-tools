import { Keyboard } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'keyboard-tester',
  title: 'Keyboard tester',
  description: 'Check every key on a TKL or full-size ANSI or Spanish ISO keyboard.',
  category: 'Testing',
  keywords: ['keyboard', 'key', 'tester', 'ansi', 'iso', 'spanish', 'hardware'],
  icon: Keyboard,
});
