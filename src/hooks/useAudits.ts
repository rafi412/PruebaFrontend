import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom'; // Importante
import { api } from '../services/api';
import type { Audit } from '../types';

export function useAudits() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const pageSize = 8;

  // Leemos los valores directamente de la URL
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') || 'desc';

  // Función para cargar auditorías con los parámetros de búsqueda
  const fetchAudits = useCallback(async () => {
    setLoading(true);
    setError(null); // Limpiamos el error antes de empezar
    try {
      const data = await api.getAudits(page, 8, search, sort, order);
      setAudits(data.items);
      setTotal(data.total);
    } catch (err) {
      setError("No se pudieron cargar los datos. Reintenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [page, search, sort, order]); // Se recrea solo si cambian los filtros

  // Sincronizamos la carga con los cambios en la URL
  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  /**
   * Actualiza la URL con los nuevos filtros.
   * Esto disparará automáticamente el useEffect superior.
   */
  const updateFilters = (newParams: any) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === '') params.delete(key);
      else params.set(key, value as string);
    });
    if (newParams.q !== undefined) params.set('page', '1');
    setSearchParams(params);
  };

  return {
    audits, loading, error, page, search, sort, order,
    totalPages: Math.ceil(total / 8),
    updateFilters,
    retry: fetchAudits
  };
}
