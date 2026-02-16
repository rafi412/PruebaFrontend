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

/** - Búsqueda 
 * - Paginación
 * - Manejo de estados (carga, error, vacío)
 * - Navegación a detalle
 */
export default function AuditList() {
  const navigate = useNavigate();

  // 1. Desestructuramos exactamente lo que devuelve el hook
  const { audits, loading, error, page, search, sort, order, totalPages, updateFilters, retry } = useAudits();

  // 2. Sincronizamos el estado local del input con la búsqueda de la URL
  const [searchTerm, setSearchTerm] = useState(search);

  // 3. Debounce: Cuando el usuario deja de escribir, actualizamos la URL
  useEffect(() => {
    const timer = setTimeout(() => {
      // Solo actualizamos si el valor ha cambiado realmente
      if (searchTerm !== search) {
        updateFilters({ q: searchTerm });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, search, updateFilters]);

  // 4. Definimos si hay filtros activos para mostrar u ocultar el botón
  const hasActiveFilters = searchTerm !== '' || sort !== 'createdAt' || order !== 'desc';

  const handleClear = () => {
    setSearchTerm(''); // Limpia el input visualmente
    updateFilters({
      q: '',
      page: 1,
      sort: 'createdAt',
      order: 'desc'
    }); // Limpia la URL y dispara la recarga de la API
  };

  return (
    <div className="space-y-6">
      {/* CABECERA Y BUSCADOR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Listado de Auditorías</h3>
        </div>

        {/* BARRA DE HERRAMIENTAS ESTABLE Y ALINEADA */}
        <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-4 mb-6">

          {/* GRUPO IZQUIERDO: Filtros */}
          <div className="flex items-center gap-2 flex-1">

            {/* 1. Selector de Ordenación */}
            <div className="relative shrink-0">
              <select
                value={`${sort}-${order}`}
                onChange={(e) => {
                  const [newSort, newOrder] = e.target.value.split('-');
                  updateFilters({ sort: newSort, order: newOrder as 'asc' | 'desc' });
                }}
                className="appearance-none bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-lg pl-3 pr-8 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="createdAt-desc">Más recientes</option>
                <option value="createdAt-asc">Más antiguos</option>
                <option value="name-asc">Nombre (A-Z)</option>
                <option value="progress-desc">Mayor progreso</option>
              </select>
              {/* Flechita custom para que quede más pro */}
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>

            {/* 2. Buscador */}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar auditoría..."
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* 3. Botón Limpiar (ESTABLE: Siempre visible, cambia de estado) */}
            <button
              onClick={handleClear}
              disabled={!hasActiveFilters}
              className={`
        p-2 rounded-lg transition-all flex items-center justify-center border border-transparent
        ${hasActiveFilters
                  ? "text-red-500 hover:bg-red-50 hover:border-red-100 cursor-pointer"
                  : "text-gray-300 cursor-not-allowed opacity-50"
                }
      `}
              title={hasActiveFilters ? "Limpiar filtros" : "Sin filtros activos"}
            >
              <FilterX size={20} />
            </button>
          </div>

          {/* GRUPO DERECHO: Acción Principal */}
          <button
            onClick={() => navigate('/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm shadow-blue-100 active:scale-95 shrink-0"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nueva Auditoría</span>
            <span className="sm:hidden">Crear</span>
          </button>
        </div>

      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* 1. ESTADO DE ERROR */}
        {error && (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">{error}</h4>
            <p className="text-gray-500 max-w-xs mt-1">Hubo un problema al conectar con el servidor simulado.</p>
            <button
              onClick={retry}
              className="mt-6 flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw size={18} /> Reintentar ahora
            </button>
          </div>
        )}

        {/* 2. TABLA / LISTADO */}
        {!error && (
          <div className="divide-y divide-gray-100">
            {loading ? (
              // Muestra 8 esqueletos mientras carga
              Array.from({ length: 8 }).map((_, i) => <AuditSkeleton key={i} />)
            ) : audits.length > 0 ? (
              audits.map((audit) => (
                <div
                  key={audit.id}
                  onClick={() => navigate(`/audit/${audit.id}`)}
                  className="px-6 py-4 hover:bg-blue-50/30 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {audit.name}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider text-gray-600">
                        {audit.process}
                      </span>
                      <span>•</span>
                      <span>{audit.owner.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    {/* Barra de Progreso */}
                    <div className="text-right hidden lg:block">
                      <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-tighter">Progreso</div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-700 ease-out"
                            style={{ width: `${audit.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-700 w-8">{audit.progress}%</span>
                      </div>
                    </div>

                    {/* Badge de Estado */}
                    <div className="w-28 flex justify-end">
                      <StatusBadge status={audit.status} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // 3. ESTADO VACÍO (No hay resultados)
              <div className="p-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <ClipboardList className="text-gray-300" size={40} />
                </div>
                <h4 className="text-lg font-medium text-gray-900">No se encontraron auditorías</h4>
                <p className="text-gray-500 mt-1">Prueba con otros términos de búsqueda o limpia los filtros.</p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-blue-600 font-semibold hover:text-blue-700 underline underline-offset-4"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. PAGINACIÓN */}
        {!error && !loading && audits.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mostrando página <span className="font-bold text-gray-900">{page}</span> de <span className="font-bold text-gray-900">{totalPages}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateFilters({ page: Math.max(1, page - 1) })}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <button
                onClick={() => updateFilters({ page: Math.min(totalPages, page + 1) })}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
              >
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}