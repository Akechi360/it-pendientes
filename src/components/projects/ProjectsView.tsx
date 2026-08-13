import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  CheckSquare,
  Users,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProjectItem } from '../../types';
import { ProjectDetailModal } from './ProjectDetailModal';

export const ProjectsView: React.FC = () => {
  const { projects, openQuickCreate, setSelectedProject, isDarkTheme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <ProjectDetailModal />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-emerald-400" /> Proyectos de Infraestructura & Desarrollo
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de iniciativas estratégicas, migraciones, proyectos de redes y ciberseguridad.
          </p>
        </div>

        <button
          onClick={() => openQuickCreate('project')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Nuevo Proyecto
        </button>
      </div>

      {/* Search */}
      <div className={`p-4 rounded-2xl border ${isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar proyectos por nombre o ID..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Projects Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className={`p-6 rounded-2xl border transition-all cursor-pointer hover:border-emerald-500/50 space-y-4 shadow-sm ${
              isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                  {project.id}
                </span>
                <h3 className="text-base font-bold text-white mt-2">{project.name}</h3>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full uppercase font-mono font-bold bg-slate-800 text-slate-300">
                {project.status}
              </span>
            </div>

            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{project.description}</p>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Avance
                </span>
                <span className="text-emerald-400 font-mono">{project.progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/60">
              <span>Líder: <strong className="text-slate-200">{project.leadName}</strong></span>
              <span className="font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> Meta: {project.targetDate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
