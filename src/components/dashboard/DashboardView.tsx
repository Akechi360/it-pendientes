import React from 'react';
import {
  CheckSquare,
  LifeBuoy,
  FolderKanban,
  RefreshCw,
  Clock,
  AlertOctagon,
  Sparkles,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Calendar as CalendarIcon,
  Activity,
  CheckCircle2,
  TrendingUp,
  Server
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const DashboardView: React.FC = () => {
  const {
    tasks,
    projects,
    incidents,
    meetings,
    renewals,
    activityLogs,
    setActiveTab,
    setSelectedTask,
    setSelectedIncident,
    setSelectedProject,
    openQuickCreate,
    isDarkTheme
  } = useApp();
  const { currentUser } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];

  // Stats Calculations
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr && t.status !== 'completada' && t.status !== 'cancelada');
  const overdueTasks = tasks.filter((t) => t.dueDate < todayStr && t.status !== 'completada' && t.status !== 'cancelada');
  const focusedTasks = tasks.filter((t) => t.isFocused && t.status !== 'completada' && t.status !== 'cancelada');
  
  const openIncidents = incidents.filter((i) => i.status !== 'resuelta' && i.status !== 'cerrada' && i.status !== 'cancelada');
  const criticalIncidents = openIncidents.filter((i) => i.priority === 'critica' || i.priority === 'alta');
  
  const activeProjects = projects.filter((p) => p.status === 'activo' || p.status === 'planificacion');
  const avgProjectProgress = activeProjects.length > 0
    ? Math.round(activeProjects.reduce((acc, p) => acc + p.progress, 0) / activeProjects.length)
    : 0;

  const urgentRenewals = renewals.filter((r) => r.status === 'proximo_a_renovar' || r.status === 'vencido');

  // Chart Data Preparation
  const taskStatusData = [
    { name: 'Pendiente', value: tasks.filter((t) => t.status === 'pendiente').length, color: '#3b82f6' },
    { name: 'En Progreso', value: tasks.filter((t) => t.status === 'en_progreso').length, color: '#06b6d4' },
    { name: 'Bloqueada', value: tasks.filter((t) => t.status === 'bloqueada').length, color: '#f59e0b' },
    { name: 'Completada', value: tasks.filter((t) => t.status === 'completada').length, color: '#10b981' }
  ];

  const categoryDistributionData = [
    { name: 'Seguridad', count: tasks.filter((t) => t.category === 'seguridad').length },
    { name: 'Soporte', count: tasks.filter((t) => t.category === 'soporte').length },
    { name: 'Redes', count: tasks.filter((t) => t.category === 'redes').length },
    { name: 'Infraestructura', count: tasks.filter((t) => t.category === 'infraestructura').length },
    { name: 'Base Datos', count: tasks.filter((t) => t.category === 'base_de_datos').length }
  ];

  const COLORS = ['#06b6d4', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-300">
      {/* Header Greeting & Quick Actions Bar */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isDarkTheme
          ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-slate-800'
          : 'bg-gradient-to-r from-white via-slate-50 to-cyan-50/50 border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3" /> Panel General IT
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              ¡Hola, {currentUser.displayName}! 👋
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Aquí está el resumen del estado operativo de los servicios e infraestructura tecnológica.
            </p>
          </div>

          {/* Quick Create Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openQuickCreate('task')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Tarea
            </button>
            <button
              onClick={() => openQuickCreate('incident')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all"
            >
              <LifeBuoy className="w-4 h-4" /> Incidencia
            </button>
            <button
              onClick={() => openQuickCreate('meeting')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <CalendarIcon className="w-4 h-4 text-purple-400" /> Reunión
            </button>
            <button
              onClick={() => openQuickCreate('project')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <FolderKanban className="w-4 h-4 text-emerald-400" /> Proyecto
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today & Overdue Tasks */}
        <div
          onClick={() => setActiveTab('tasks')}
          className={`p-5 rounded-2xl border cursor-pointer hover:border-cyan-500/50 transition-all shadow-sm ${
            isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Pendientes de Hoy</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{todayTasks.length}</span>
            {overdueTasks.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <AlertOctagon className="w-3 h-3" /> {overdueTasks.length} vencidas
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> Próximas a vencer en 24h
          </p>
        </div>

        {/* Card 2: Open Incidents */}
        <div
          onClick={() => setActiveTab('incidents')}
          className={`p-5 rounded-2xl border cursor-pointer hover:border-amber-500/50 transition-all shadow-sm ${
            isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Incidencias Abiertas</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <LifeBuoy className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{openIncidents.length}</span>
            {criticalIncidents.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {criticalIncidents.length} críticas
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Monitoreo de SLA activo
          </p>
        </div>

        {/* Card 3: Active Projects Progress */}
        <div
          onClick={() => setActiveTab('projects')}
          className={`p-5 rounded-2xl border cursor-pointer hover:border-emerald-500/50 transition-all shadow-sm ${
            isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Proyectos Activos</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{activeProjects.length}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              {avgProjectProgress}% avance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> En tiempo programado
          </p>
        </div>

        {/* Card 4: Upcoming Renewals */}
        <div
          onClick={() => setActiveTab('renewals')}
          className={`p-5 rounded-2xl border cursor-pointer hover:border-purple-500/50 transition-all shadow-sm ${
            isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Próximas Renovaciones</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{renewals.length}</span>
            {urgentRenewals.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                {urgentRenewals.length} de atención
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-purple-400" /> Dominios, SSL y Licencias
          </p>
        </div>
      </div>

      {/* Main Grid: Focus Widget & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget "En Foco Hoy" (2 Columns) */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${
          isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">En Foco Hoy (Prioridad Clave)</h2>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Ver todas ({tasks.length}) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {focusedTasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No hay tareas marcadas en foco para hoy.</p>
            ) : (
              focusedTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer hover:border-cyan-500/40 ${
                    isDarkTheme ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-cyan-400 font-bold">{task.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase font-mono ${
                        task.priority === 'critica' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        task.priority === 'alta' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" /> {task.dueDate}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 mb-1">{task.title}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/50">
                    <span>Responsable: <strong className="text-slate-200">{task.assigneeName}</strong></span>
                    <span className="font-mono text-slate-300">{task.checklist?.filter((c) => c.completed).length || 0}/{task.checklist?.length || 0} subtareas</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Task Status Pie Chart */}
        <div className={`p-6 rounded-2xl border ${
          isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h2 className="text-base font-bold text-white mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Distribución de Tareas
          </h2>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-800 text-xs">
            {taskStatusData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                <span className="text-slate-400 truncate">{d.name}:</span>
                <strong className="text-slate-200 font-mono">{d.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Recent Activity & Renewals Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audit Activity */}
        <div className={`p-6 rounded-2xl border ${
          isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Bitácora de Operaciones Recientes
            </h2>
            <button
              onClick={() => setActiveTab('audit')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Ver auditoría completa
            </button>
          </div>
          <div className="space-y-3">
            {activityLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-slate-200 font-semibold">{log.actorName}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-400 truncate">{log.action}: <span className="text-slate-300">{log.entityTitle}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Work Distribution Bar Chart */}
        <div className={`p-6 rounded-2xl border ${
          isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h2 className="text-base font-bold text-white mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" /> Carga de Trabajo por Categoría
          </h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistributionData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
