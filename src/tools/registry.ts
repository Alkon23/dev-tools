import { lazy } from 'react';
import type { ToolComponentModule, ToolDefinition, ToolManifest } from './types';

type ComponentLoader = () => Promise<ToolComponentModule>;

const manifestModules = import.meta.glob<ToolManifest>('./*/manifest.ts', {
  eager: true,
  import: 'default',
});

const componentModules = import.meta.glob<ToolComponentModule>('./*/Tool.tsx');

export function buildToolRegistry(
  manifests: Record<string, ToolManifest>,
  components: Record<string, ComponentLoader>,
): ToolDefinition[] {
  const ids = new Set<string>();

  return Object.entries(manifests)
    .map(([manifestPath, manifest]) => {
      const directory = manifestPath.replace(/\/manifest\.ts$/, '');
      const componentPath = `${directory}/Tool.tsx`;
      const loadComponent = components[componentPath];

      if (!loadComponent) {
        throw new Error(`Missing Tool.tsx for ${manifestPath}`);
      }

      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.id)) {
        throw new Error(`Tool id "${manifest.id}" must use kebab-case`);
      }

      if (ids.has(manifest.id)) {
        throw new Error(`Duplicate tool id "${manifest.id}"`);
      }

      ids.add(manifest.id);

      return {
        ...manifest,
        path: `/tools/${manifest.id}`,
        Component: lazy(loadComponent),
      };
    })
    .sort((a, b) => {
      const categoryOrder = a.category.localeCompare(b.category);
      return categoryOrder || (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) || a.title.localeCompare(b.title);
    });
}

export const tools = buildToolRegistry(manifestModules, componentModules);

export const toolsByCategory = tools.reduce((groups, tool) => {
  const categoryTools = groups.get(tool.category) ?? [];
  categoryTools.push(tool);
  groups.set(tool.category, categoryTools);
  return groups;
}, new Map<string, ToolDefinition[]>());
