import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';
import { ToolPage } from './pages/ToolPage';
import { tools } from './tools/registry';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Dashboard />} />
        {tools.map((tool) => (
          <Route key={tool.id} path={tool.path.slice(1)} element={<ToolPage tool={tool} />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
