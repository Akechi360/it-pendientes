import React, { useState, useRef } from 'react';
import { Paperclip, Image as ImageIcon, FileText, File, Download, X, Trash2, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createDocument, deleteDocument, logActivity } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase';
import { FileItem } from '../../types';

interface EntityAttachmentsProps {
  moduleId: 'tasks' | 'projects' | 'incidents' | 'documents' | 'assets' | 'renewals' | 'general';
  entityId: string;
  entityTitle: string;
}

export const EntityAttachments: React.FC<EntityAttachmentsProps> = ({ moduleId, entityId, entityTitle }) => {
  const { files, toast } = useApp();
  const { currentUser, isAdmin } = useAuth();
  
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtrar archivos asociados a esta entidad
  const entityFiles = files.filter(f => f.module === moduleId && f.entityId === entityId);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-indigo-400" />;
    if (type === 'application/pdf') return <FileText className="w-5 h-5 text-rose-400" />;
    return <File className="w-5 h-5 text-slate-400" />;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${currentUser.organizationId}/${moduleId}/${entityId}/${fileName}`;

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
        module: moduleId,
        entityId,
        entityTitle,
        uploadedBy: currentUser.displayName,
        organizationId: currentUser.organizationId,
        createdAt: new Date().toISOString()
      };

      await createDocument('files', newFile);
      await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Adjunto Creado', 'Archivos', newFile.id, file.name, `Archivo adjuntado a ${entityTitle}`);
      
      toast('Archivo adjuntado correctamente', 'success');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      toast('Error al adjuntar archivo', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, file: FileItem) => {
    e.stopPropagation();
    if (!window.confirm(`¿Seguro que deseas eliminar "${file.name}"?`)) return;
    
    try {
      if (file.url.includes('supabase.co')) {
        const urlParts = file.url.split('/files/');
        if (urlParts.length > 1) {
          const path = urlParts[1];
          await supabase.storage.from('files').remove([path]);
        }
      }
      await deleteDocument('files', file.id);
      toast('Archivo eliminado', 'success');
      if (previewFile?.id === file.id) setPreviewFile(null);
    } catch (err) {
      console.error(err);
      toast('Error al eliminar', 'error');
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-border-subtle">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-content-primary flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-cyan-400" />
          Evidencia y Adjuntos ({entityFiles.length})
        </h3>
        
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-3 py-1.5 bg-surface-hover hover:bg-surface-active text-content-secondary hover:text-content-primary rounded-lg text-sm font-medium transition-colors border border-border-subtle"
        >
          {isUploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</>
          ) : (
            <><Paperclip className="w-4 h-4" /> Adjuntar Archivo</>
          )}
        </button>
      </div>

      {entityFiles.length === 0 ? (
        <div className="text-center py-8 bg-surface-hover/50 rounded-xl border border-dashed border-border-subtle">
          <p className="text-content-muted text-sm">No hay archivos adjuntos en este documento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {entityFiles.map(file => (
            <div 
              key={file.id}
              onClick={() => setPreviewFile(file)}
              className="group flex items-center gap-3 p-3 bg-surface rounded-xl border border-border-subtle hover:border-cyan-500/50 hover:bg-surface-hover cursor-pointer transition-all"
            >
              <div className="p-2 bg-slate-900/50 rounded-lg">
                {getFileIcon(file.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-content-primary truncate">{file.name}</p>
                <p className="text-xs text-content-muted">{formatFileSize(file.size)}</p>
              </div>
              {(isAdmin || currentUser?.displayName === file.uploadedBy) && (
                <button
                  onClick={(e) => handleDelete(e, file)}
                  className="p-1.5 text-content-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Previsualización LightBox */}
      {previewFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-full flex flex-col bg-surface rounded-2xl shadow-2xl border border-border-subtle overflow-hidden">
            
            {/* Header del LightBox */}
            <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-surface/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                {getFileIcon(previewFile.type)}
                <div>
                  <h3 className="text-content-primary font-medium truncate max-w-md">{previewFile.name}</h3>
                  <p className="text-xs text-content-muted">Subido por {previewFile.uploadedBy} • {formatFileSize(previewFile.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewFile.url}
                  download={previewFile.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-2 text-content-secondary hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                  title="Descargar"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="shrink-0 p-2 text-content-secondary hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido del LightBox */}
            <div className="flex-1 overflow-auto bg-slate-950/50 flex items-center justify-center p-4 min-h-[50vh]">
              {previewFile.type.startsWith('image/') ? (
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name} 
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              ) : previewFile.type === 'application/pdf' ? (
                <iframe 
                  src={previewFile.url} 
                  className="w-full h-[70vh] rounded-lg bg-white"
                  title={previewFile.name}
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-center">
                  <File className="w-16 h-16 text-slate-500" />
                  <div>
                    <p className="text-content-primary font-medium mb-1">Previsualización no disponible</p>
                    <p className="text-content-muted text-sm mb-4">Este tipo de archivo ({previewFile.type || 'desconocido'}) debe descargarse para verse.</p>
                    <a
                      href={previewFile.url}
                      download={previewFile.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 rounded-xl transition-colors font-medium text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Descargar Archivo
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
