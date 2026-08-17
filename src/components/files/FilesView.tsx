import React, { useState, useRef } from 'react';
import {
  Folder,
  FileText,
  Upload,
  Search,
  Download,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createDocument, logActivity } from '../../services/supabaseService';
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !currentUser) return;

    setIsUploading(true);
    try {
      let fileUrl = '';
      const filePath = `uploads/${Date.now()}_${selectedFile.name}`;

      // Intentar subir a Supabase Storage
      const { data: storageData, error: storageErr } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (!storageErr && storageData) {
        const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath);
        fileUrl = publicUrlData.publicUrl;
      } else {
        // Fallback local mediante URL de objeto para previsualización inmediata
        fileUrl = URL.createObjectURL(selectedFile);
      }

      const fileId = `FILE-${Date.now().toString().slice(-6)}`;
      const newFile: FileItem = {
        id: fileId,
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type || 'application/octet-stream',
        url: fileUrl,
        module: 'General',
        uploadedBy: currentUser.displayName,
        organizationId: currentUser.organizationId,
        createdAt: new Date().toISOString()
      };

      await createDocument('files', newFile);
      await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Subida de Archivo', 'Archivos', fileId, selectedFile.name, `Archivo de ${(selectedFile.size / 1024).toFixed(1)} KB subido.`);

      toast(`Archivo ${selectedFile.name} subido exitosamente`, 'success');
    } catch (err) {
      console.error(err);
      toast('Error al procesar el archivo', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = (file: FileItem) => {
    if (!file.url) {
      toast('El archivo no posee una URL de descarga válida', 'warning');
      return;
    }
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(`Descargando ${file.name}...`, 'info');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      <EntityPageHeader 
        icon={<Folder className="w-5 h-5" />}
        title="Gestor de Archivos & Adjuntos"
        description="Almacenamiento central de diagramas, contratos, políticas y ejecutables de la organización."
        actionLabel={isUploading ? "Subiendo..." : "Subir Archivo"}
        onAction={() => fileInputRef.current?.click()}
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
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-1.5 rounded-lg bg-surface-raised border border-border-subtle hover:bg-surface-hover text-cyan-400 transition-colors"
                        title="Descargar archivo"
                      >
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
