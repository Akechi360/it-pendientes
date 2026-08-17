import React from 'react';
import { FolderKanban, TrendingUp } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { DashboardEmptyState } from './DashboardEmptyState';

export const ProjectStatusWidget: React.FC = () => {
  const { projects, setSelectedProject, setActiveTab } = useApp();

  const activeProjects = projects.filter((p) => p.status === 'activo' || p.status === 'planificacion');
  
  // Sort by closest targetDate
  activeProjects.sort((a, b) => (a.targetDate || '9999').localeCompare(b.targetDate || '9999'));
  const topProjects = activeProjects.slice(0, 3);

  if (topProjects.length === 0) {
    return <DashboardEmptyState icon={<FolderKanban />} title="Sin Proyectos" message="No hay proyectos activos en este momento." />;
  }

  return (
    <div className="space-y-3 mt-2">
      {topProjects.map((project) => (
        <div 
          key={project.id}
          onClick={() => {
            setSelectedProject(project);
            setActiveTab('projects');
          }}
          className="p-3 rounded-xl bg-canvas border border-border-subtle hover:border-cyan-500/40 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-content-primary truncate">{project.name}</h4>
            <span className="text-[10px] font-mono text-content-muted px-1.5 py-0.5 rounded bg-surface-raised">{project.status}</span>
          </div>
          <div className="w-full h-1.5 bg-surface-raised rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full rounded-full ${project.progress >= 100 ? 'bg-emerald-400' : 'bg-cyan-400'}`} 
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-content-secondary">
            <span>{project.progress}% Completado</span>
            {project.targetDate && <span>Límite: {project.targetDate}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};
