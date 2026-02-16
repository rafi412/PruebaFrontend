import { describe, it, expect } from 'vitest';
import { calculateProgress, determineAuditStatus } from './auditUtils';
import type { Check } from '../types';

// Mock básico de un check
const mockCheck = (status: any, reviewed: boolean): Check => ({
  id: '1', title: 'Test', priority: 'HIGH', updatedAt: '', 
  status, reviewed
});

describe('Lógica de Auditoría', () => {
  
  it('debe calcular el progreso correctamente', () => {
    const checks = [
      mockCheck('OK', true),
      mockCheck('OK', true),
      mockCheck('PENDING', false),
      mockCheck('PENDING', false)
    ];
    // 2 de 4 revisados = 50%
    expect(calculateProgress(checks)).toBe(50);
  });

  it('debe devolver 0% si no hay checks', () => {
    expect(calculateProgress([])).toBe(0);
  });

  it('debe devolver DONE solo si todos están revisados y son OK', () => {
    const checks = [
      mockCheck('OK', true),
      mockCheck('OK', true)
    ];
    expect(determineAuditStatus(checks)).toBe('DONE');
  });

  it('debe mantener IN_PROGRESS si hay un KO aunque esté todo revisado', () => {
    const checks = [
      mockCheck('OK', true),
      mockCheck('KO', true) // Fallo
    ];
    expect(determineAuditStatus(checks)).toBe('IN_PROGRESS');
  });
});