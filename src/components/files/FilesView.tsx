import React, { useState, useRef } from 'react';
import {
  Folder,
  FileText,
  Upload,
  Search,
  Download,
  Plus,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createDocument, logActivity, deleteDocument } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase';
import { EntityPageHeader } from '../shared/EntityPageHeader';
import { formatDate } from '../../utils/dateUtils';
import { FileItem } from '../../types';

export const FilesView: React.FC = () => {
  const { files, toast } = useApp();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.module.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (file: FileItem) => {
    if (!window.confirm(`¿Estás seguro de eliminar el archivo "${file.name}"?`)) return;
    try {
      if (file.url.includes('supabase.co')) {
        const path = file.url.split('/').pop();
        if (path) {
          await supabase.storage.from('files').remove([path]);
        }
      }
      await deleteDocument('files', file.id);
      toast('Archivo eliminado', 'success');
    } catch (err) {
      toast('Error al eliminar archivo', 'error');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${currentUser.organizationId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      const newFile: FileItem = {
        id: `FILE-${Date.now()}`,
        name: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type,
        module: 'general',
        uploadedBy: currentUser.displayName,
        organizationId: currentUser.organizationId,
        createdAt: new Date().toISOString()
      };

      await createDocument('files', newFile);
      await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Subida de Archivo', 'Archivos', newFile.id, file.name, 'Archivo subido al repositorio.');
      toast('Archivo subido correctamente', 'success');
    } catch (err) {
      toast('Error al subir el archivo', 'error');
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = (file: FileItem) => {
    window.open(file.url, '_blank');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <EntityPageHeader 
        icon={<Folder className="w-5 h-5" />}
        title="Repositorio Central de Archivos"
        description="Almacenamiento seguro de manuales, diagramas, scripts y configuraciones de equipos."
        actionLabel={isUploading ? "Subiendo..." : "Subir Archivo"}
        onAction={() => fileInputRef.current?.click()}
      />
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        disabled={isUploading}
      />

      {/* Filter Bar */}
      <div className="p-3 lg:p-4 rounded-xl border border-border-subtle bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-content-muted absolute left-3 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o módulo..."
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
                 <tr><td colSpan={6} className="text-center py-10">No hay archivos registrados</td></tr>
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
                      <div className="flex justify-end gap-2">
                        {currentUser?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(file)}
                            className="p-1.5 rounded-lg bg-surface-raised border border-border-subtle hover:bg-rose-500/10 text-rose-500/50 hover:text-rose-400 transition-colors"
                            title="Eliminar archivo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-1.5 rounded-lg bg-surface-raised border border-border-subtle hover:bg-surface-hover text-cyan-400 transition-colors"
                          title="Descargar archivo"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
