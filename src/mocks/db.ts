/* Base de datos simulada para auditorías */

import type { Audit } from "../types";

/**
 * Catálogo de procesos y propietarios para generar datos de auditorías variadas.
 */
const PROCESSES = ['Compras', 'Ventas', 'Seguridad', 'RRHH', 'Operaciones', 'Legal'];
export const dbUsers = [
  { id: 'u1', name: 'Ana López' },
  { id: 'u2', name: 'Carlos Ruiz' },
  { id: 'u3', name: 'Marta Gómez' },
  { id: 'u4', name: 'Rafael López' },
  { id: 'u5', name: 'Laura Torres' },
  { id: 'u6', name: 'Diego Sanz' },
];

/**
 * Listado simulado de auditorías para la aplicación.
 * Generamos 60 auditorías con datos variados para probar paginación, búsqueda y estados.
 */
export const dbAudits: Audit[] = Array.from({ length: 60 }).map((_, i) => ({
  id: `aud_${1000 + i}`,
  name: `Auditoría ${PROCESSES[i % PROCESSES.length]} - 2025`,
  process: PROCESSES[i % PROCESSES.length],
  status: i % 7 === 0 ? 'DONE' : 'IN_PROGRESS',
  progress: i % 7 === 0 ? 100 : Math.floor(Math.random() * 90),
  owner: dbUsers[i % dbUsers.length],
  targetDate: '2026-03-20',
  createdAt: '2026-02-01T09:00:00Z',
  updatedAt: new Date().toISOString(),
  templateId: 'tpl_10',
  checks: [] 
}));

/**
 * Catálogo de plantillas de auditoría disponibles.
 * Define la estructura base y el número de puntos de control por modelo.
 */
export const dbTemplates = [
  { id: 'tpl_1', name: 'ISO 27001:2022 Seguridad', process: 'Seguridad', checkCount: 12 },
  { id: 'tpl_2', name: 'Cumplimiento RGPD', process: 'Legal', checkCount: 8 },
  { id: 'tpl_3', name: 'Control de Inventario', process: 'Operaciones', checkCount: 15 },
  { id: 'tpl_4', name: 'Auditoría Financiera Q1', process: 'Ventas', checkCount: 10 },
  { id: 'tpl_5', name: 'Revisión de RRHH', process: 'RRHH', checkCount: 7 },
  { id: 'tpl_6', name: 'Auditoría de Compras', process: 'Compras', checkCount: 9 },
  { id: 'tpl_7', name: 'Revisión de contratos', process: 'Legal', checkCount: 11 },
];