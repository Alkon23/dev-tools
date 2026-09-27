import { AlarmClock } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'crontab-generator',
  title: 'Crontab generator',
  description: 'Validate crontab expressions and read a human-friendly description of each schedule.',
  category: 'Generators',
  keywords: [
    'crontab',
    'generator',
    'cronjob',
    'cron',
    'schedule',
    'parse',
    'expression',
    'year',
    'month',
    'week',
    'day',
    'minute',
    'second',
  ],
  icon: AlarmClock,
  order: 20,
});
