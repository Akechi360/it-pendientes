import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../../context/AppContext';

export const IncidentTrendArea: React.FC = () => {
  const { incidents } = useApp();

  const data = useMemo(() => {
    // Generar últimos 7 días
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    const counts: Record<string, { date: string; criticas: number; normales: number }> = {};
    days.forEach(d => {
      counts[d] = { date: d.substring(5), criticas: 0, normales: 0 }; // MM-DD
    });

    incidents.forEach(inc => {
      const dateStr = inc.createdAt.split('T')[0];
      if (counts[dateStr]) {
        if (inc.priority === 'critica' || inc.priority === 'alta') {
          counts[dateStr].criticas++;
        } else {
          counts[dateStr].normales++;
        }
      }
    });

    return Object.values(counts);
  }, [incidents]);

  if (incidents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-content-muted text-sm border border-dashed border-border-subtle rounded-xl">
        No hay incidencias en los últimos 7 días
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCriticas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorNormales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Area type="monotone" dataKey="criticas" name="Alta/Crítica" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorCriticas)" />
          <Area type="monotone" dataKey="normales" name="Normal" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorNormales)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
