import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  LifeBuoy,
  Calendar,
  Users,
  FileText,
  Server,
  RefreshCw,
  FolderArchive,
  History,
  ChevronLeft,
  ChevronRight,
  Plus,
  ShieldCheck,
  User,
  Sparkles
} from 'lucide-react';
import { useApp, ActiveTab } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, tasks, incidents, renewals, openQuickCreate, isDarkTheme } = useApp();
  const { currentUser, switchUser, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completada' && t.status !== 'cancelada').length;
  const openIncidentsCount = incidents.filter((i) => i.status !== 'resuelta' && i.status !== 'cerrada' && i.status !== 'cancelada').length;
  const upcomingRenewalsCount = renewals.filter((r) => r.status === 'proximo_a_renovar' || r.status === 'vencido').length;

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tareas & Pendientes', icon: CheckSquare, badge: pendingTasksCount, badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
    { id: 'projects', label: 'Proyectos IT', icon: FolderKanban },
    { id: 'incidents', label: 'Incidencias & Soporte', icon: LifeBuoy, badge: openIncidentsCount, badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
    { id: 'calendar', label: 'Calendario IT', icon: Calendar },
    { id: 'meetings', label: 'Reuniones & Minutas', icon: Users },
    { id: 'documents', label: 'Documentación (KB)', icon: FileText },
    { id: 'assets', label: 'Inventario de Activos', icon: Server },
    { id: 'renewals', label: 'Compras & Renovaciones', icon: RefreshCw, badge: upcomingRenewalsCount, badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
    { id: 'files', label: 'Gestor de Archivos', icon: FolderArchive },
    { id: 'audit', label: 'Bitácora & Auditoría', icon: History }
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between border-r transition-all duration-300 z-30 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      } ${
        isDarkTheme
          ? 'bg-slate-900/90 border-slate-800 text-slate-300'
          : 'bg-white border-slate-200 text-slate-700'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`absolute -right-3 top-6 p-1 rounded-full border shadow-md transition-all ${
          isDarkTheme ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900'
        }`}
        title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Header / Brand */}
      <div>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800/60">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 shrink-0">
            <Server className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-base tracking-wide text-white flex items-center gap-1.5 truncate">
                PORTAL IT <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono">v2.6</span>
              </h1>
              <p className="text-xs text-slate-400 truncate">Dpto. de Sistemas & Operations</p>
            </div>
          )}
        </div>

        {/* Quick Create Action */}
        <div className="p-3">
          <button
            onClick={() => openQuickCreate('task')}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium text-sm transition-all shadow-md ${
              collapsed
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Nueva Tarea / Registro</span>}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? isDarkTheme
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                    : isDarkTheme
                    ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : ''}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Switcher */}
      <div className={`p-3 border-t ${isDarkTheme ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
        {!collapsed && (
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Operador Activo
            </span>
            <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {currentUser.role}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <img
            src={currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={currentUser.displayName}
            className="w-8 h-8 rounded-full border border-cyan-500/40 object-cover shrink-0"
          />
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.displayName}</p>
              <p className="text-[11px] text-slate-400 truncate">{currentUser.title}</p>
            </div>
          )}
        </div>

        {/* Quick Role Switcher Button */}
        {!collapsed && (
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Cambiar operador:</span>
            <div className="flex gap-1">
              <button
                onClick={() => switchUser('admin')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  isAdmin ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Cambiar a Jefe de Sistemas (Admin)"
              >
                Admin
              </button>
              <button
                onClick={() => switchUser('analyst')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  !isAdmin ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Cambiar a Analista IT (Operativo)"
              >
                Analista
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
