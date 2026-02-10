import { dbAudits } from "../mocks/db";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  getAudits: async (page: number = 1, pageSize: number = 10) => {
    // 1. Latencia variable (300ms - 1200ms)
    const ms = Math.floor(Math.random() * (1200 - 300 + 1)) + 300;
    await delay(ms);

    // 2. Error aleatorio (15%)
    if (Math.random() < 0.15) throw new Error("Error de servidor simulado");

    // 3. Paginación real
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      items: dbAudits.slice(start, end),
      total: dbAudits.length
    };
  }
};