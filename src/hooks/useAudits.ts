import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Audit } from '../types';

/**
 * Hook para la gestión del estado del listado de auditorías.
 * Sincroniza los filtros con los parámetros de búsqueda de la URL (Query Params)
 * y gestiona los estados de carga, error y persistencia offline.
 */
export function useAudits() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Estado para identificar si los datos actuales provienen de la caché local
  const [isOffline, setIsOffline] = useState(false);

  // Extracción de parámetros de la URL para mantener la sincronización del estado
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'createdAt';
  const order = (searchParams.get('order') as 'asc' | 'desc') || 'desc';

  /**
   * Realiza la petición a la capa de servicios para obtener los datos actualizados.
   * Gestiona la respuesta del servidor simulado y el fallback a datos cacheados.
   */
  const fetchAudits = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.getAudits(page, 8, search, sort, order);

      setAudits(data.items);
      setTotal(data.total);
      
      // Actualización del indicador de origen de datos basada en la respuesta del servicio
      setIsOffline(data.isOffline);

    } catch (err) {
      setError("No se ha podido establecer conexión con el servidor.");
      // Reinicio del estado offline en caso de fallo crítico sin acceso a caché
      setIsOffline(false);
    } finally {
      setLoading(false);
    }
  }, [page, search, sort, order]);

  /**
   * Efecto para sincronizar la carga de datos con cualquier cambio en los parámetros de navegación.
   */
  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  /**
   * Actualiza los parámetros de búsqueda en la URL de forma normalizada.
   * Gestiona la eliminación de parámetros vacíos y el reseteo de la paginación.
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

    // Reset de la paginación al realizar una nueva búsqueda por texto
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