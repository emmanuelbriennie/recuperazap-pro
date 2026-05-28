import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={
          <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#fff', flexDirection: 'column', gap: '10px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>RecuperaZap Pro 🚀</h1>
            <p style={{ color: '#94a3b8' }}>Instalação limpa concluída. Sistema Ativo e Pronto!</p>
          </div>
        } />
      </Routes>
    </>
  );
}

export default App;
