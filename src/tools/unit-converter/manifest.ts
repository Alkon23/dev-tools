import { Scale } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'unit-converter',
  title: 'Unit converter',
  description: 'Convert temperature, length, and binary byte-size units.',
  category: 'Converters',
  keywords: ['unit', 'metric', 'temperature', 'length', 'metre', 'inch', 'byte', 'size'],
  icon: Scale,
});
