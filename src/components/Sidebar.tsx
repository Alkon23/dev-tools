import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { toolsByCategory } from '../tools/registry';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onClose }: SidebarProps) {
  const showCollapsed = collapsed && !mobileOpen;

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col overflow-hidden bg-sidebar text-[#eaf0ed] transition-[width,transform] duration-180 max-[760px]:w-[min(286px,86vw)] max-[760px]:-translate-x-full ${showCollapsed ? 'w-(--sidebar-collapsed-width)' : 'w-(--sidebar-width)'} ${mobileOpen ? 'max-[760px]:translate-x-0' : ''}`}>
      <nav className={`flex-1 overflow-y-auto pt-2 pb-7 [scrollbar-color:#42534d_transparent] [scrollbar-width:thin] ${showCollapsed ? 'px-3' : 'px-3.5'}`} aria-label="Developer tools">
        {[...toolsByCategory].map(([category, categoryTools], index) => (
          <div className={index === 0 ? '' : showCollapsed ? 'mt-3' : 'mt-[22px]'} key={category}>
            {index > 0 && showCollapsed && <div aria-hidden="true" className="mx-auto mb-3 h-[2px] w-8 rounded-full bg-accent/70" />}
            {!showCollapsed && (
              <div className="mx-2 mb-2 flex items-center gap-1 font-mono text-[10px] tracking-[0.14em] text-[#74877f] uppercase [&_svg]:text-accent">
                <ChevronRight size={14} aria-hidden="true" />
                <span>{category}</span>
              </div>
            )}
            <div>
              {categoryTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <NavLink
                    className={({ isActive }) => `relative my-0.5 flex min-h-11 items-center rounded-[7px] px-[13px] py-2.5 text-[13px] transition-colors ${showCollapsed ? 'justify-center px-2.5' : 'gap-3'} ${isActive ? 'bg-[rgba(252,186,3,0.16)] text-white before:absolute before:left-[-14px] before:h-[22px] before:w-[3px] before:rounded-r-sm before:bg-accent' : 'text-[#aebbb6] hover:bg-white/5 hover:text-[#f5faf8]'}`}
                    key={tool.id}
                    onClick={onClose}
                    title={showCollapsed ? tool.title : undefined}
                    to={tool.path}
                  >
                    <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                    {!showCollapsed && <span>{tool.title}</span>}
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
