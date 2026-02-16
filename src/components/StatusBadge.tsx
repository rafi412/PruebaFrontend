import { cn } from '../utils/cn';
import type { AuditStatus } from '../types';

/**
 * Mapeo de estilos CSS dinámicos basados en el estado de la auditoría.
 * Centraliza la lógica de colores para asegurar consistencia visual en toda la plataforma.
 */
const statusStyles: Record<AuditStatus, string> = {
  DONE: "bg-green-100 text-green-700 border-green-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  DRAFT: "bg-gray-100 text-gray-600 border-gray-200",
  BLOCKED: "bg-red-100 text-red-700 border-red-200",
};

/**
 * Componente de etiqueta (Badge) para la visualización semántica de estados técnicos.
 * @param {AuditStatus} status - Estado actual de la auditoría.
 */
export function StatusBadge({ status }: { status: AuditStatus }) {
  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap", 
      statusStyles[status]
    )}>
      {/* Formateo de texto: reemplaza guiones bajos por espacios para legibilidad de usuario */}
      {status.replace('_', ' ')}
    </span>
  );
}