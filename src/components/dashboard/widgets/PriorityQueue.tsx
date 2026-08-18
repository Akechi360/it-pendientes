import React from 'react';
import { useApp } from '../../../context/AppContext';
import { CheckSquare, LifeBuoy, Clock } from 'lucide-react';
import { DashboardEmptyState } from './DashboardEmptyState';
import { TaskItem, IncidentItem } from '../../../types';

type QueueItem = {
  id: string;
  type: 'task' | 'incident';
  title: string;
  priority: string;
  assignee: string;
  dueDateStr: string | null;
  raw: TaskItem | IncidentItem;
  sortScore: number;
};

export const PriorityQueue: React.FC = () => {
  const { tasks, incidents, setSelectedTask, setSelectedIncident, setActiveTab } = useApp();

  // Normalize Tasks
  const activeTasks = tasks.filter(t => t.status !== 'completada' && t.status !== 'cancelada');
  // Normalize Incidents
  const openIncidents = incidents.filter(i => i.status !== 'resuelta' && i.status !== 'cerrada' && i.status !== 'cancelada');

  const getPriorityScore = (p: string) => {
    if (p === 'critica') return 4;
    if (p === 'alta') return 3;
    if (p === 'media') return 2;
    return 1;
  };

  const queue: QueueItem[] = [
    ...activeTasks.map(t => ({
      id: t.id,
      type: 'task' as const,
      title: t.title,
      priority: t.priority,
      assignee: t.assigneeName || 'Sin asignar',
      dueDateStr: t.dueDate || null,
      raw: t,
      sortScore: getPriorityScore(t.priority) + (t.isFocused ? 2 : 0)
    })),
    ...openIncidents.map(i => ({
      id: i.id,
      type: 'incident' as const,
      title: i.title,
      priority: i.priority,
      assignee: i.assigneeName || 'Sin asignar',
      dueDateStr: i.slaDueDate || null,
      raw: i,
      sortScore: getPriorityScore(i.priority) + 1 // Incidents slightly higher baseline
    }))
  ];

  // Sort by priority score (descending)
  queue.sort((a, b) => b.sortScore - a.sortScore);
  const topQueue = queue.slice(0, 5);

  if (topQueue.length === 0) {
    return <DashboardEmptyState icon={<CheckSquare />} title="Bandeja limpia" message="No hay tareas ni incidencias pendientes." />;
  }

  const handleItemClick = (item: QueueItem) => {
    if (item.type === 'task') {
      setSelectedTask(item.raw as TaskItem);
    } else {
      setSelectedIncident(item.raw as IncidentItem);
    }
  };

  return (
    <div className="space-y-2 mt-1">
      {topQueue.map((item) => (
        <div 
          key={`${item.type}-${item.id}`}
          onClick={() => handleItemClick(item)}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-canvas border border-border-subtle hover:border-cyan-500/40 cursor-pointer transition-colors gap-3"
        >
          <div className="flex items-start gap-3 overflow-hidden">
            <div className={`p-1.5 rounded-md mt-0.5 shrink-0 ${
              item.type === 'task' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
            }`}>
              {item.type === 'task' ? <CheckSquare className="w-4 h-4" /> : <LifeBuoy className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-[10px] text-content-muted">{item.id}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  item.priority === 'critica' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  item.priority === 'alta' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-surface-raised border border-border-subtle text-content-secondary'
                }`}>
                  {item.priority}
                </span>
              </div>
              <h3 className="text-xs font-semibold text-content-primary truncate">{item.title}</h3>
            </div>
          </div>
          <div className="flex items-center sm:justify-end gap-3 sm:gap-4 shrink-0 text-[11px] text-content-muted ml-9 sm:ml-0">
            <span className="truncate max-w-[100px]">{item.assignee}</span>
            {item.dueDateStr && (
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                {item.dueDateStr}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
