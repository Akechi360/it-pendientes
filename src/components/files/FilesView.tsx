import React, { useState } from 'react';
import {
  Folder,
  FileText,
  Upload,
  Plus,
  Search,
  Download,
  Trash2,
  HardDrive
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FilesView: React.FC = () => {
  const { isDarkTheme, toast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const sampleFiles = [
    { id: 'F01', name: 'Diagrama_Red_Principal_2026.pdf', size: '2.4 MB', folder: 'Redes', uploadedBy: 'Carlos Mendoza', date: '2026-08-10' },
    { id: 'F02', name: 'Politica_Seguridad_Informacion.docx', size: '1.1 MB', folder: 'Seguridad', uploadedBy: 'Carlos Mendoza', date: '2026-08-01' },
    { id: 'F03', name: 'Inventario_Servidores_Rack1.xlsx', size: '850 KB', folder: 'Infraestructura', uploadedBy: 'Ana Torres', date: '2026-08-12' },
    { id: 'F04', name: 'Manual_Configuracion_Fortinet.pdf', size: '4.8 MB', folder: 'Runbooks', uploadedBy: 'Ana Torres', date: '2026-08-11' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Folder className="w-6 h-6 text-cyan-400" /> Gestor de Archivos & Adjuntos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Almacenamiento central de diagramas, contratos, políticas y ejecutables de la organización.
          </p>
        </div>

        <button
          onClick={() => toast('Selecciona un archivo para subir', 'info')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all self-start md:self-auto"
        >
          <Upload className="w-4 h-4" /> Subir Archivo
        </button>
      </div>

      {/* Files List */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/80">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
            <tr>
              <th className="p-3">Nombre del Archivo</th>
              <th className="p-3">Carpeta / Categoría</th>
              <th className="p-3">Tamaño</th>
              <th className="p-3">Subido por</th>
              <th className="p-3">Fecha</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sampleFiles.map((file) => (
              <tr key={file.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-3 font-semibold text-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" /> {file.name}
                </td>
                <td className="p-3 font-mono text-slate-400">{file.folder}</td>
                <td className="p-3 font-mono">{file.size}</td>
                <td className="p-3">{file.uploadedBy}</td>
                <td className="p-3 font-mono">{file.date}</td>
                <td className="p-3 text-right">
                  <button onClick={() => toast(`Descargando ${file.name}...`, 'info')} className="p-1.5 rounded hover:bg-slate-800 text-cyan-400">
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
