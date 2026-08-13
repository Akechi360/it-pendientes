import React, { useState } from 'react';
import {
  CheckSquare,
  List,
  Kanban,
  Calendar as CalendarIcon,
  Table as TableIcon,
  Plus,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  Lock,
  Star,
  CheckCircle2,
  ChevronRight,
  User,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskItem, TaskStatus, PriorityLevel } from '../../types';
import { TaskDetailModal } from './TaskDetailModal';

export const TasksView: React.FC = () => {
  const { tasks, openQuickCreate, setSelectedTask, isDarkTheme } = useApp();

  const [viewMode, setViewMode] = useState<'lista' | 'kanban' | 'tabla' | 'hoy' | 'vencidas' | 'mis_tareas'>('lista');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('todas');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'todas' || task.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'todas' || task.category === selectedCategory;

    if (!matchesSearch || !matchesPriority || !matchesCategory) return false;

    if (viewMode === 'hoy') return task.dueDate === todayStr;
    if (viewMode === 'vencidas') return task.dueDate < todayStr && task.status !== 'completada' && task.status !== 'cancelada';

    return true;
  });

  const kanbanColumns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'pendiente', label: 'Pendiente', color: 'border-blue-500' },
    { id: 'en_progreso', label: 'En Progreso', color: 'border-cyan-500' },
    { id: 'bloqueada', label: 'Bloqueada', color: 'border-amber-500' },
    { id: 'en_revision', label: 'En Revisión', color: 'border-purple-500' },
    { id: 'completada', label: 'Completada', color: 'border-emerald-500' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <TaskDetailModal />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-cyan-400" /> Tareas & Pendientes
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión completa de actividades diarias, semanales, recurrentes y focales del departamento.
          </p>
        </div>

        <button
          onClick={() => openQuickCreate('task')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Crear Nueva Tarea
        </button>
      </div>

      {/* Filter and View Toggles Bar */}
      <div className={`p-4 rounded-2xl border space-y-3 ${
        isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* View Modes Selector */}
          <div className="flex flex-wrap gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('lista')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'lista' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Lista
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('tabla')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'tabla' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" /> Tabla
            </button>
            <button
              onClick={() => setViewMode('hoy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'hoy' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Hoy
            </button>
            <button
              onClick={() => setViewMode('vencidas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'vencidas' ? 'bg-rose-500 text-white font-bold' : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Vencidas
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por título o ID..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Priority & Category Selectors */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Prioridad:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
            >
              <option value="todas">Todas</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Categoría:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 capitalize"
            >
              <option value="todas">Todas</option>
              <option value="soporte">Soporte</option>
              <option value="infraestructura">Infraestructura</option>
              <option value="redes">Redes</option>
              <option value="desarrollo">Desarrollo</option>
              <option value="seguridad">Seguridad</option>
              <option value="base_de_datos">Base de Datos</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW: LIST MODE */}
      {viewMode === 'lista' || viewMode === 'hoy' || viewMode === 'vencidas' ? (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
              <p className="text-sm text-slate-500">No se encontraron tareas con los filtros seleccionados.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:border-cyan-500/50 ${
                  isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {task.id}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase font-mono ${
                      task.priority === 'critica' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      task.priority === 'alta' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize font-mono">
                      {task.category}
                    </span>
                    {task.isBlocked && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 font-mono">
                        <Lock className="w-3 h-3" /> Bloqueada
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> Vence: {task.dueDate}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-1.5">{task.title}</h3>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" /> Assignee: <strong className="text-slate-200">{task.assigneeName}</strong>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-slate-400">
                      Subtareas: {task.checklist?.filter((c) => c.completed).length || 0}/{task.checklist?.length || 0}
                    </span>
                    <span className="text-cyan-400 font-semibold flex items-center gap-1">
                      Detalles <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {/* VIEW: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col h-full min-w-[240px]">
                <div className={`flex items-center justify-between pb-2 mb-3 border-b-2 ${col.color}`}>
                  <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wider font-mono">{col.label}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">{colTasks.length}</span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                  {colTasks.length === 0 ? (
                    <p className="text-[11px] text-slate-500 text-center py-6">Sin tareas</p>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all shadow-sm space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-cyan-400">{task.id}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase font-mono ${
                            task.priority === 'critica' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-200 leading-snug line-clamp-2">{task.title}</h4>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          <span>{task.assigneeName.split(' ')[0]}</span>
                          <span className="font-mono">{task.dueDate}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: TABLE MODE */}
      {viewMode === 'tabla' && (
        <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Título</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Prioridad</th>
                <th className="p-3">Responsable</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Fecha Límite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-mono font-bold text-cyan-400">{task.id}</td>
                  <td className="p-3 font-semibold text-slate-100">{task.title}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      task.priority === 'critica' ? 'text-rose-400' : 'text-blue-400'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-3">{task.assigneeName}</td>
                  <td className="p-3 capitalize">{task.category}</td>
                  <td className="p-3 font-mono">{task.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
