import { Suspense, useEffect } from 'react';
import type { ToolDefinition } from '../tools/types';

export function ToolPage({ tool }: { tool: ToolDefinition }) {
  useEffect(() => {
    document.title = `${tool.title} | Dev Tools`;
    return () => {
      document.title = 'Dev Tools';
    };
  }, [tool.title]);

  return (
    <article className="w-full">
      <header className="pb-[26px] text-center max-[760px]:pb-[22px]">
        <span className="eyebrow">{tool.category} utility</span>
        <h1 className="mt-2.5 mb-3 text-[clamp(32px,4vw,46px)] leading-[0.98] font-medium tracking-[-0.055em] text-ink">{tool.title}</h1>
        <div className="mx-auto mb-3 h-0.5 w-12 bg-accent" />
        <p className="mx-auto max-w-[560px] text-base leading-7 text-muted">{tool.description}</p>
      </header>
      <div className="w-full">
        <Suspense fallback={<div className="tool-card text-center text-muted">Loading utility...</div>}>
          <tool.Component />
        </Suspense>
      </div>
    </article>
  );
}
