import { ArrowUpRight, Boxes } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tools } from '../tools/registry';

export function Dashboard() {
  return (
    <div>
      <section className="max-w-[720px] pt-5 pb-[78px] max-[760px]:pt-1.5 max-[760px]:pb-[58px]">
        <span className="eyebrow"><Boxes size={15} aria-hidden="true" /> Utility collection</span>
        <h1 className="my-[21px] text-[clamp(46px,7vw,82px)] leading-[0.98] font-medium tracking-[-0.055em] text-ink max-[760px]:text-[clamp(43px,14vw,62px)]">Small tools.<br /><em className="not-italic text-accent">Clear outcomes.</em></h1>
        <p className="m-0 max-w-[560px] text-base leading-7 text-muted">A focused workspace for the repetitive tasks that interrupt a developer's flow.</p>
      </section>

      <section aria-labelledby="available-tools">
        <div className="mb-[22px] flex items-end justify-between border-b border-[#ced6d2] pb-3.5">
          <div className="flex items-baseline gap-3.5">
            <span className="section-index">01</span>
            <h2 className="m-0 text-base font-semibold" id="available-tools">Available tools</h2>
          </div>
          <span className="font-mono text-[10px] tracking-[0.08em] text-[#939c98] uppercase">{tools.length.toString().padStart(2, '0')} total</span>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-3.5 max-[420px]:grid-cols-1">
          {tools.map((tool) => {
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
    </div>
  );
}
