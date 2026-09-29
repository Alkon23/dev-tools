import { ChevronLeft, Github, Home, Menu, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { getPreferredTheme, readSavedTheme, saveTheme, type Theme } from '../theme';

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getPreferredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!preference) return;
    const updateTheme = () => {
      if (!readSavedTheme()) setTheme(preference.matches ? 'dark' : 'light');
    };
    preference.addEventListener('change', updateTheme);
    return () => preference.removeEventListener('change', updateTheme);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    saveTheme(next);
    setTheme(next);
  }

  return (
    <div className={`min-h-screen transition-[padding-left] duration-180 max-[760px]:pl-0 ${sidebarCollapsed ? 'pl-(--sidebar-collapsed-width)' : 'pl-(--sidebar-width)'}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {mobileMenuOpen && (
        <button
          className="fixed inset-0 z-25 border-0 bg-[rgba(10,18,15,0.54)]"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
          type="button"
        />
      )}

      <div className="min-h-screen">
        <header className="sticky top-0 z-20 flex h-17 items-center gap-2 border-b border-line bg-(--header-bg) px-8 backdrop-blur-[12px] max-[760px]:px-4">
          <button
            className="header-control hidden max-[760px]:inline-flex"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            type="button"
          >
            <Menu size={21} aria-hidden="true" />
          </button>
          <button
            className="header-control max-[760px]:hidden"
            onClick={() => setSidebarCollapsed((current) => !current)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            type="button"
          >
            <ChevronLeft className={`transition-transform duration-180 ${sidebarCollapsed ? 'rotate-180' : ''}`} size={21} aria-hidden="true" />
          </button>
          <Link className="header-control" to="/" aria-label="Home">
            <Home size={20} strokeWidth={1.8} aria-hidden="true" />
          </Link>
          <div className="mx-[7px] h-[22px] w-px bg-line max-[420px]:hidden" />
          <span className="font-mono text-[10px] tracking-[0.12em] text-[#626d68] uppercase max-[420px]:hidden">Developer workspace</span>
          <a className="header-control ml-auto" href="https://github.com/Alkon23/dev-tools" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository">
            <Github size={20} strokeWidth={1.8} aria-hidden="true" />
          </a>
          <button className="header-control" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-pressed={theme === 'dark'}>
            {theme === 'dark' ? <Sun size={20} strokeWidth={1.8} aria-hidden="true" /> : <Moon size={20} strokeWidth={1.8} aria-hidden="true" />}
          </button>
        </header>

        <main className="mx-auto min-h-[calc(100vh-68px)] max-w-[1680px] px-[clamp(24px,3vw,48px)] pt-9 pb-14 max-[760px]:px-[18px] max-[760px]:pt-7 max-[760px]:pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
