import type { ComponentType, LazyExoticComponent } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ToolManifest {
  id: string;
  title: string;
  description: string;
  category: string;
  keywords: readonly string[];
  icon: LucideIcon;
  order?: number;
}

export interface ToolDefinition extends ToolManifest {
  path: string;
  Component: LazyExoticComponent<ComponentType>;
}

export interface ToolComponentModule {
  default: ComponentType;
}
