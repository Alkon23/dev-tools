import { BookCheck } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'issn-isbn-validator',
  title: 'ISSN / ISBN validator',
  description: 'Test ISSN, ISBN-10, and ISBN-13 identifiers and verify their check digits.',
  category: 'Testing',
  keywords: ['issn', 'isbn', 'book', 'journal', 'identifier', 'checksum', 'validator'],
  icon: BookCheck,
});
