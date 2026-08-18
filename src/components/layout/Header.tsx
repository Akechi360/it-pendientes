import React, { useState } from 'react';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Plus,
  Command,
  X,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const {
    setIsCommandPaletteOpen,
    setIsCreateTaskOpen,
    setIsCreateIncidentOpen,
    setIsCreateProjectOpen,
    notifications,
    isDarkTheme,
    toggleTheme,
    setActiveTab,
    setIsProfileOpen
  } = useApp();
  
  const { currentUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b border-border-subtle bg-canvas/80 backdrop-blur-md">
      {/* Search Bar / Command Palette Trigger */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border-subtle bg-surface hover:bg-surface-hover text-sm font-normal text-content-secondary transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-content-muted" />
            <span>Buscar tareas, incidencias, documentación...</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface-raised border border-border-subtle text-content-muted">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Create Menu */}
        <div className="relative">
          <button
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-surface-raised hover:bg-surface-hover border border-border-subtle text-content-primary transition-all"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Crear</span>
            <ChevronDown className="w-3 h-3 text-content-muted ml-1" />
          </button>
          
          {showCreateMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 rounded-xl shadow-lg border border-border-subtle bg-surface overflow-hidden z-50">
              <div className="p-1 space-y-1">
                <button
                  onClick={() => { setShowCreateMenu(false); setIsCreateTaskOpen(true); }}
                  className="w-full text-left px-3 py-2 text-sm text-content-primary hover:bg-surface-hover rounded-lg transition-colors"
                >
                  Tarea
                </button>
                <button
                  onClick={() => { setShowCreateMenu(false); setIsCreateIncidentOpen(true); }}
                  className="w-full text-left px-3 py-2 text-sm text-content-primary hover:bg-surface-hover rounded-lg transition-colors"
                >
                  Incidencia
                </button>
                <button
                  onClick={() => { setShowCreateMenu(false); setIsCreateProjectOpen(true); }}
                  className="w-full text-left px-3 py-2 text-sm text-content-primary hover:bg-surface-hover rounded-lg transition-colors"
                >
                  Proyecto
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-border-subtle bg-surface hover:bg-surface-hover text-content-secondary transition-all"
          title={isDarkTheme ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDarkTheme ? <Sun className="w-4 h-4 hover:text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Tray Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg border border-border-subtle bg-surface hover:bg-surface-hover text-content-secondary transition-all"
            title="Notificaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-lg border border-border-subtle bg-surface z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-content-primary">
                  <Bell className="w-4 h-4 text-cyan-400" /> Notificaciones
                </h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded hover:bg-surface-hover text-content-muted hover:text-content-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-content-muted py-4 text-center">No hay notificaciones recientes.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.linkModule) setActiveTab(n.linkModule as any);
                        setShowNotifications(false);
                      }}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        n.isRead
                          ? 'bg-canvas border-transparent text-content-muted hover:bg-surface-hover'
                          : 'bg-surface-raised border-border-subtle text-content-primary hover:bg-surface-hover'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold mb-1">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-content-muted font-mono">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-content-secondary text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Button */}
        <button
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-2 ml-2 pl-3 py-1 border-l border-border-subtle hover:opacity-80 transition-opacity"
          title="Mi Perfil"
        >
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-bold text-content-primary leading-tight">{currentUser?.displayName.split(' ')[0]}</span>
            <span className="text-[10px] text-content-muted capitalize">{currentUser?.role === 'admin' ? 'Administrador' : 'Analista'}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold border border-cyan-500/30">
            {currentUser?.displayName.charAt(0).toUpperCase() || 'U'}
          </div>
        </button>

      </div>
    </header>
  );
};
