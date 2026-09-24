import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <section className="not-found">
      <span className="eyebrow">Error 404</span>
      <h1>This utility does not exist.</h1>
      <p>The address may have changed, or the tool has not been added yet.</p>
      <Link className="button button-primary" to="/">
        <ArrowLeft size={17} aria-hidden="true" /> Back to all tools
      </Link>
    </section>
  );
}
