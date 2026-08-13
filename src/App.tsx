import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Leads from '@/pages/Leads';
import Auditoria from '@/pages/Auditoria';
import Configuracoes from '@/pages/Configuracoes';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/auditoria" element={<Auditoria />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
        <Route
          path="*"
          element={
            <div className="flex min-h-screen flex-col items-center justify-center gap-2">
              <h1 className="text-2xl font-bold">404</h1>
              <p className="text-muted-foreground">Página não encontrada.</p>
            </div>
          }
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
