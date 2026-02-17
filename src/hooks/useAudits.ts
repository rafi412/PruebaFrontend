import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Audit } from '../types';

/**
 * Hook para la gestión del estado del listado de auditorías.
 * Sincroniza los filtros con la URL y maneja estados de carga, error y modo offline.
 */
export function useAudits() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // NUEVO: Estado para controlar si los datos vienen de la caché (offline)
  const [isOffline, setIsOffline] = useState(false);

  // Parámetros extraídos de la URL (Fuente de verdad)
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'createdAt';
  const order = (searchParams.get('order') as 'asc' | 'desc') || 'desc';

  /**
   * Función para obtener los datos de la API simulada.
   */
  const fetchAudits = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.getAudits(page, 8, search, sort, order);

      setAudits(data.items);
      setTotal(data.total);
      setIsOffline(data.isOffline); // Se pone true o false según la respuesta

    } catch (err) {
      setError("Error de conexión");
      // Si hay un error crítico y no hay ni siquiera caché:
      setIsOffline(false);
    } finally {
      setLoading(false);
    }
  }, [page, search, sort, order]);
  // Disparamos la búsqueda cada vez que cambian los parámetros en la URL
  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  /**
   * Actualiza los parámetros de la URL de forma segura.
   */
  const updateFilters = (newParams: any) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === null) {
        params.delete(key);
      } else {
        params.set(key, value as string);
      }
    });

    // Si se realiza una búsqueda nueva, reseteamos a la página 1
    if (newParams.q !== undefined) {
      params.set('page', '1');
    }

    setSearchParams(params);
  };

  return {
    audits,
    loading,
    error,
    isOffline,
    page,
    search,
    sort,
    order,
    totalPages: Math.ceil(total / 8),
    updateFilters,
    retry: fetchAudits
  };
}