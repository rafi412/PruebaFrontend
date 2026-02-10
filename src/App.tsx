import { useEffect } from 'react';
import { api } from './services/api';
import { Layout } from './components/Layout';

function App() {
  useEffect(() => {
    // Esta es la llamada que comprueba que tu "motor" funciona
    api.getAudits(1, 10)
      .then(data => {
        console.log("✅ Conexión exitosa. Datos recibidos:", data);
      })
      .catch(err => {
        console.error("❌ Error simulado detectado:", err.message);
      });
  }, []);

  return (
    <Layout>
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Panel de Control</h3>
        <p className="text-gray-600 mb-6">
          La base de datos y la API simulada están operativas.
        </p>
        
        {/* Un pequeño indicador visual de que hay datos por detrás */}
        <div className="flex items-center gap-2 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">
            Listo para cargar las auditorías (revisa la consola F12)
          </span>
        </div>
      </div>
    </Layout>
  );
}

export default App;