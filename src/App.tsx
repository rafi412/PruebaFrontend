import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import AuditList from './pages/AuditList';
import AuditDetail from './pages/AuditDetail';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<AuditList />} />
        <Route path="/audit/:id" element={<AuditDetail />} />
        {/* Esta ruta es por si escriben una URL que no existe */}
        <Route path="*" element={<div className="p-10">404 - Página no encontrada</div>} />
      </Routes>
    </Layout>
  );
}

export default App;