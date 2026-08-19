import React from 'react';
import { useApp } from '../../../context/AppContext';
import { CheckSquare, LifeBuoy, Clock } from 'lucide-react';
import { DashboardEmptyState } from './DashboardEmptyState';
import { PriorityIndicator } from '../../shared/PriorityIndicator';
import { AssigneeAvatar } from '../../shared/AssigneeAvatar';
import { TaskItem, IncidentItem, PriorityLevel } from '../../../types';

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

  const accentClass = (priority: string) =>
    priority === 'critica' ? 'bg-rose-500' : priority === 'alta' ? 'bg-amber-500' : 'bg-border-subtle';

  return (
    <div className="space-y-2 mt-1">
      {topQueue.map((item) => (
        <div
          key={`${item.type}-${item.id}`}
          onClick={() => handleItemClick(item)}
          className="relative flex flex-col sm:flex-row sm:items-center justify-between p-3 pl-4 rounded-xl bg-canvas border border-border-subtle hover:border-cyan-500/40 hover:-translate-y-0.5 cursor-pointer transition-all gap-3 overflow-hidden"
        >
          <span className={`absolute left-0 top-0 bottom-0 w-1 ${accentClass(item.priority)}`} />
          <div className="flex items-start gap-3 overflow-hidden">
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg mt-0.5 shrink-0 ${
              item.type === 'task' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
            }`}>
              {item.type === 'task' ? <CheckSquare className="w-4 h-4" /> : <LifeBuoy className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] text-content-muted">{item.id}</span>
                <PriorityIndicator priority={item.priority as PriorityLevel} />
              </div>
              <h3 className="text-xs font-semibold text-content-primary truncate">{item.title}</h3>
            </div>
          </div>
          <div className="flex items-center sm:justify-end gap-3 sm:gap-4 shrink-0 text-[11px] text-content-muted ml-9 sm:ml-0">
            <AssigneeAvatar name={item.assignee} />
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
