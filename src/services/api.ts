import { dbAudits } from "../mocks/db";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  //Obtener las auditorías según la página, el tamaño de página y el término de búsqueda
  getAudits: async (page: number = 1, pageSize: number = 10, search: string = '') => {
    const ms = Math.floor(Math.random() * (1200 - 300 + 1)) + 300;
    await delay(ms);

    //if (Math.random() < 0.15) throw new Error("Error de servidor simulado");

    // FILTRADO: Buscamos en el nombre o en el proceso
    const filteredData = dbAudits.filter(audit =>
      audit.name.toLowerCase().includes(search.toLowerCase()) ||
      audit.process.toLowerCase().includes(search.toLowerCase())
    );

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      items: filteredData.slice(start, end),
      total: filteredData.length // Importante: el total ahora es del filtro
    };
  },

  //Obtener auditoría en concreto según su ID
  getAuditById: async (id: string) => {
  const ms = Math.floor(Math.random() * (1200 - 300 + 1)) + 300;
  await delay(ms);
  
  const audit = dbAudits.find(a => a.id === id);
  if (!audit) throw new Error("Auditoría no encontrada");

  // Si la auditoría no tiene checks (es nueva), le generamos unos de prueba
  if (audit.checks.length === 0) {
    audit.checks = [
      { id: 'c1', title: 'Verificar control de acceso', priority: 'HIGH', status: 'PENDING', reviewed: false, updatedAt: new Date().toISOString() },
      { id: 'c2', title: 'Revisar backups semanales', priority: 'MEDIUM', status: 'PENDING', reviewed: false, updatedAt: new Date().toISOString() },
      { id: 'c3', title: 'Validar cifrado de datos', priority: 'HIGH', status: 'PENDING', reviewed: false, updatedAt: new Date().toISOString() },
    ];
  }

  return { audit };
}
};