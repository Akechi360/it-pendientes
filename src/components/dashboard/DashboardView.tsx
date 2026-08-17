import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { OperationalAlert } from './widgets/OperationalAlert';
import { MetricInline } from './widgets/MetricInline';
import { PriorityQueue } from './widgets/PriorityQueue';
import { AgendaWidget } from './widgets/AgendaWidget';
import { IncidentHealthWidget } from './widgets/IncidentHealthWidget';
import { ProjectStatusWidget } from './widgets/ProjectStatusWidget';
import { ActivityFeed } from './widgets/ActivityFeed';
import { RenewalRiskWidget } from './widgets/RenewalRiskWidget';
import { DashboardSection } from './widgets/DashboardSection';

import { 
  CheckSquare, 
  LifeBuoy, 
  FolderKanban, 
  RefreshCw, 
  Calendar,
  Activity,
  History
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
    <div className="space-y-6 pb-10 animate-in fade-in duration-300">
      
      {/* 
        A. Cabecera Operacional Compacta
        Saludo, fecha y OperationalAlert basado en datos reales
      */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-content-primary tracking-tight">
              Buenos días, {currentUser.displayName.split(' ')[0]}
            </h1>
            <p className="text-sm text-content-secondary mt-1 capitalize">{todayStr}</p>
          </div>
        </div>
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
          onClick={() => setActiveTab('tasks')}
        />
        <MetricInline 
          label="Incidencias Abiertas" 
          value={openIncidents.length} 
          icon={<LifeBuoy className="w-5 h-5" />} 
          colorClass="text-amber-400 border-amber-500/20"
          onClick={() => setActiveTab('incidents')}
        />
        <MetricInline 
          label="Proyectos Activos" 
          value={activeProjects.length} 
          icon={<FolderKanban className="w-5 h-5" />} 
          colorClass="text-emerald-400 border-emerald-500/20"
          onClick={() => setActiveTab('projects')}
        />
        <MetricInline 
          label="Renovaciones Riesgo" 
          value={upcomingRenewals.length} 
          icon={<RefreshCw className="w-5 h-5" />} 
          colorClass="text-violet-400 border-violet-500/20"
          onClick={() => setActiveTab('renewals')}
        />
      </div>

      {/* 
        C. Primera Fila: Prioridad Operativa y Agenda
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardSection 
            title="Prioridad Operativa" 
            icon={<CheckSquare className="w-4 h-4" />}
          >
            <PriorityQueue />
          </DashboardSection>
        </div>
        <div>
          <DashboardSection 
            title="Agenda de Hoy" 
            icon={<Calendar className="w-4 h-4" />}
            actionText="Ver Calendario"
            onAction={() => setActiveTab('calendar')}
          >
            <AgendaWidget />
          </DashboardSection>
        </div>
      </div>

      {/* 
        D. Segunda Fila: Incidencias y Proyectos
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSection 
          title="Salud de Incidencias" 
          icon={<Activity className="w-4 h-4" />}
          actionText="Ver Incidencias"
          onAction={() => setActiveTab('incidents')}
        >
          <IncidentHealthWidget />
        </DashboardSection>

        <DashboardSection 
          title="Progreso de Proyectos" 
          icon={<FolderKanban className="w-4 h-4" />}
          actionText="Ver Proyectos"
          onAction={() => setActiveTab('projects')}
        >
          <ProjectStatusWidget />
        </DashboardSection>
      </div>

      {/* 
        E. Tercera Fila: Actividad Reciente y Renovaciones
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSection 
          title="Actividad Reciente" 
          icon={<History className="w-4 h-4" />}
          actionText="Ver Bitácora"
          onAction={() => setActiveTab('audit')}
        >
          <ActivityFeed />
        </DashboardSection>

        <DashboardSection 
          title="Riesgo de Renovación" 
          icon={<RefreshCw className="w-4 h-4" />}
          actionText="Ver Renovaciones"
          onAction={() => setActiveTab('renewals')}
        >
          <RenewalRiskWidget />
        </DashboardSection>
      </div>
    </div>
  );
};
