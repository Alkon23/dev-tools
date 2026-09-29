import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toolsByCategory } from '../tools/registry';

export function Dashboard() {
  return (
    <div className="space-y-10">
      <h1 className="sr-only">Tools</h1>
      <section aria-labelledby="categories-overview">
        <div className="mb-[22px] flex items-baseline gap-3.5 border-b border-[#ced6d2] pb-3.5">
          <span className="section-index">00</span>
          <h2 className="m-0 text-base font-semibold" id="categories-overview">Categories</h2>
        </div>
        <nav aria-label="Jump to category" className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3">
          {[...toolsByCategory].map(([category, categoryTools], index) => (
            <a className="flex min-h-14 items-center justify-between gap-2 rounded-[10px] border border-line bg-surface px-4 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" href={`#category-${index}`} key={category}>
              <span>{category}</span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] font-normal text-muted">
                {categoryTools.length.toString().padStart(2, '0')}
                <ArrowDownRight size={16} aria-hidden="true" />
              </span>
            </a>
          ))}
        </nav>
      </section>
      {[...toolsByCategory].map(([category, categoryTools], index) => (
        <section aria-labelledby={`category-heading-${index}`} className="scroll-mt-24" id={`category-${index}`} key={category}>
          <div className="mb-[22px] flex items-end justify-between border-b border-[#ced6d2] pb-3.5">
            <div className="flex items-baseline gap-3.5">
              <span className="section-index">{(index + 1).toString().padStart(2, '0')}</span>
              <h2 className="m-0 text-base font-semibold" id={`category-heading-${index}`}>{category}</h2>
            </div>
            <span className="font-mono text-[10px] tracking-[0.08em] text-[#939c98] uppercase">{categoryTools.length.toString().padStart(2, '0')} tools</span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-3.5 max-[420px]:grid-cols-1">
            {categoryTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link className="flex min-h-[116px] items-center gap-[15px] rounded-[10px] border border-line bg-surface p-[21px] transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-[#b9c9c2] hover:shadow-[0_12px_30px_rgba(29,46,40,0.08)]" to={tool.path} key={tool.id}>
                  <span className="flex size-[45px] shrink-0 items-center justify-center rounded-lg bg-[#fff3c9] text-accent-dark"><Icon size={24} strokeWidth={1.6} aria-hidden="true" /></span>
                  <span className="flex flex-1 flex-col gap-1.5">
                    <strong className="text-sm font-semibold">{tool.title}</strong>
                    <small className="text-xs leading-[1.5] text-muted">{tool.description}</small>
                  </span>
                  <ArrowUpRight className="shrink-0 text-[#aab2ae]" size={19} aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
