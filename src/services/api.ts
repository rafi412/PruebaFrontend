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
  // Función auxiliar para saber si estamos simulando offline
  isSimulatedOffline: () => localStorage.getItem('simulate_offline') === 'true',

 getAudits: async (page = 1, pageSize = 10, search = '', sort = 'createdAt', order = 'desc') => {
    await delay(Math.floor(Math.random() * (1200 - 300 + 1)) + 300);

    // SIMULACIÓN: Error si el interruptor está ON o por el 15% aleatorio
    const shouldFail = api.isSimulatedOffline() || Math.random() < 0.15;

    if (shouldFail) {
      const cached = localStorage.getItem('audits_cache');
      if (cached) {
        return { ...JSON.parse(cached), isOffline: true };
      }
      throw new Error("Error de conexión");
    }

    // 3. Lógica de Filtrado (Server-side simulation)
    let data = [...dbAudits].filter(audit =>
      audit.name.toLowerCase().includes(search.toLowerCase()) ||
      audit.process.toLowerCase().includes(search.toLowerCase())
    );

    // 4. Lógica de Ordenación Robusta (Server-side simulation)
    data.sort((a, b) => {
      const valA = a[sort as keyof typeof a];
      const valB = b[sort as keyof typeof b];

      if (valA === undefined || valB === undefined) return 0;

      // Caso A: Comparación de cadenas de texto (Nombre, Proceso)
      if (typeof valA === 'string' && typeof valB === 'string') {
        // Verificación de si la cadena es una fecha ISO
        const isDate = valA.includes('T') && !isNaN(Date.parse(valA));

        if (isDate) {
          const timeA = new Date(valA).getTime();
          const timeB = new Date(valB).getTime();
          return order === 'asc' ? timeA - timeB : timeB - timeA;
        }

        return order === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      // Caso B: Comparación numérica (Progreso)
      return order === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });

    // 5. Lógica de Paginación
    const start = (page - 1) * pageSize;
    const paginatedItems = data.slice(start, start + pageSize);

    const result = {
      items: paginatedItems,
      total: data.length,
      isOffline: false // Indica que los datos provienen de una "petición" exitosa
    };

    // 6. Persistencia en LocalStorage para soporte offline en futuras peticiones fallidas
    localStorage.setItem('audits_cache', JSON.stringify(result));

    return result;
  },

  /**
   * Obtiene el detalle de una auditoría específica por su ID.
   */
  getAuditById: async (id: string) => {
    const ms = Math.floor(Math.random() * (800 - 300 + 1)) + 300;
    await delay(ms);

    const audit = dbAudits.find(a => a.id === id);
    if (!audit) throw new Error("Auditoría no encontrada");

    // Si la auditoría no tiene checks, los generamos respetando su estado global
    if (audit.checks.length === 0) {
      const isDone = audit.status === 'DONE';

      // Generamos checks basados en el estado de la auditoría
      audit.checks = [
        { id: 'c1', title: 'Verificar control de acceso', priority: 'HIGH', status: isDone ? 'OK' : 'PENDING', reviewed: isDone, updatedAt: new Date().toISOString() },
        { id: 'c2', title: 'Revisar backups semanales', priority: 'MEDIUM', status: isDone ? 'OK' : 'PENDING', reviewed: isDone, updatedAt: new Date().toISOString() },
        { id: 'c3', title: 'Validar cifrado de datos', priority: 'HIGH', status: isDone ? 'OK' : 'PENDING', reviewed: isDone, updatedAt: new Date().toISOString() },
        { id: 'c4', title: 'Gestión de vulnerabilidades', priority: 'MEDIUM', status: isDone ? 'OK' : 'PENDING', reviewed: isDone, updatedAt: new Date().toISOString() },
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