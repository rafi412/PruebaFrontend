import type { Check } from '../types';

/**
 * Calcula el porcentaje de progreso de una auditoría.
 * Regla: (Checks revisados / Total checks) * 100
 */
export function calculateProgress(checks: Check[]): number {
  if (checks.length === 0) return 0;
  
  const reviewedCount = checks.filter(c => c.reviewed).length;
  return Math.round((reviewedCount / checks.length) * 100);
}

/**
 * Determina el estado global basado en los checks.
 * Regla: Si hay algún KO -> IN_PROGRESS (o BLOCKED). Si todos OK -> DONE.
 */
export function determineAuditStatus(checks: Check[]): 'DONE' | 'IN_PROGRESS' {
  if (checks.length === 0) return 'IN_PROGRESS';
  
  const allReviewed = checks.every(c => c.reviewed);
  if (!allReviewed) return 'IN_PROGRESS';
  
  const hasFailures = checks.some(c => c.status === 'KO');
  return hasFailures ? 'IN_PROGRESS' : 'DONE'; // Según PDF: KO mantiene IN_PROGRESS
}