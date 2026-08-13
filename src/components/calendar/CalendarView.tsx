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

export const CalendarView: React.FC = () => {
  const { tasks, meetings, renewals, openQuickCreate, setSelectedTask, isDarkTheme } = useApp();
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-purple-400" /> Calendario Central de IT
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Programación de vencimientos, reuniones, mantenimientos y ventanas de despliegue.
          </p>
        </div>

        <button
          onClick={() => openQuickCreate('meeting')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Programar Evento / Reunión
        </button>
      </div>

      {/* Month Navigator */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between ${
        isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <h2 className="text-lg font-bold text-white font-mono">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/80">
        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center font-mono text-xs font-bold text-slate-400 border-b border-slate-800 bg-slate-950 py-3">
          <span>Dom</span>
          <span>Lun</span>
          <span>Mar</span>
          <span>Mié</span>
          <span>Jue</span>
          <span>Vie</span>
          <span>Sáb</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/60 min-h-[500px]">
          {paddingDays.map((p) => (
            <div key={`pad-${p}`} className="p-2 bg-slate-950/20 opacity-30 min-h-[90px]"></div>
          ))}

          {days.map((day) => {
            const formattedDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasks.filter((t) => t.dueDate === formattedDayStr);
            const dayMeetings = meetings.filter((m) => m.startTime.startsWith(formattedDayStr));
            const dayRenewals = renewals.filter((r) => r.renewalDate === formattedDayStr);

            const isToday = formattedDayStr === new Date().toISOString().split('T')[0];

            return (
              <div
                key={day}
                className={`p-2 min-h-[90px] flex flex-col justify-start transition-all hover:bg-slate-800/30 ${
                  isToday ? 'bg-cyan-500/10 border-cyan-500/40' : ''
                }`}
              >
                <span className={`text-xs font-mono font-bold self-end mb-1 px-1.5 py-0.5 rounded ${
                  isToday ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                }`}>
                  {day}
                </span>

                <div className="space-y-1 overflow-y-auto max-h-20 custom-scrollbar">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTask(t)}
                      className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] truncate cursor-pointer font-medium"
                      title={t.title}
                    >
                      • {t.title}
                    </div>
                  ))}

                  {dayMeetings.map((m) => (
                    <div
                      key={m.id}
                      className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] truncate cursor-pointer font-medium"
                      title={m.title}
                    >
                      👥 {m.title}
                    </div>
                  ))}

                  {dayRenewals.map((r) => (
                    <div
                      key={r.id}
                      className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] truncate cursor-pointer font-medium"
                      title={r.title}
                    >
                      ⚡ Renovación: {r.title}
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
