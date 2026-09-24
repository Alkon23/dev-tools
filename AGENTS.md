# Dev Tools Agent Guide

Work on the React application at the workspace root. Treat `reference/` as read-only unless the user explicitly requests changes to the Vue reference project.

## Project Structure

- `src/components/` contains the shared application shell.
- `src/pages/` contains the dashboard, tool host, and error page.
- `src/tools/registry.ts` discovers and validates tools automatically.
- `src/tools/types.ts` defines the tool manifest contract.
- `src/tools/<tool-id>/` contains a self-contained utility.

## Create a Tool

Create a kebab-case directory with these exact entry filenames:

```text
src/tools/my-tool/
  manifest.ts
  Tool.tsx
```

Define navigation and route metadata in `manifest.ts`:

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
  order: 10,
});
```

Default-export the tool component from `Tool.tsx`:

```tsx
export default function MyTool() {
  return <section className="tool-card">Tool content</section>;
}
```

The registry generates `/tools/<id>` routes and grouped navigation from these files. Do not edit `src/App.tsx`, `src/components/Sidebar.tsx`, or `src/tools/registry.ts` just to register a tool.

## Tool Conventions

- Use a unique kebab-case `id`; it becomes the URL segment.
- Keep `manifest.ts` limited to small, eagerly loaded metadata.
- Keep the tool UI in `Tool.tsx` so Vite can lazy-load it.
- Use Lucide icons from `lucide-react` in manifests.
- Use `order` only when a category needs explicit ordering; otherwise tools sort by title.
- Keep business logic, types, and tests in the tool directory.
- Prefer pure functions for transformations and calculations.
- Move code into shared modules only after at least two tools need it.
- Reuse existing shell and form classes where they fit instead of duplicating styles.
- Add accessible labels to inputs and icon-only controls.
- Ensure the tool works at its direct URL and at mobile widths.

A typical tool directory may grow to:

```text
src/tools/my-tool/
  manifest.ts
  Tool.tsx
  myTool.ts
  myTool.test.ts
  types.ts
```

Only `manifest.ts` and `Tool.tsx` are required by the registry.

## Verification

Run all checks before considering work complete:

```sh
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

For new or changed tools, also verify:

- The tool appears under the expected sidebar category.
- `/tools/<id>` loads directly without visiting the dashboard first.
- The active navigation state is correct.
- Core behavior has focused tests, including empty and malformed input where relevant.
- The tool remains usable on desktop and mobile.
