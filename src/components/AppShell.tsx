import { ChevronLeft, Home, Menu } from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`app-shell${sidebarCollapsed ? ' has-collapsed-sidebar' : ''}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {mobileMenuOpen && (
        <button
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
          type="button"
        />
      )}

      <div className="app-main">
        <header className="topbar">
          <button
            className="icon-button mobile-menu-button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            type="button"
          >
            <Menu size={21} aria-hidden="true" />
          </button>
          <button
            className="icon-button desktop-collapse-button"
            onClick={() => setSidebarCollapsed((current) => !current)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            type="button"
          >
            <ChevronLeft className={sidebarCollapsed ? 'is-rotated' : ''} size={21} aria-hidden="true" />
          </button>
          <Link className="icon-button" to="/" aria-label="Home">
            <Home size={20} strokeWidth={1.8} aria-hidden="true" />
          </Link>
          <div className="topbar-rule" />
          <span className="topbar-label">Developer workspace</span>
        </header>

        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
