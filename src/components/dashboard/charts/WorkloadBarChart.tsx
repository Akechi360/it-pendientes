import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../../context/AppContext';

export const WorkloadBarChart: React.FC = () => {
  const { tasks, incidents } = useApp();

  const data = useMemo(() => {
    const workload: Record<string, { name: string; tasks: number; incidents: number }> = {};

    const activeTasks = tasks.filter(t => t.status !== 'completada' && t.status !== 'cancelada');
    activeTasks.forEach(t => {
      const assignee = t.assigneeName || 'Sin Asignar';
      if (!workload[assignee]) workload[assignee] = { name: assignee, tasks: 0, incidents: 0 };
      workload[assignee].tasks++;
    });

    const activeIncidents = incidents.filter(i => i.status !== 'resuelta' && i.status !== 'cerrada' && i.status !== 'cancelada');
    activeIncidents.forEach(i => {
      const assignee = i.assigneeName || 'Sin Asignar';
      if (!workload[assignee]) workload[assignee] = { name: assignee, tasks: 0, incidents: 0 };
      workload[assignee].incidents++;
    });

    return Object.values(workload).sort((a, b) => (b.tasks + b.incidents) - (a.tasks + a.incidents)).slice(0, 5); // Top 5
  }, [tasks, incidents]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-content-muted text-sm border border-dashed border-border-subtle rounded-xl">
        No hay carga de trabajo
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={100} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc' }}
            itemStyle={{ color: '#f8fafc' }}
            cursor={{ fill: '#0f172a' }}
          />
          <Bar dataKey="tasks" name="Tareas" stackId="a" fill="#06b6d4" radius={[0, 0, 0, 0]} />
          <Bar dataKey="incidents" name="Incidencias" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
