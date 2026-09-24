import { CaseSensitive } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { buildToolRegistry } from './registry';
import type { ToolManifest } from './types';

const component = () => Promise.resolve({ default: () => null });

function manifest(overrides: Partial<ToolManifest> = {}): ToolManifest {
  return {
    id: 'sample-tool',
    title: 'Sample tool',
    description: 'A sample tool.',
    category: 'Text',
    keywords: ['sample'],
    icon: CaseSensitive,
    ...overrides,
  };
}

describe('buildToolRegistry', () => {
  it('pairs a manifest with its colocated component and creates its route', () => {
    const result = buildToolRegistry(
      { './sample-tool/manifest.ts': manifest() },
      { './sample-tool/Tool.tsx': component },
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'sample-tool', path: '/tools/sample-tool' });
  });

  it('rejects a manifest without a colocated component', () => {
    expect(() => buildToolRegistry({ './sample-tool/manifest.ts': manifest() }, {})).toThrow(
      'Missing Tool.tsx',
    );
  });

  it('rejects duplicate tool ids', () => {
    expect(() => buildToolRegistry(
      {
        './first/manifest.ts': manifest(),
        './second/manifest.ts': manifest(),
      },
      {
        './first/Tool.tsx': component,
        './second/Tool.tsx': component,
      },
    )).toThrow('Duplicate tool id');
  });
});
