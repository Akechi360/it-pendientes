import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckSquare,
  Users,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EntityPageHeader } from '../shared/EntityPageHeader';

export const CalendarView: React.FC = () => {
  const { tasks, meetings, renewals, setIsCreateMeetingOpen, setSelectedTask } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      <EntityPageHeader 
        icon={<CalendarIcon className="w-5 h-5" />}
        title="Calendario Central de IT"
        description="Programación de vencimientos, reuniones, mantenimientos y ventanas de despliegue."
        actionLabel="Programar Evento"
        onAction={() => setIsCreateMeetingOpen(true)}
      />

      {/* Month Navigator */}
      <div className="p-3 lg:p-4 rounded-xl border border-border-subtle bg-surface flex items-center justify-between">
        <h2 className="text-lg font-bold text-content-primary font-mono tracking-tight">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg bg-surface-raised border border-border-subtle hover:bg-surface-hover text-content-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg bg-surface-raised border border-border-subtle hover:bg-surface-hover text-content-primary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border border-border-subtle overflow-hidden bg-surface shadow-sm">
        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center font-mono text-[10px] uppercase font-bold text-content-muted border-b border-border-subtle bg-surface-raised py-3">
          <span>Dom</span>
          <span>Lun</span>
          <span>Mar</span>
          <span>Mié</span>
          <span>Jue</span>
          <span>Vie</span>
          <span>Sáb</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr min-h-[600px]">
          {paddingDays.map((p) => (
            <div key={`pad-${p}`} className="p-2 bg-canvas border-r border-b border-border-subtle opacity-50 min-h-[100px]"></div>
          ))}

          {days.map((day, idx) => {
            const formattedDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasks.filter((t) => t.dueDate === formattedDayStr && t.status !== 'completada' && t.status !== 'cancelada');
            const dayMeetings = meetings.filter((m) => m.startTime.startsWith(formattedDayStr));
            const dayRenewals = renewals.filter((r) => r.renewalDate === formattedDayStr);

            const isToday = formattedDayStr === new Date().toISOString().split('T')[0];

            // Fix border logic for last items in row/col
            const isLastCol = (idx + firstDayIndex + 1) % 7 === 0;

            return (
              <div
                key={day}
                className={`p-2 min-h-[100px] flex flex-col justify-start transition-all hover:bg-surface-hover border-b border-border-subtle ${!isLastCol ? 'border-r' : ''} ${
                  isToday ? 'bg-cyan-500/5' : 'bg-surface'
                }`}
              >
                <span className={`text-[11px] font-mono font-bold self-end mb-1.5 px-1.5 py-0.5 rounded-sm ${
                  isToday ? 'bg-cyan-400 text-slate-950' : 'text-content-secondary'
                }`}>
                  {day}
                </span>

                <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1">
                  {dayMeetings.map((m) => {
                    const time = new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div
                        key={m.id}
                        className="px-1.5 py-1 rounded bg-surface-raised border-l-2 border-l-violet-400 text-content-primary text-[10px] leading-tight cursor-pointer font-medium hover:bg-violet-500/10 transition-colors"
                        title={m.title}
                      >
                        <span className="font-mono text-content-muted mr-1">{time}</span> 
                        {m.title}
                      </div>
                    )
                  })}

                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTask(t)}
                      className="px-1.5 py-1 rounded bg-surface-raised border-l-2 border-l-blue-400 text-content-primary text-[10px] leading-tight cursor-pointer font-medium hover:bg-blue-500/10 transition-colors"
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))}

                  {dayRenewals.map((r) => (
                    <div
                      key={r.id}
                      className="px-1.5 py-1 rounded bg-surface-raised border-l-2 border-l-amber-400 text-content-primary text-[10px] leading-tight cursor-pointer font-medium hover:bg-amber-500/10 transition-colors"
                      title={r.title}
                    >
                      <span className="font-bold">Renovación:</span> {r.vendor}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
