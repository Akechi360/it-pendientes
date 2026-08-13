import React, { useState } from 'react';
import {
  Search,
  CheckSquare,
  FolderKanban,
  LifeBuoy,
  FileText,
  Server,
  Users,
  X,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    tasks,
    projects,
    incidents,
    documents,
    assets,
    meetings,
    setActiveTab,
    setSelectedTask,
    setSelectedIncident,
    setSelectedProject,
    openQuickCreate,
    isDarkTheme
  } = useApp();

  const [query, setQuery] = useState('');

  if (!isCommandPaletteOpen) return null;

  const filteredTasks = tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()) || t.id.toLowerCase().includes(query.toLowerCase()));
  const filteredProjects = projects.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase()));
  const filteredIncidents = incidents.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()) || i.id.toLowerCase().includes(query.toLowerCase()));
  const filteredDocs = documents.filter((d) => d.title.toLowerCase().includes(query.toLowerCase()));
  const filteredAssets = assets.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.serialNumber.toLowerCase().includes(query.toLowerCase()));

  const handleClose = () => {
    setIsCommandPaletteOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden transition-all ${
          isDarkTheme ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe para buscar tareas, proyectos, incidencias, documentos o comandos..."
            className="w-full bg-transparent border-none outline-none text-base text-slate-100 placeholder-slate-500"
            autoFocus
          />
          <button onClick={handleClose} className="p-1 rounded text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {/* Quick Actions Shortcuts */}
          {query.trim() === '' && (
            <div>
              <p className="px-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones Rápidas</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleClose();
                    openQuickCreate('task');
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-all border border-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-cyan-400" /> Crear Nueva Tarea
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">C</span>
                </button>
                <button
                  onClick={() => {
                    handleClose();
                    openQuickCreate('incident');
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-all border border-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <LifeBuoy className="w-4 h-4 text-amber-400" /> Registrar Incidencia
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">I</span>
                </button>
              </div>
            </div>
          )}

          {/* Tasks Results */}
          {filteredTasks.length > 0 && (
            <div>
              <p className="px-2 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
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
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer text-xs transition-all border border-transparent hover:border-slate-800"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="font-mono text-[11px] text-cyan-400 shrink-0">{task.id}</span>
                      <span className="font-medium text-slate-200 truncate">{task.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
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
              <p className="px-2 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
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
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer text-xs transition-all border border-transparent hover:border-slate-800"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="font-mono text-[11px] text-amber-400 shrink-0">{incident.id}</span>
                      <span className="font-medium text-slate-200 truncate">{incident.title}</span>
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
          {filteredProjects.length > 0 && (
            <div>
              <p className="px-2 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
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
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer text-xs transition-all border border-transparent hover:border-slate-800"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="font-mono text-[11px] text-emerald-400 shrink-0">{project.id}</span>
                      <span className="font-medium text-slate-200 truncate">{project.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{project.progress}% completado</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts tip */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-[11px] text-slate-500">
          <span>Presiona <kbd className="font-mono text-slate-300">Esc</kbd> para salir</span>
          <span className="font-mono">Navega con flechas y selecciona con Enter</span>
        </div>
      </div>
    </div>
  );
};
