import { useState, type ReactNode } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  User
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Componente de estructura principal (Shell) de la aplicación.
 * Gestiona el sidebar responsivo mediante un sistema de drawer, la barra superior y el área de contenido.
 */
export function Layout({ children }: { children: ReactNode }) {
  // Control de estado para la visibilidad del sidebar en dispositivos móviles
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Configuración centralizada de los elementos de navegación
  const menuItems = [
    { icon: ClipboardList, label: 'Auditorías', path: '/' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Settings, label: 'Configuración', path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Overlay de oscurecimiento para cerrar el sidebar al interactuar fuera de él en móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel lateral de navegación (Sidebar) con soporte para transiciones animadas */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Cabecera del sidebar: Identidad visual y control de cierre */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <LayoutDashboard size={24} />
            AuditPro
          </h1>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegación principal con detección de ruta activa para feedback visual */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all",
                  isActive 
                    ? "bg-blue-50 text-blue-700 shadow-sm" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon size={20} className={isActive ? "text-blue-600" : "text-gray-400"} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sección inferior: Información de sesión y perfil de usuario */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              RL
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Rafael López</p>
              <p className="text-xs text-gray-500 truncate">Admin</p>
            </div>
            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors" aria-label="Cerrar sesión">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Contenedor de la vista principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Barra superior (Topbar) con disparador de menú y acciones rápidas */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
              aria-label="Abrir menú"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">
              Gestión de Auditorías
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600" aria-label="Ver perfil">
              <User size={20} />
            </button>
          </div>
        </header>

        {/* Área de scroll para el contenido inyectado mediante children */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}