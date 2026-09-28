import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <section className="pt-[15vh]">
      <span className="eyebrow">Error 404</span>
      <h1 className="my-[21px] max-w-[680px] text-[clamp(42px,7vw,70px)] leading-[0.98] font-medium tracking-[-0.055em] text-ink">This utility does not exist.</h1>
      <p className="m-0 max-w-[560px] text-base leading-7 text-muted">The address may have changed, or the tool has not been added yet.</p>
      <Link className="button button-primary mt-[30px]" to="/">
        <ArrowLeft size={17} aria-hidden="true" /> Back to all tools
      </Link>
    </section>
  );
}
