import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Audit } from '../types';

/**
 * Hook para gestionar auditorías:
 * - Obtiene datos desde la API
 * - Maneja paginación y búsqueda
 * - Controla estados de carga y error
 */
export function useAudits() {
  // Estados principales
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de paginación y búsqueda
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const pageSize = 8; // Número de elementos por página

  // Obtiene auditorías desde la API según página y búsqueda
  const fetchAudits = async () => {
    setLoading(true);
    try {
      const data = await api.getAudits(page, pageSize, search);
      setAudits(data.items);
      setTotal(data.total);
      setError(null); // Limpia error si la petición fue exitosa
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Vuelve a cargar datos cuando cambia la página o la búsqueda
  useEffect(() => {
    fetchAudits();
  }, [page, search]);

  // Actualiza búsqueda y reinicia a la primera página
  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  // Datos y funciones expuestas por el hook
  return {
    audits,
    loading,
    error,
    page,
    setPage,
    totalPages: Math.ceil(total / pageSize),
    retry: fetchAudits,
    handleSearch
  };
}
