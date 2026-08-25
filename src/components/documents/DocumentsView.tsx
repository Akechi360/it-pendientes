import React, { useState } from 'react';
import {
  FileText,
  Search,
  Edit,
  Save,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createDocument, updateDocument, deleteDocument, logActivity } from '../../services/supabaseService';
import { DocumentItem, DocumentSpace } from '../../types';
import { EntityPageHeader } from '../shared/EntityPageHeader';
import { formatDate } from '../../utils/dateUtils';
import { EntityAttachments } from '../files/EntityAttachments';

export const DocumentsView: React.FC = () => {
  const { documents, toast } = useApp();
  const { currentUser } = useAuth();

  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(documents[0] || null);
  const [selectedSpace, setSelectedSpace] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const spaces: DocumentSpace[] = [
    'Infraestructura',
    'Redes',
    'Seguridad',
    'Desarrollo',
    'Servidores',
    'Procedimientos',
    'Manuales',
    'Runbooks',
    'Postmortems',
    'Politicas',
    'General'
  ];

  const filteredDocs = documents.filter((d) => {
    const matchesSpace = selectedSpace === 'todos' || d.space === selectedSpace;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpace && matchesSearch;
  });

  const handleSelectDoc = (docItem: DocumentItem) => {
    setSelectedDoc(docItem);
    setEditTitle(docItem.title);
    setEditContent(docItem.content);
    setIsEditing(false);
  };

  const handleCreateDoc = async () => {
    if (!currentUser) return;
    const year = new Date().getFullYear();
    const randStr = Math.floor(1000 + Math.random() * 9000).toString();
    const docId = `DOC-${year}-${randStr}`;

    const newDoc: DocumentItem = {
      id: docId,
      title: 'Nuevo Documento Técnico',
      content: '# Título del Documento\nEscribe aquí las instrucciones o especificaciones...',
      space: 'Runbooks',
      status: 'publicado',
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      isFavorite: false,
      tags: ['Documento'],
      organizationId: currentUser.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await createDocument('documents', newDoc);
      await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Creación de Documento', 'Documentación', docId, newDoc.title, 'Documento creado en la Base de Conocimiento.');
      setSelectedDoc(newDoc);
      setEditTitle(newDoc.title);
      setEditContent(newDoc.content);
      setIsEditing(true);
      toast('Nuevo documento creado', 'success');
    } catch (err) {
      toast('Error al crear documento', 'error');
    }
  };

  const handleSaveDoc = async () => {
    if (!selectedDoc) return;
    try {
      await updateDocument('documents', selectedDoc.id, {
        title: editTitle,
        content: editContent
      });
      setSelectedDoc({ ...selectedDoc, title: editTitle, content: editContent });
      setIsEditing(false);
      toast('Documento actualizado correctamente', 'success');
    } catch (err) {
      toast('Error al guardar documento', 'error');
    }
  };

  const handleDeleteDoc = async () => {
    if (!selectedDoc || !currentUser) return;
    if (currentUser.role !== 'admin') {
      toast('No tienes permisos para eliminar documentación', 'error');
      return;
    }
    
    if (confirm(`¿Estás seguro de que deseas eliminar el documento "${selectedDoc.title}"?`)) {
      try {
        await deleteDocument('documents', selectedDoc.id);
        await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Eliminación de Documento', 'Documentación', selectedDoc.id, selectedDoc.title, 'Documento eliminado de la Base de Conocimiento.');
        setSelectedDoc(null);
        toast('Documento eliminado correctamente', 'success');
      } catch (err) {
        toast('Error al eliminar documento', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <EntityPageHeader 
        icon={<FileText className="w-5 h-5" />}
        title="Base de Conocimiento & Runbooks"
        description="Manuales de procedimientos, guías de contingencia, políticas de seguridad y runbooks del departamento."
        actionLabel="Crear Documento"
        onAction={handleCreateDoc}
      />

      {/* Main Split Layout: Sidebar spaces vs Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: Spaces & Document Tree */}
        <div className="p-4 rounded-xl border border-border-subtle bg-surface flex flex-col gap-4 shadow-sm h-[calc(100vh-220px)] lg:h-auto">
          <div className="relative shrink-0">
            <Search className="w-3.5 h-3.5 text-content-muted absolute left-3 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar documentos..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="shrink-0">
            <h3 className="text-[10px] font-bold text-content-muted uppercase tracking-wider mb-2">Espacios</h3>
            <div className="space-y-0.5 max-h-40 overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setSelectedSpace('todos')}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedSpace === 'todos' ? 'bg-cyan-500/10 text-cyan-400 font-bold' : 'text-content-secondary hover:bg-surface-hover hover:text-content-primary'
                }`}
              >
                📁 Todos los Espacios
              </button>
              {spaces.map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSelectedSpace(sp)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedSpace === sp ? 'bg-cyan-500/10 text-cyan-400 font-bold' : 'text-content-secondary hover:bg-surface-hover hover:text-content-primary'
                  }`}
                >
                  📄 {sp}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border-subtle flex-1 flex flex-col min-h-0">
            <h3 className="text-[10px] font-bold text-content-muted uppercase tracking-wider mb-2 shrink-0">Artículos ({filteredDocs.length})</h3>
            <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-1">
              {filteredDocs.length === 0 ? (
                <div className="text-[11px] text-content-muted italic px-2 py-4 text-center">No hay documentos.</div>
              ) : (
                filteredDocs.map((docItem) => (
                  <button
                    key={docItem.id}
                    onClick={() => handleSelectDoc(docItem)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium truncate transition-colors border ${
                      selectedDoc?.id === docItem.id
                        ? 'bg-surface-raised text-cyan-400 border-cyan-500/30'
                        : 'text-content-secondary hover:bg-surface-hover border-transparent'
                    }`}
                    title={docItem.title}
                  >
                    {docItem.title}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Pane: Document Viewer / Editor */}
        <div className="lg:col-span-3 p-4 lg:p-6 rounded-xl border border-border-subtle bg-surface shadow-sm h-[calc(100vh-220px)] lg:h-auto flex flex-col">
          {selectedDoc ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border-subtle shrink-0">
                <div className="flex-1 min-w-0 pr-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-lg font-bold bg-surface-raised px-3 py-1.5 rounded-lg border border-border-subtle text-content-primary w-full focus:outline-none focus:border-cyan-500/50"
                      placeholder="Título del documento..."
                    />
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {selectedDoc.space}
                        </span>
                        <span className="text-[10px] text-content-muted font-mono">{formatDate(selectedDoc.updatedAt, true)}</span>
                      </div>
                      <h2 className="text-xl font-bold text-content-primary truncate">{selectedDoc.title}</h2>
                    </div>
                  )}
                </div>

                <div className="shrink-0 self-start flex gap-2">
                  {isEditing ? (
                    <button
                      onClick={handleSaveDoc}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" /> Guardar
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-raised border border-border-subtle hover:bg-surface-hover text-content-primary text-xs font-semibold transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" /> Editar
                      </button>
                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={handleDeleteDoc}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border-subtle hover:border-rose-500/30 hover:bg-rose-500/10 text-content-secondary hover:text-rose-400 text-xs font-semibold transition-colors"
                          title="Eliminar documento"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Document Body */}
              <div className="flex-1 mt-4 relative">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="absolute inset-0 w-full h-full p-4 rounded-lg bg-canvas border border-border-subtle text-xs font-mono text-content-primary leading-relaxed focus:outline-none focus:border-cyan-500/50 resize-none custom-scrollbar"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full p-6 rounded-lg bg-canvas border border-border-subtle overflow-y-auto custom-scrollbar">
                    <div className="text-sm font-mono leading-relaxed text-content-secondary whitespace-pre-line mb-8">
                      {selectedDoc.content}
                    </div>
                    
                    <EntityAttachments 
                      moduleId="documents" 
                      entityId={selectedDoc.id} 
                      entityTitle={selectedDoc.title} 
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center flex-col gap-3 text-content-muted text-sm border-2 border-dashed border-border-subtle rounded-xl bg-canvas m-4">
              <FileText className="w-8 h-8 opacity-50" />
              Selecciona un documento o crea uno nuevo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
