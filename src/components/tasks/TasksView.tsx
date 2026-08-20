import React, { useState } from 'react';
import {
  CheckSquare,
  List,
  Kanban,
  Table as TableIcon,
  Search,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { TaskDetailModal } from './TaskDetailModal';
import { EntityPageHeader } from '../shared/EntityPageHeader';
import { StatusBadge } from '../shared/StatusBadge';
import { PriorityIndicator } from '../shared/PriorityIndicator';
import { DueDateIndicator } from '../shared/DueDateIndicator';
import { AssigneeAvatar } from '../shared/AssigneeAvatar';

export const TasksView: React.FC = () => {
  const { tasks, setIsCreateTaskOpen, setSelectedTask } = useApp();
  const { currentUser } = useAuth();

  const [viewMode, setViewMode] = useState<'lista' | 'kanban' | 'tabla'>('tabla');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('todas');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedAssignee, setSelectedAssignee] = useState<'todos' | 'mis_tareas' | 'companero'>('todos');
  const [showCompleted, setShowCompleted] = useState<boolean>(false);

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'todas' || task.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'todas' || task.category === selectedCategory;
    const matchesStatus = showCompleted ? true : (task.status !== 'completada' && task.status !== 'cancelada');
    const matchesAssignee = selectedAssignee === 'todos' || (selectedAssignee === 'mis_tareas' ? task.assigneeId === currentUser?.uid : task.assigneeId !== currentUser?.uid);

    return matchesSearch && matchesPriority && matchesCategory && matchesStatus && matchesAssignee;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <EntityPageHeader 
        icon={<CheckSquare className="w-5 h-5" />}
        title="Tareas & Pendientes"
        description="Gestión completa de actividades diarias, semanales, recurrentes y focales del departamento."
        actionLabel="Nueva Tarea"
        onAction={() => setIsCreateTaskOpen(true)}
      />

      {/* Filter Bar */}
      <div className="p-3 lg:p-4 rounded-xl border border-border-subtle bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* View Toggles */}
          <div className="flex items-center p-1 rounded-lg bg-surface-raised border border-border-subtle">
            <button
              onClick={() => setViewMode('tabla')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'tabla' ? 'bg-surface text-cyan-400 shadow-sm border border-border-subtle' : 'text-content-muted hover:text-content-primary'}`}
              title="Vista de Tabla"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-surface text-cyan-400 shadow-sm border border-border-subtle' : 'text-content-muted hover:text-content-primary'}`}
              title="Vista Kanban"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('lista')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'lista' ? 'bg-surface text-cyan-400 shadow-sm border border-border-subtle' : 'text-content-muted hover:text-content-primary'}`}
              title="Vista Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="h-8 w-px bg-border-subtle hidden sm:block"></div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-content-muted absolute left-3 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ID o título..."
              className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Assignment Quick Filter Pills */}
          <div className="flex items-center p-1 rounded-lg bg-surface-raised border border-border-subtle text-xs font-medium">
            <button
              onClick={() => setSelectedAssignee('todos')}
              className={`px-2 py-1 rounded-md transition-colors ${selectedAssignee === 'todos' ? 'bg-surface text-cyan-400 border border-border-subtle shadow-xs' : 'text-content-muted hover:text-content-primary'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedAssignee('mis_tareas')}
              className={`px-2 py-1 rounded-md transition-colors ${selectedAssignee === 'mis_tareas' ? 'bg-surface text-cyan-400 border border-border-subtle shadow-xs' : 'text-content-muted hover:text-content-primary'}`}
            >
              Mis Pendientes
            </button>
            <button
              onClick={() => setSelectedAssignee('companero')}
              className={`px-2 py-1 rounded-md transition-colors ${selectedAssignee === 'companero' ? 'bg-surface text-cyan-400 border border-border-subtle shadow-xs' : 'text-content-muted hover:text-content-primary'}`}
            >
              Compañero
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-content-secondary hover:text-content-primary">
            <input type="checkbox" checked={showCompleted} onChange={() => setShowCompleted(!showCompleted)} className="accent-cyan-500 rounded bg-surface border-border-subtle" />
            Mostrar Completadas
          </label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-content-primary focus:outline-none focus:border-cyan-500/50"
          >
            <option value="todas">Todas Prioridades</option>
            <option value="critica">Crítica</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-content-primary capitalize focus:outline-none focus:border-cyan-500/50"
          >
            <option value="todas">Todas Categorías</option>
            <option value="soporte">Soporte</option>
            <option value="infraestructura">Infraestructura</option>
            <option value="redes">Redes</option>
            <option value="desarrollo">Desarrollo</option>
            <option value="seguridad">Seguridad</option>
            <option value="base_de_datos">Base de Datos</option>
          </select>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'tabla' && (
        <div className="rounded-xl border border-border-subtle overflow-hidden bg-surface shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-surface-raised text-content-muted font-mono text-[10px] uppercase border-b border-border-subtle">
                <tr>
                  <th className="px-4 py-3 font-semibold">Prioridad</th>
                  <th className="px-4 py-3 font-semibold">ID / Título</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Responsable</th>
                  <th className="px-4 py-3 font-semibold">Categoría</th>
                  <th className="px-4 py-3 font-semibold">Vencimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-content-secondary">
                {filteredTasks.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10">No hay resultados</td></tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="hover:bg-surface-hover cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <PriorityIndicator priority={task.priority} />
                      </td>
                      <td className="px-4 py-3 max-w-xs xl:max-w-md truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-cyan-400">{task.id}</span>
                          <span className="text-content-primary font-medium group-hover:text-cyan-300 transition-colors">{task.title}</span>
                          {task.isBlocked && <Lock className="w-3 h-3 text-rose-400 shrink-0" title="Bloqueada" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-4 py-3">
                        <AssigneeAvatar name={task.assigneeName} />
                      </td>
                      <td className="px-4 py-3 capitalize text-[11px]">{task.category}</td>
                      <td className="px-4 py-3">
                        <DueDateIndicator date={task.dueDate} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KANBAN VIEW (Compact refactor) */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
          {['pendiente', 'en_progreso', 'bloqueada', 'en_revision', 'completada'].map((statusId) => {
            const colTasks = filteredTasks.filter((t) => t.status === statusId);
            return (
              <div key={statusId} className="w-72 shrink-0 snap-start bg-canvas rounded-xl border border-border-subtle flex flex-col h-[calc(100vh-280px)]">
                <div className="p-3 border-b border-border-subtle bg-surface rounded-t-xl flex items-center justify-between">
                  <h3 className="font-semibold text-xs text-content-primary uppercase tracking-wider">{statusId.replace('_', ' ')}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-raised text-content-muted border border-border-subtle">{colTasks.length}</span>
                </div>
                <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
                  {colTasks.map(task => (
                    <div 
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="p-3 rounded-lg bg-surface border border-border-subtle hover:border-cyan-500/40 cursor-pointer shadow-sm group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <PriorityIndicator priority={task.priority} />
                        {task.isBlocked && <Lock className="w-3 h-3 text-rose-400 shrink-0" />}
                      </div>
                      <p className="text-xs font-semibold text-content-primary leading-tight mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">{task.title}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-border-subtle mt-2">
                        <AssigneeAvatar name={task.assigneeName} />
                        <span className="text-[10px] font-mono font-bold text-cyan-400">{task.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* LIST VIEW (Detailed) */}
      {viewMode === 'lista' && (
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
             <div className="text-center py-10 rounded-xl border border-dashed border-border-subtle bg-surface">No hay resultados</div>
          ) : (
            filteredTasks.map(task => (
              <div 
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border-subtle hover:bg-surface-hover cursor-pointer transition-colors group"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-cyan-400">{task.id}</span>
                    <PriorityIndicator priority={task.priority} />
                    <StatusBadge status={task.status} />
                    {task.isBlocked && <span className="text-[10px] text-rose-400 flex items-center gap-1 font-semibold uppercase"><Lock className="w-3 h-3"/> Bloqueada</span>}
                  </div>
                  <h3 className="text-sm font-semibold text-content-primary group-hover:text-cyan-300 transition-colors">{task.title}</h3>
                </div>
                <div className="flex items-center sm:justify-end gap-6 shrink-0 border-t sm:border-t-0 border-border-subtle pt-3 sm:pt-0">
                  <AssigneeAvatar name={task.assigneeName} />
                  <div className="w-32 text-right">
                    <DueDateIndicator date={task.dueDate} />
                  </div>
                  <ChevronRight className="w-4 h-4 text-content-muted hidden sm:block group-hover:text-cyan-400" />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
