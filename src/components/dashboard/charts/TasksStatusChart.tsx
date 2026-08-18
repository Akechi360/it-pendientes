import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../../../context/AppContext';

const COLORS = {
  pendiente: '#94a3b8',
  en_progreso: '#3b82f6',
  en_revision: '#f59e0b',
  bloqueada: '#f43f5e',
  completada: '#10b981',
};

export const TasksStatusChart: React.FC = () => {
  const { tasks } = useApp();

  const data = useMemo(() => {
    const counts = {
      pendiente: 0,
      en_progreso: 0,
      en_revision: 0,
      bloqueada: 0,
      completada: 0,
    };
    tasks.forEach(t => {
      if (counts[t.status as keyof typeof counts] !== undefined) {
        counts[t.status as keyof typeof counts]++;
      }
    });

    return [
      { name: 'Pendientes', value: counts.pendiente, color: COLORS.pendiente },
      { name: 'En Progreso', value: counts.en_progreso, color: COLORS.en_progreso },
      { name: 'En Revisión', value: counts.en_revision, color: COLORS.en_revision },
      { name: 'Bloqueadas', value: counts.bloqueada, color: COLORS.bloqueada },
      { name: 'Completadas', value: counts.completada, color: COLORS.completada },
    ].filter(item => item.value > 0);
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-content-muted text-sm border border-dashed border-border-subtle rounded-xl">
        No hay datos suficientes
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
