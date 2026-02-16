import { dbAudits } from "../mocks/db";
import type { Audit, Check } from "../types";

/**
 * Simulación de latencia de red.
 * @param ms Milisegundos de espera.
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  /**
   * Obtiene el listado paginado y filtrado de auditorías.
   */
  getAudits: async (page = 1, pageSize = 10, search = '', sort = 'createdAt', order = 'desc') => {
  const ms = Math.floor(Math.random() * (1200 - 300 + 1)) + 300;
  await delay(ms);

  if (Math.random() < 0.15) throw new Error("Error de servidor simulado");

  // 1. Filtrado (Aseguramos que siempre haya un array)
  let data = [...dbAudits].filter(audit => 
    audit.name.toLowerCase().includes(search.toLowerCase()) ||
    audit.process.toLowerCase().includes(search.toLowerCase())
  );

  // 2. Ordenación Robusta
  data.sort((a, b) => {
    const valA = a[sort as keyof typeof a];
    const valB = b[sort as keyof typeof b];

    // Manejo de nulos o indefinidos
    if (valA === undefined || valB === undefined) return 0;

    // Si son strings (Name, Process...)
    if (typeof valA === 'string' && typeof valB === 'string') {
      return order === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    }
    
    // Si son números o fechas (Progress, createdAt...)
    // Convertimos a número para comparar (las fechas funcionan con getTime() o comparando strings ISO)
    const numA = typeof valA === 'string' ? new Date(valA).getTime() : (valA as number);
    const numB = typeof valB === 'string' ? new Date(valB).getTime() : (valB as number);

    return order === 'asc' ? numA - numB : numB - numA;
  });

  const start = (page - 1) * pageSize;
  return {
    items: data.slice(start, start + pageSize),
    total: data.length
  };
},

  /**
   * Obtiene el detalle de una auditoría específica por su ID.
   */
  getAuditById: async (id: string) => {
    const ms = Math.floor(Math.random() * (800 - 300 + 1)) + 300;
    await delay(ms);

    const audit = dbAudits.find(a => a.id === id);
    if (!audit) throw new Error("Auditoría no encontrada");

    // Si la auditoría no tiene checks (es nueva), generamos unos por defecto para la simulación
    if (audit.checks.length === 0) {
      audit.checks = [
        { id: 'c1', title: 'Verificar control de acceso a servidores', priority: 'HIGH', status: 'PENDING', reviewed: false, updatedAt: new Date().toISOString() },
        { id: 'c2', title: 'Revisar logs de auditoría trimestrales', priority: 'MEDIUM', status: 'PENDING', reviewed: false, updatedAt: new Date().toISOString() },
        { id: 'c3', title: 'Validar políticas de contraseñas', priority: 'LOW', status: 'PENDING', reviewed: false, updatedAt: new Date().toISOString() },
        { id: 'c4', title: 'Cifrado de bases de datos en reposo', priority: 'HIGH', status: 'PENDING', reviewed: false, updatedAt: new Date().toISOString() },
      ];
    }

    return { audit };
  },

  /**
   * Inicia el proceso de ejecución de una auditoría.
   */
  runAudit: async (id: string) => {
    await delay(500);
    const audit = dbAudits.find(a => a.id === id);
    if (audit) {
      audit.status = 'IN_PROGRESS';
      audit.updatedAt = new Date().toISOString();
    }
    return { success: true };
  },

  /**
   * Actualiza el estado o datos de un check específico dentro de una auditoría.
   */
  updateCheck: async (auditId: string, checkId: string, data: Partial<Check>) => {
    await delay(200);
    const audit = dbAudits.find(a => a.id === auditId);
    const check = audit?.checks.find(c => c.id === checkId);

    if (check && audit) {
      // 1. Actualizamos el check
      Object.assign(check, data);
      check.updatedAt = new Date().toISOString();

      // 2. Recalculamos el progreso global
      const total = audit.checks.length;
      const reviewed = audit.checks.filter(c => c.reviewed).length;
      audit.progress = Math.round((reviewed / total) * 100);

      // 3. LÓGICA DE ESTADO GLOBAL
      // Si todos los checks han sido procesados...
      if (reviewed === total) {
        const hasKO = audit.checks.some(c => c.status === 'KO');

        // Si todos OK -> DONE. Si hay KO -> IN_PROGRESS (o bloqueado)
        audit.status = hasKO ? 'IN_PROGRESS' : 'DONE';
      } else {
        // Si empezamos a ejecutar pero no hemos terminado
        audit.status = 'IN_PROGRESS';
      }

      audit.updatedAt = new Date().toISOString();
    }

    return { success: true };
  },

  /**
   * Crea una nueva instancia de auditoría y la añade al repositorio local.
   * Genera automáticamente los checks iniciales basados en la lógica de negocio.
   */
  createAudit: async (auditData: { name: string; process: string; templateId: string; owner: { id: string; name: string } }) => {
    await delay(800);

    const newAudit: Audit = {
      ...auditData,
      id: `aud_${Math.floor(Math.random() * 10000)}`,
      status: 'DRAFT',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checks: [
        { id: 'c_init_1', title: 'Verificación de alcance inicial', priority: 'HIGH', status: 'PENDING', reviewed: false, updatedAt: new Date().toISOString() },
        { id: 'c_init_2', title: 'Revisión de documentación técnica', priority: 'MEDIUM', status: 'PENDING', reviewed: false, updatedAt: new Date().toISOString() },
        { id: 'c_init_3', title: 'Entrevista con responsables de proceso', priority: 'LOW', status: 'PENDING', reviewed: false, updatedAt: new Date().toISOString() },
      ],
      targetDate: ""
    };

    // Insertamos al inicio para que aparezca primero en el listado
    dbAudits.unshift(newAudit);
    return newAudit;
  }
};