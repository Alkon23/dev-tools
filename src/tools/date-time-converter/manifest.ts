import { CalendarClock } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'date-time-converter',
  title: 'Date-time converter',
  description: 'Convert dates and timestamps into standard or custom formats.',
  category: 'Converters',
  keywords: ['date', 'time', 'timestamp', 'iso', 'rfc', 'utc', 'format'],
  icon: CalendarClock,
});
