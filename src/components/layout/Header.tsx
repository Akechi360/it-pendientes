import React, { useState } from 'react';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Plus,
  Command,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Server,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const {
    setIsCommandPaletteOpen,
    openQuickCreate,
    notifications,
    isDarkTheme,
    toggleTheme,
    toastMessage,
    setActiveTab
  } = useApp();
  const { currentUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header
      className={`sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b backdrop-blur-md transition-colors ${
        isDarkTheme ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white/80 border-slate-200 text-slate-900'
      }`}
    >
      {/* Search Bar / Command Palette Trigger */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className={`w-full flex items-center justify-between px-4 py-2 rounded-xl border text-sm font-normal transition-all shadow-sm ${
            isDarkTheme
              ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              : 'bg-slate-100/80 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-cyan-500" />
            <span>Buscar tareas, incidencias, documentos o activos...</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Toast Banner Overlay */}
      {toastMessage && (
        <div className="fixed top-4 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border bg-slate-900 border-cyan-500/40 text-slate-100 animate-in fade-in slide-in-from-top-2">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {toastMessage.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
          {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
          {toastMessage.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Create Dropdown */}
        <div className="relative">
          <button
            onClick={() => openQuickCreate('task')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Crear</span>
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg border transition-all ${
            isDarkTheme
              ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-800'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
          }`}
          title={isDarkTheme ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Tray Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-lg border transition-all ${
              isDarkTheme
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Notificaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div
              className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border p-4 z-50 ${
                isDarkTheme ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-800">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" /> Notificaciones
                </h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No hay notificaciones recientes.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.linkModule) setActiveTab(n.linkModule as any);
                        setShowNotifications(false);
                      }}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        n.isRead
                          ? isDarkTheme ? 'bg-slate-950/40 border-slate-800/60 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                          : isDarkTheme ? 'bg-cyan-950/30 border-cyan-500/30 text-slate-200' : 'bg-cyan-50 border-cyan-200 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold mb-1">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
