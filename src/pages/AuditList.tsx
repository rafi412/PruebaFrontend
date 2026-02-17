import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Plus,
  ClipboardList,
  FilterX
} from 'lucide-react';

import { useAudits } from '../hooks/useAudits';
import { StatusBadge } from '../components/StatusBadge';
import { AuditSkeleton } from '../components/AuditSkeleton';

/**
 * Componente principal del listado de auditorías.
 * Gestiona la visualización de datos, filtrado por URL y estados de carga.
 */
export default function AuditList() {
  const navigate = useNavigate();

  // Obtención de estado y lógica desde el custom hook
  const {
    audits, loading, error, page, search, sort, order,
    totalPages, updateFilters, retry
  } = useAudits();

  // Estado local para el manejo del input de búsqueda (Debounce)
  const [searchTerm, setSearchTerm] = useState(search);

  // Sincronización del término de búsqueda con la URL tras un retraso (Debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== search) {
        updateFilters({ q: searchTerm });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, search, updateFilters]);

  // Lógica para determinar si existen filtros activos
  const hasActiveFilters = searchTerm !== '' || sort !== 'createdAt' || order !== 'desc';

  /**
   * Resetea todos los filtros y devuelve la navegación a la página inicial.
   */
  const handleClear = () => {
    setSearchTerm('');
    updateFilters({
      q: '',
      page: 1,
      sort: 'createdAt',
      order: 'desc'
    });
  };

  return (
    <div className="space-y-6">
      {/* BARRA DE HERRAMIENTAS: */}
      <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3 w-full xl:w-auto">

        {/* GRUPO 1: FILTROS (Izquierda) */}
        <div className="flex items-center gap-2 flex-1 min-w-0">

          {/* Selector de Ordenación */}
          <div className="relative shrink-0">
            <select
              value={`${sort}-${order}`}
              onChange={(e) => {
                const [newSort, newOrder] = e.target.value.split('-');
                updateFilters({ sort: newSort, order: newOrder as 'asc' | 'desc' });
              }}
              className="appearance-none bg-gray-50 border border-gray-100 text-[11px] font-bold text-gray-600 rounded-lg pl-3 pr-8 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-gray-100 transition-colors uppercase"
            >
              <option value="createdAt-desc">Recientes</option>
              <option value="name-asc">A-Z</option>
              <option value="progress-desc">Progreso</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg width="8" height="5" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>

          {/* Buscador */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* GRUPO 2: ACCIONES (Derecha) */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Botón Limpiar */}
          <button
            onClick={handleClear}
            disabled={!hasActiveFilters}
            className={`p-2.5 rounded-lg transition-all border border-transparent ${hasActiveFilters ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-gray-200 cursor-not-allowed"
              }`}
            title="Limpiar filtros"
          >
            <FilterX size={18} />
          </button>

          <div className="w-px h-6 bg-gray-100 mx-1 hidden sm:block"></div>

          {/* Botón Nueva Auditoría */}
          <button
            onClick={() => navigate('/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nueva Auditoría</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        </div>
      </div>

      {/* CONTENEDOR DE DATOS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[450px]">

        {/* Caso 1: Cargando (Skeletons) */}
        {loading && (
          <div className="divide-y divide-gray-100 flex-1">
            {Array.from({ length: 8 }).map((_, i) => <AuditSkeleton key={i} />)}
          </div>
        )}

        {/* Caso 2: Error de Servidor */}
        {!loading && error && (
          <div className="flex-1 flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
              <AlertCircle size={32} />
            </div>
            <h4 className="text-lg font-bold text-gray-900">{error}</h4>
            <button onClick={retry} className="mt-6 flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors">
              <RefreshCw size={18} /> Reintentar ahora
            </button>
          </div>
        )}

        {/* Caso 3: Éxito (Lista o Vacío) */}
        {!loading && !error && (
          <div className="flex-1 flex flex-col">
            {audits.length > 0 ? (
              /* Renderizado de filas de auditoría */
              <div className="divide-y divide-gray-100">
                {audits.map((audit) => (
                  <div
                    key={audit.id}
                    onClick={() => navigate(`/audit/${audit.id}`)}
                    className="px-6 py-4 hover:bg-blue-50/30 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {audit.name}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 font-medium uppercase tracking-wider">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{audit.process}</span>
                        <span>•</span>
                        <span>{audit.owner.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right hidden lg:block">
                        <div className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Progreso</div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${audit.progress}%` }} />
                          </div>
                          <span className="text-sm font-bold text-gray-700 w-8">{audit.progress}%</span>
                        </div>
                      </div>
                      <div className="w-28 flex justify-end text-right">
                        <StatusBadge status={audit.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Renderizado de estados vacíos (Búsqueda o BD vacía) */
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <ClipboardList size={40} />
                </div>
                {search ? (
                  <>
                    <h4 className="text-lg font-bold text-gray-900">No hay coincidencias</h4>
                    <p className="text-sm text-gray-500 mt-1 max-w-xs">No encontramos nada que coincida con "{search}".</p>
                    <button onClick={handleClear} className="mt-6 text-blue-600 font-bold hover:underline flex items-center gap-2 text-sm">
                      <FilterX size={18} /> Limpiar búsqueda
                    </button>
                  </>
                ) : (
                  <>
                    <h4 className="text-lg font-bold text-gray-900">No hay auditorías</h4>
                    <p className="text-sm text-gray-500 mt-1 max-w-xs">Todavía no se ha registrado ninguna auditoría.</p>
                    <button onClick={() => navigate('/create')} className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 active:scale-95 flex items-center gap-2">
                      <Plus size={20} /> Crear primera auditoría
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* PAGINACIÓN (Visible solo si hay datos) */}
        {!loading && !error && audits.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
            <div className="text-sm text-gray-500 italic">
              Página <span className="font-bold text-gray-900">{page}</span> de <span className="font-bold text-gray-900">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateFilters({ page: Math.max(1, page - 1) })}
                disabled={page === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-bold text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <button
                onClick={() => updateFilters({ page: Math.min(totalPages, page + 1) })}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-bold text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}