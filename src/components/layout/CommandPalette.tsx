import React, { useState } from 'react';
import {
  Search,
  CheckSquare,
  FolderKanban,
  LifeBuoy,
  FileText,
  Server,
  X,
  PlusCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    tasks,
    projects,
    incidents,
    documents,
    assets,
    setActiveTab,
    setSelectedTask,
    setSelectedIncident,
    setSelectedProject,
    setIsCreateTaskOpen,
    setIsCreateIncidentOpen,
    setIsCreateProjectOpen,
    setIsCreateMeetingOpen,
  } = useApp();

  const { isAdmin } = useAuth();

  const [query, setQuery] = useState('');

  if (!isCommandPaletteOpen) return null;

  const filteredTasks = tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()) || t.id.toLowerCase().includes(query.toLowerCase()));
  const filteredProjects = projects.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase()));
  const filteredIncidents = incidents.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()) || i.id.toLowerCase().includes(query.toLowerCase()));

  const handleClose = () => {
    setIsCommandPaletteOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-xl shadow-2xl border bg-surface border-border-subtle overflow-hidden transition-all text-content-primary"
      >
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-border-subtle gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe para buscar tareas, proyectos, incidencias o comandos..."
            className="w-full bg-transparent border-none outline-none text-base text-content-primary placeholder-content-muted"
            autoFocus
          />
          <button onClick={handleClose} className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 custom-scrollbar bg-canvas">
          {/* Quick Actions Shortcuts */}
          {query.trim() === '' && (
            <div>
              <p className="px-2 mb-2 text-[10px] font-bold text-content-muted uppercase tracking-wider">Acciones Rápidas</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    setIsCreateTaskOpen(true);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface border border-border-subtle hover:bg-surface-hover text-xs font-medium text-content-secondary hover:text-content-primary transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-cyan-400" /> Crear Nueva Tarea
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-raised text-content-muted">C</span>
                </button>
                <button
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    setIsCreateIncidentOpen(true);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface border border-border-subtle hover:bg-surface-hover text-xs font-medium text-content-secondary hover:text-content-primary transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <LifeBuoy className="w-4 h-4 text-amber-400" /> Registrar Incidencia
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-raised text-content-muted">I</span>
                </button>
              </div>
            </div>
          )}

          {/* Tasks Results */}
          {filteredTasks.length > 0 && (
            <div>
              <p className="px-2 mb-1 text-[10px] font-bold text-content-muted uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-blue-400" /> Tareas ({filteredTasks.length})
              </p>
              <div className="space-y-1">
                {filteredTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTask(task);
                      setActiveTab('tasks');
                      handleClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-hover cursor-pointer text-xs transition-colors border border-transparent"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="font-mono text-[11px] text-cyan-400 shrink-0">{task.id}</span>
                      <span className="font-medium text-content-primary truncate">{task.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-surface-raised text-content-muted uppercase font-mono">
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incidents Results */}
          {filteredIncidents.length > 0 && (
            <div>
              <p className="px-2 mb-1 text-[10px] font-bold text-content-muted uppercase tracking-wider flex items-center gap-2">
                <LifeBuoy className="w-3.5 h-3.5 text-amber-400" /> Incidencias ({filteredIncidents.length})
              </p>
              <div className="space-y-1">
                {filteredIncidents.slice(0, 3).map((incident) => (
                  <div
                    key={incident.id}
                    onClick={() => {
                      setSelectedIncident(incident);
                      setActiveTab('incidents');
                      handleClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-hover cursor-pointer text-xs transition-colors border border-transparent"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="font-mono text-[11px] text-amber-400 shrink-0">{incident.id}</span>
                      <span className="font-medium text-content-primary truncate">{incident.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                      {incident.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Results */}
          {isAdmin && filteredProjects.length > 0 && (
            <div>
              <p className="px-2 mb-1 text-[10px] font-bold text-content-muted uppercase tracking-wider flex items-center gap-2">
                <FolderKanban className="w-3.5 h-3.5 text-emerald-400" /> Proyectos ({filteredProjects.length})
              </p>
              <div className="space-y-1">
                {filteredProjects.slice(0, 3).map((project) => (
                  <div
                    key={project.id}
                    onClick={() => {
                      setSelectedProject(project);
                      setActiveTab('projects');
                      handleClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-hover cursor-pointer text-xs transition-colors border border-transparent"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="font-mono text-[11px] text-emerald-400 shrink-0">{project.id}</span>
                      <span className="font-medium text-content-primary truncate">{project.name}</span>
                    </div>
                    <span className="text-[10px] text-content-muted font-mono">{project.progress}% completado</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts tip */}
        <div className="px-4 py-2.5 border-t border-border-subtle bg-surface flex items-center justify-between text-[11px] text-content-muted">
          <span>Presiona <kbd className="font-mono text-content-secondary bg-surface-raised px-1 py-0.5 rounded">Esc</kbd> para salir</span>
          <span className="font-mono">Navega con flechas y selecciona con Enter</span>
        </div>
      </div>
    </div>
  );
};
