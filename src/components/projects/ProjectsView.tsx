import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

import { EntityPageHeader } from '../shared/EntityPageHeader';
import { StatusBadge } from '../shared/StatusBadge';
import { AssigneeAvatar } from '../shared/AssigneeAvatar';

export const ProjectsView: React.FC = () => {
  const { projects, openQuickCreate, setSelectedProject } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <EntityPageHeader 
        icon={<FolderKanban className="w-5 h-5" />}
        title="Proyectos de Infraestructura & Desarrollo"
        description="Gestión de iniciativas estratégicas, migraciones, proyectos de redes y ciberseguridad."
        actionLabel="Nuevo Proyecto"
        onAction={() => openQuickCreate('project')}
      />

      {/* Filter Bar */}
      <div className="p-3 lg:p-4 rounded-xl border border-border-subtle bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-content-muted absolute left-3 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar proyectos por nombre o ID..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* TABLE VIEW */}
      <div className="rounded-xl border border-border-subtle overflow-hidden bg-surface shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-surface-raised text-content-muted font-mono text-[10px] uppercase border-b border-border-subtle">
              <tr>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">ID / Proyecto</th>
                <th className="px-4 py-3 font-semibold">Líder</th>
                <th className="px-4 py-3 font-semibold w-48">Progreso</th>
                <th className="px-4 py-3 font-semibold">Fecha Objetivo</th>
                <th className="px-4 py-3 font-semibold">Riesgos / Bloqueos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-content-secondary">
              {filteredProjects.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10">No hay proyectos</td></tr>
              ) : (
                filteredProjects.map((project) => {
                  
                  const targetDatePassed = project.targetDate && project.targetDate < new Date().toISOString().split('T')[0] && project.progress < 100;
                  
                  return (
                    <tr
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className="hover:bg-surface-hover cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-4 py-3 max-w-xs xl:max-w-md truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-400">{project.id}</span>
                          <span className="text-content-primary font-medium group-hover:text-emerald-300 transition-colors">{project.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <AssigneeAvatar name={project.leadName} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 rounded-full bg-surface-raised overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${project.progress >= 100 ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] w-8 text-right">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono text-[11px] ${targetDatePassed ? 'text-rose-400 font-bold' : 'text-content-secondary'}`}>
                          {project.targetDate || 'Sin fecha'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {project.risks ? (
                          <div className="flex items-center gap-1.5 text-rose-400 max-w-[150px] truncate" title={project.risks}>
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{project.risks}</span>
                          </div>
                        ) : (
                          <span className="text-content-muted text-[11px] italic">Ninguno</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
