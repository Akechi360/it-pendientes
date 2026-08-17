import React, { useState } from 'react';
import {
  Folder,
  FileText,
  Upload,
  Search,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EntityPageHeader } from '../shared/EntityPageHeader';
import { formatDate } from '../../utils/dateUtils';

export const FilesView: React.FC = () => {
  const { files, toast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.module.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <EntityPageHeader 
        icon={<Folder className="w-5 h-5" />}
        title="Gestor de Archivos & Adjuntos"
        description="Almacenamiento central de diagramas, contratos, políticas y ejecutables de la organización."
        actionLabel="Subir Archivo"
        onAction={() => toast('Selecciona un archivo para subir', 'info')}
      />

      {/* Filter Bar */}
      <div className="p-3 lg:p-4 rounded-xl border border-border-subtle bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-content-muted absolute left-3 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar archivos por nombre o módulo..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Files List */}
      <div className="rounded-xl border border-border-subtle overflow-hidden bg-surface shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-surface-raised text-content-muted font-mono text-[10px] uppercase border-b border-border-subtle">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre del Archivo</th>
                <th className="px-4 py-3 font-semibold">Módulo / Contexto</th>
                <th className="px-4 py-3 font-semibold">Tamaño</th>
                <th className="px-4 py-3 font-semibold">Subido por</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-content-secondary">
              {filteredFiles.length === 0 ? (
                 <tr><td colSpan={6} className="text-center py-10">No hay archivos</td></tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-surface-hover transition-colors group">
                    <td className="px-4 py-3 font-medium text-content-primary flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="truncate max-w-[200px] xl:max-w-xs">{file.name}</span>
                    </td>
                    <td className="px-4 py-3 capitalize text-[11px]">{file.module}</td>
                    <td className="px-4 py-3 font-mono text-content-muted text-[11px]">{(file.size / 1024).toFixed(1)} KB</td>
                    <td className="px-4 py-3">{file.uploadedBy}</td>
                    <td className="px-4 py-3 font-mono text-[11px]">{formatDate(file.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => toast(`Descargando ${file.name}...`, 'info')} className="p-1.5 rounded-lg bg-surface-raised border border-border-subtle hover:bg-surface-hover text-cyan-400 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
