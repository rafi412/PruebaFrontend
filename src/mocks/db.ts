/* Base de datos simulada para auditorías */

import type { Audit } from "../types";

const PROCESSES = ['Compras', 'Ventas', 'Seguridad', 'RRHH', 'Operaciones'];
const OWNERS = [
  { id: 'u1', name: 'Ana López' },
  { id: 'u2', name: 'Carlos Ruiz' },
  { id: 'u3', name: 'Marta Gómez' }
];

export const dbAudits: Audit[] = Array.from({ length: 60 }).map((_, i) => ({
  id: `aud_${1000 + i}`,
  name: `Auditoría ${PROCESSES[i % PROCESSES.length]} - 2025`,
  process: PROCESSES[i % PROCESSES.length],
  status: i % 7 === 0 ? 'DONE' : 'IN_PROGRESS',
  progress: i % 7 === 0 ? 100 : Math.floor(Math.random() * 90),
  owner: OWNERS[i % OWNERS.length],
  targetDate: '2026-03-20',
  createdAt: '2026-02-01T09:00:00Z',
  updatedAt: new Date().toISOString(),
  templateId: 'tpl_10',
  checks: [] 
}));