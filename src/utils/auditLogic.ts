import type { Check, AuditStatus } from '../types';

/**
 * Calcula el porcentaje de progreso basado en los checks revisados.
 */
export const calculateProgress = (checks: Check[]): number => {
  if (checks.length === 0) return 0;
  const reviewed = checks.filter(c => c.reviewed).length;
  return Math.round((reviewed / checks.length) * 100);
};

/**
 * Determina el estado global de la auditoría según el resultado de los checks.
 */
export const determineStatus = (checks: Check[]): AuditStatus => {
  if (checks.length === 0) return 'DRAFT';
  
  const allReviewed = checks.every(c => c.reviewed);
  if (!allReviewed) return 'IN_PROGRESS';
  
  const hasFailures = checks.some(c => c.status === 'KO');
  return hasFailures ? 'IN_PROGRESS' : 'DONE'; 
};