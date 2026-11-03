# Dev Tools

A React application for small developer utilities. The application shell, navigation, and routes are generated from colocated tool manifests, so tools can be added without editing existing application files.

## Development

```sh
pnpm install
pnpm dev
```

Useful checks:

```sh
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## Add a tool

Create a directory under `src/tools` with exactly these two entry files:

```text
src/tools/my-tool/
  manifest.ts
  Tool.tsx
```

The manifest defines everything used by routing and navigation:

```ts
import { Wrench } from 'lucide-react';
import { defineTool } from '../defineTool';

export default defineTool({
  id: 'my-tool',
  title: 'My tool',
  description: 'What this tool does.',
  category: 'Development',
  keywords: ['example'],
  icon: Wrench,
});
```

`Tool.tsx` must default-export the tool component:

```tsx
export default function MyTool() {
  return <section className="tool-card">Tool content</section>;
}
```

Vite discovers both files at build time. The manifest is loaded eagerly because the shell needs its small metadata, while `Tool.tsx` is emitted as a lazy-loaded chunk and fetched only when its route is visited. Tool IDs must be unique kebab-case values. The resulting route is `/<id>`, mounted under Vite's base path: `/dev-tools/<id>` on GitHub Pages. The dashboard is at `/dev-tools/`.

Production builds also emit `404.html` so GitHub Pages can load direct tool URLs and refresh them without changing the address, query string, or fragment. GitHub Pages still returns HTTP 404 for these initial deep-link requests; the fallback renders the application normally.

Business logic and tests should remain colocated in the same tool directory. Shared primitives belong outside individual tool directories only when at least two tools use them.

## Structure

```text
src/
  components/       Shared application shell
  pages/            Dashboard, tool host, and error page
  tools/
    registry.ts     Automatic discovery and validation
    types.ts        Tool extension contract
    <tool>/          Self-contained utility
```

The `reference/` directory contains the original Vue application used as architectural and visual reference. It is not part of this application's build.
