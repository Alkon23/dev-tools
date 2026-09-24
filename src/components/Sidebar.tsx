import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { toolsByCategory } from '../tools/registry';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar${collapsed ? ' is-collapsed' : ''}${mobileOpen ? ' is-mobile-open' : ''}`}>
      <nav className="tool-navigation" aria-label="Developer tools">
        {[...toolsByCategory].map(([category, categoryTools]) => (
          <div className="tool-group" key={category}>
            {!collapsed && (
              <div className="tool-group-title">
                <ChevronRight size={14} aria-hidden="true" />
                <span>{category}</span>
              </div>
            )}
            <div className="tool-group-links">
              {categoryTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <NavLink
                    className={({ isActive }) => `tool-link${isActive ? ' is-active' : ''}`}
                    key={tool.id}
                    onClick={onClose}
                    title={collapsed ? tool.title : undefined}
                    to={tool.path}
                  >
                    <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                    {!collapsed && <span>{tool.title}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
