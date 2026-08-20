import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { OperationalAlert } from './widgets/OperationalAlert';
import { MetricInline } from './widgets/MetricInline';
import { PriorityQueue } from './widgets/PriorityQueue';
import { AgendaWidget } from './widgets/AgendaWidget';
import { ActivityFeed } from './widgets/ActivityFeed';
import { DashboardSection } from './widgets/DashboardSection';

import { TasksStatusChart } from './charts/TasksStatusChart';
import { WorkloadBarChart } from './charts/WorkloadBarChart';
import { IncidentTrendArea } from './charts/IncidentTrendArea';

import { 
  CheckSquare, 
  LifeBuoy, 
  FolderKanban, 
  RefreshCw, 
  Calendar,
  History,
  PieChart,
  BarChart3,
  TrendingUp
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { currentUser } = useAuth();
  const { tasks, incidents, projects, renewals, setActiveTab } = useApp();

  const activeTasks = tasks.filter((t) => t.status !== 'completada' && t.status !== 'cancelada');
  const openIncidents = incidents.filter((i) => i.status !== 'resuelta' && i.status !== 'cerrada' && i.status !== 'cancelada');
  const activeProjects = projects.filter((p) => p.status === 'activo' || p.status === 'planificacion');
  const upcomingRenewals = renewals.filter((r) => r.status === 'proximo_a_renovar' || r.status === 'vencido');

  const todayStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 pb-10">

      {/*
        A. Cabecera Operacional Compacta
      */}
      <div className="flex flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-content-primary tracking-tight">
              Buenos días, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{currentUser?.displayName ? currentUser.displayName.split(' ')[0] : (currentUser?.email ? currentUser.email.split('@')[0] : 'Usuario')}</span>
            </h1>
            <p className="text-sm text-content-secondary mt-1 capitalize">{todayStr}</p>
          </div>
        </motion.div>
        <OperationalAlert />
      </div>

      {/*
        B. Franja de Métricas Compactas
      */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricInline
          label="Tareas Pendientes"
          value={activeTasks.length}
          icon={<CheckSquare className="w-5 h-5" />}
          colorClass="text-cyan-400 border-cyan-500/20"
          glowClass="hover:shadow-cyan-500/10"
          onClick={() => setActiveTab('tasks')}
        />
        <MetricInline
          label="Incidencias Abiertas"
          value={openIncidents.length}
          icon={<LifeBuoy className="w-5 h-5" />}
          colorClass="text-amber-400 border-amber-500/20"
          glowClass="hover:shadow-amber-500/10"
          onClick={() => setActiveTab('incidents')}
        />
        <MetricInline
          label="Proyectos Activos"
          value={activeProjects.length}
          icon={<FolderKanban className="w-5 h-5" />}
          colorClass="text-emerald-400 border-emerald-500/20"
          glowClass="hover:shadow-emerald-500/10"
          onClick={() => setActiveTab('projects')}
        />
        <MetricInline
          label="Renovaciones Riesgo"
          value={upcomingRenewals.length}
          icon={<RefreshCw className="w-5 h-5" />}
          colorClass="text-violet-400 border-violet-500/20"
          glowClass="hover:shadow-violet-500/10"
          onClick={() => setActiveTab('renewals')}
        />
      </div>

      {/* 
        C. Gráficas Analíticas (NUEVO RECHARTS)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardSection title="Distribución de Tareas" icon={<PieChart className="w-4 h-4" />}>
          <TasksStatusChart />
        </DashboardSection>

        <DashboardSection title="Tendencia de Incidencias (7 días)" icon={<TrendingUp className="w-4 h-4" />}>
          <IncidentTrendArea />
        </DashboardSection>

        <DashboardSection title="Carga de Trabajo IT" icon={<BarChart3 className="w-4 h-4" />}>
          <WorkloadBarChart />
        </DashboardSection>
      </div>

      {/* 
        D. Operativa Inmediata (Prioridad, Agenda y Actividad)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DashboardSection 
            title="Agenda de Hoy" 
            icon={<Calendar className="w-4 h-4" />}
            actionText="Ver Calendario"
            onAction={() => setActiveTab('calendar')}
          >
            <AgendaWidget />
          </DashboardSection>
        </div>
        
        <div className="lg:col-span-1">
          <DashboardSection 
            title="Prioridad Operativa" 
            icon={<CheckSquare className="w-4 h-4" />}
          >
            <PriorityQueue />
          </DashboardSection>
        </div>
        
        <div className="lg:col-span-1">
          <DashboardSection 
            title="Actividad Reciente" 
            icon={<History className="w-4 h-4" />}
            actionText="Ver Bitácora"
            onAction={() => setActiveTab('audit')}
          >
            <ActivityFeed />
          </DashboardSection>
        </div>
      </div>

    </div>
  );
};
