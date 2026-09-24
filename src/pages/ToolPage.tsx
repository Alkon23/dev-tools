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
    <article className="tool-page">
      <header className="tool-header">
        <span className="eyebrow">{tool.category} utility</span>
        <h1>{tool.title}</h1>
        <div className="title-rule" />
        <p>{tool.description}</p>
      </header>
      <div className="tool-content">
        <Suspense fallback={<div className="tool-loading">Loading utility...</div>}>
          <tool.Component />
        </Suspense>
      </div>
    </article>
  );
}
