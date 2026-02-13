import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Audit } from '../types';

export function useAudits() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(''); // Nuevo estado
  const [total, setTotal] = useState(0);
  const pageSize = 8;

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const data = await api.getAudits(page, pageSize, search);
      setAudits(data.items);
      setTotal(data.total);
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, [page, search]); // Se dispara si cambia la página O la búsqueda

  // Función para buscar que resetea la página
  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1); 
  };

  return { audits, loading, error, page, setPage, totalPages: Math.ceil(total / pageSize), retry: fetchAudits, handleSearch };
}