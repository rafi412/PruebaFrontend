import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AuditDetail() {
  const { id } = useParams(); // Cogemos el ID de la URL
  const navigate = useNavigate();

  return (
    <div>
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Volver al listado
      </button>
      
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Detalle de la Auditoría</h2>
        <p className="text-gray-500 mt-2">Estás viendo la auditoría con ID: <span className="font-mono text-blue-600">{id}</span></p>
        
        <div className="mt-10 p-20 border-2 border-dashed border-gray-100 rounded-xl text-center">
          <p className="text-gray-400 italic">Próximamente: Lista de checks y simulador de ejecución...</p>
        </div>
      </div>
    </div>
  );
}