import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useApp, ActiveTab } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, tasks, incidents, renewals } = useApp();
  const { currentUser, switchUser, isAdmin } = useAuth();
  
  // Responsive sidebar logic
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [activeTab]);

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completada' && t.status !== 'cancelada').length;
  const openIncidentsCount = incidents.filter((i) => i.status !== 'resuelta' && i.status !== 'cerrada' && i.status !== 'cancelada').length;
  const upcomingRenewalsCount = renewals.filter((r) => r.status === 'proximo_a_renovar' || r.status === 'vencido').length;

  const navGroups = [
    {
      title: 'Operaciones',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tasks', label: 'Tareas & Pendientes', icon: CheckSquare, badge: pendingTasksCount },
        { id: 'projects', label: 'Proyectos IT', icon: FolderKanban },
        { id: 'incidents', label: 'Incidencias', icon: LifeBuoy, badge: openIncidentsCount, badgeColor: 'text-rose-400 bg-rose-500/10' },
      ]
    },
    {
      title: 'Planificación',
      items: [
        { id: 'calendar', label: 'Calendario', icon: Calendar },
        { id: 'meetings', label: 'Reuniones', icon: Users },
        { id: 'renewals', label: 'Renovaciones', icon: RefreshCw, badge: upcomingRenewalsCount, badgeColor: 'text-amber-400 bg-amber-500/10' },
      ]
    },
    {
      title: 'Conocimiento',
      items: [
        { id: 'documents', label: 'Documentación', icon: FileText },
        { id: 'assets', label: 'Inventario Activos', icon: Server },
        { id: 'files', label: 'Archivos', icon: FolderArchive },
      ]
    },
    {
      title: 'Administración',
      items: [
        { id: 'audit', label: 'Auditoría', icon: History }
      ]
    }
  ];

  const SidebarContent = () => (
    <>
      {/* Header / Brand */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border-subtle shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-raised border border-border-subtle text-cyan-400 shrink-0">
          <Server className="w-4 h-4" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-semibold text-sm text-content-primary flex items-center gap-1.5 truncate">
              PORTAL IT <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-content-muted font-mono">v2.6</span>
            </h1>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <p className="px-2 mb-2 text-[10px] font-bold text-content-muted uppercase tracking-wider">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const badgeClasses = item.badgeColor || 'text-cyan-400 bg-cyan-500/10';
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-surface-raised text-cyan-400 border border-border-subtle'
                      : 'text-content-secondary hover:bg-surface hover:text-content-primary border border-transparent'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-content-muted group-hover:text-content-primary transition-colors'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${badgeClasses}`}>
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge !== undefined && item.badge > 0 && (
                    <div className="absolute right-2 w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / User Switcher */}
      <div className="p-4 border-t border-border-subtle bg-canvas shrink-0">
        {!collapsed && (
          <div className="mb-3 flex items-center justify-between text-xs text-content-muted font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Rol Activo
            </span>
            <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-content-primary">
              {currentUser.role}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <img
            src={currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={currentUser.displayName}
            className="w-8 h-8 rounded-full border border-border-subtle object-cover shrink-0"
          />
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-content-primary truncate">{currentUser.displayName}</p>
              <p className="text-[11px] text-content-muted truncate">{currentUser.title}</p>
            </div>
          )}
        </div>

        {/* Quick Role Switcher Button */}
        {!collapsed && (
          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
            <div className="flex gap-1 w-full">
              <button
                onClick={() => switchUser('admin')}
                className={`flex-1 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  isAdmin 
                    ? 'bg-surface-raised border-border-active text-cyan-400' 
                    : 'bg-transparent border-transparent text-content-muted hover:text-content-primary hover:bg-surface'
                }`}
                title="Cambiar a Jefe de Sistemas (Admin)"
              >
                Admin
              </button>
              <button
                onClick={() => switchUser('analyst')}
                className={`flex-1 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  !isAdmin 
                    ? 'bg-surface-raised border-border-active text-cyan-400' 
                    : 'bg-transparent border-transparent text-content-muted hover:text-content-primary hover:bg-surface'
                }`}
                title="Cambiar a Analista IT (Operativo)"
              >
                Analista
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Header (visible only on small screens) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border-subtle bg-surface">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-cyan-400" />
          <h1 className="font-semibold text-sm text-content-primary">PORTAL IT</h1>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-1 text-content-secondary hover:text-content-primary">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div className="fixed inset-0 bg-canvas/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[80vw] h-full flex flex-col bg-surface border-r border-border-subtle shadow-2xl animate-in slide-in-from-left-full duration-200">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-content-muted hover:text-content-primary hover:bg-surface-raised"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex relative flex-col justify-between border-r border-border-subtle bg-surface/40 backdrop-blur-xl transition-all duration-300 z-30 shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 p-1 rounded-full border border-border-subtle bg-surface text-content-muted hover:text-content-primary shadow-sm transition-all z-40"
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
        <SidebarContent />
      </aside>
    </>
  );
};
