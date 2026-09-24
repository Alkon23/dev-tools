import type { ToolManifest } from './types';

export function defineTool<const T extends ToolManifest>(manifest: T): T {
  return manifest;
}
