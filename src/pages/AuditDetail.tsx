import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Play, CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useAuditRunner } from '../hooks/useAuditRunner';
import { StatusBadge } from '../components/StatusBadge';
import { cn } from '../utils/cn';
import type { Audit, CheckStatus } from '../types';
import { RefreshCw } from 'lucide-react';

// Mapeo de iconos para los estados de los checks
const statusIcons: Record<CheckStatus, any> = {
  PENDING: Circle,
  QUEUED: Clock,
  RUNNING: RefreshCw,
  OK: CheckCircle2,
  KO: AlertTriangle,
};

/** Obtener datos de una auditoría específica por ID */
export default function AuditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Audit | null>(null);

  useEffect(() => {
    if (id) api.getAuditById(id).then(res => setInitialData(res.audit));
  }, [id]);

  if (!initialData) return <div className="p-10">Cargando detalles...</div>;

  return <AuditDetailContent auditData={initialData} onBack={() => navigate('/')} />;
}

/** Mostrar detalles de una auditoría y ejecutar */
function AuditDetailContent({ auditData, onBack }: { auditData: Audit, onBack: () => void }) {
  // 1. Obtenemos el estado de la auditoría desde el hook
  const { audit, isRunning, runSimulation } = useAuditRunner(auditData);

  // 2. Comprobamos si existe al menos un check con estado 'KO'
  const hasFailures = audit.checks.some(check => check.status === 'KO');

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
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
            <><RefreshCw size={18} /> Re-ejecutar Incidencias</> // Texto dinámico
          ) : (
            <><Play size={18} fill="currentColor" /> Iniciar Auditoría</>
          )}
        </button>
      </div>

      {/* Card de Resumen */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{audit.name}</h2>
            <p className="text-gray-500">Responsable: {audit.owner.name} • {audit.process}</p>
          </div>
          <StatusBadge status={audit.status} />
        </div>

        {/* Barra de progreso grande */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-gray-600">Progreso de la ejecución</span>
            <span className="text-blue-600">{audit.progress}%</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <div
              className="h-full bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${audit.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Listado de Checks */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Evaluación de puntos de control</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {audit.checks.map((check) => (
            <div key={check.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckStatusIcon status={check.status} />
                <div>
                  <p className="font-medium text-gray-900">{check.title}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">{check.priority} Priority</p>
                </div>
              </div>
              <span className={cn(
                "text-sm font-bold",
                check.status === 'OK' && "text-green-600",
                check.status === 'KO' && "text-red-600",
                check.status === 'RUNNING' && "text-blue-600 animate-pulse"
              )}>
                {check.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Comprobar el estado de cada auditoría para mostrar el ícono correspondiente */
function CheckStatusIcon({ status }: { status: string }) {
  if (status === 'OK') return <CheckCircle2 className="text-green-500" size={24} />;
  if (status === 'KO') return <AlertTriangle className="text-red-500" size={24} />;
  if (status === 'RUNNING') return <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />;
  return <Circle className="text-gray-300" size={24} />;
}