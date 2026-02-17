import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuditRunner } from '../hooks/useAuditRunner';
import { StatusBadge } from '../components/StatusBadge';
import { cn } from '../utils/cn';
import type { Audit } from '../types';

/**
 * Componente de página para el detalle de una auditoría.
 * Gestiona la carga inicial de datos basada en el ID de la URL.
 */
export default function AuditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Audit | null>(null);

  useEffect(() => {
    if (id) {
      api.getAuditById(id)
        .then(res => setInitialData(res.audit))
        .catch(err => console.error("Error al recuperar auditoría:", err));
    }
  }, [id]);

  if (!initialData) {
    return (
      <div className="p-10 flex items-center gap-3 text-gray-500 font-medium">
        <RefreshCw className="animate-spin" size={20} />
        Cargando detalles de auditoría...
      </div>
    );
  }

  return <AuditDetailContent auditData={initialData} onBack={() => navigate('/')} />;
}

/**
 * Renderiza el contenido del detalle y gestiona la lógica de ejecución.
 */
function AuditDetailContent({ auditData, onBack }: { auditData: Audit, onBack: () => void }) {
  // Hook que orquestra la simulación y las actualizaciones optimistas
  const { 
    audit, 
    isRunning, 
    runSimulation, 
    updateCheckOptimistically 
  } = useAuditRunner(auditData);

  // Estado derivado para identificar si existen fallos en los checks
  const hasFailures = audit.checks.some(check => check.status === 'KO');

  return (
    <div className="space-y-6">
      {/* CABECERA DE ACCIONES */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Volver al listado
        </button>

        <button
          onClick={runSimulation}
          disabled={isRunning || audit.status === 'DONE'}
          className={cn(
            "px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md",
            audit.status === 'DONE'
              ? "bg-green-100 text-green-700 cursor-not-allowed"
              : hasFailures
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
          )}
        >
          {isRunning ? (
            <><RefreshCw className="animate-spin" size={18} /> Procesando...</>
          ) : audit.status === 'DONE' ? (
            <><CheckCircle2 size={18} /> Auditoría Completada</>
          ) : hasFailures ? (
            <><RefreshCw size={18} /> Re-ejecutar Incidencias</>
          ) : (
            <><Play size={18} fill="currentColor" /> Iniciar Auditoría</>
          )}
        </button>
      </div>

      {/* TARJETA DE RESUMEN */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{audit.name}</h2>
            <p className="text-gray-500 mt-1 font-medium">
              Responsable: <span className="text-gray-900">{audit.owner.name}</span> • {audit.process}
            </p>
          </div>
          <StatusBadge status={audit.status} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-gray-600 uppercase tracking-wider text-[10px]">Progreso de ejecución</span>
            <span className="text-blue-600">{audit.progress}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <div
              className="h-full bg-blue-500 transition-all duration-700 ease-out"
              style={{ width: `${audit.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* LISTADO DE PUNTOS DE CONTROL */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Puntos de Control</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {audit.checks.map((check) => (
            <div 
              key={check.id} 
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors group"
            >
              {/* Lado Izquierdo: Icono e Información del Check */}
              <div className="flex items-center gap-4">
                <CheckStatusIcon status={check.status} />
                <div>
                  <p className="font-semibold text-gray-900">{check.title}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                    Prioridad {check.priority}
                  </p>
                </div>
              </div>

              {/* Lado Derecho: Acciones Manuales y Estado */}
              <div className="flex items-center gap-6">
                {/* Botones de Evaluación Manual (Visibles en Hover) */}
                {!isRunning && audit.status !== 'DONE' && (
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => updateCheckOptimistically(check.id, 'OK')}
                      className="p-1.5 hover:bg-white hover:text-green-600 text-gray-400 rounded-md transition-all"
                      title="Marcar OK"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <button 
                      onClick={() => updateCheckOptimistically(check.id, 'KO')}
                      className="p-1.5 hover:bg-white hover:text-red-600 text-gray-400 rounded-md transition-all"
                      title="Marcar KO"
                    >
                      <AlertTriangle size={16} />
                    </button>
                  </div>
                )}

                {/* Texto de Estado Técnico */}
                <div className="w-20 text-right">
                  <span className={cn(
                    "text-[12px] font-black uppercase tracking-tighter",
                    check.status === 'OK' && "text-green-600",
                    check.status === 'KO' && "text-red-600",
                    check.status === 'RUNNING' && "text-blue-600 animate-pulse"
                  )}>
                    {check.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Renderiza el icono de estado correspondiente para cada check.
 */
function CheckStatusIcon({ status }: { status: string }) {
  if (status === 'OK') return <CheckCircle2 className="text-green-500" size={28} />;
  if (status === 'KO') return <AlertTriangle className="text-red-500" size={28} />;
  if (status === 'RUNNING') return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
  return <Circle className="text-gray-300" size={28} />;
}