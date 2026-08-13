import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Folder,
  Star,
  BookOpen,
  Edit,
  Save,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createDocument, updateDocument, logActivity } from '../../services/supabaseService';
import { DocumentItem, DocumentSpace } from '../../types';

export const DocumentsView: React.FC = () => {
  const { documents, toast, isDarkTheme } = useApp();
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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" /> Base de Conocimiento & Runbooks (Notion Style)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manuales de procedimientos, guías de contingencia, políticas de seguridad y runbooks del departamento.
          </p>
        </div>

        <button
          onClick={handleCreateDoc}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Crear Documento
        </button>
      </div>

      {/* Main Split Layout: Sidebar spaces vs Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Spaces & Document Tree */}
        <div className={`p-4 rounded-2xl border space-y-4 ${
          isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar documentos..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Espacios</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedSpace('todos')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedSpace === 'todos' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                📁 Todos los Espacios
              </button>
              {spaces.map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSelectedSpace(sp)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedSpace === sp ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📄 {sp}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Artículos ({filteredDocs.length})</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
              {filteredDocs.map((docItem) => (
                <button
                  key={docItem.id}
                  onClick={() => handleSelectDoc(docItem)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium truncate transition-all ${
                    selectedDoc?.id === docItem.id
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  {docItem.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane: Document Viewer / Editor */}
        <div className={`lg:col-span-3 p-6 rounded-2xl border space-y-4 ${
          isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {selectedDoc ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-lg font-bold bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 text-white flex-1 mr-4 focus:outline-none focus:border-cyan-500"
                  />
                ) : (
                  <div>
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 mr-2">
                      {selectedDoc.space}
                    </span>
                    <h2 className="text-xl font-bold text-white inline">{selectedDoc.title}</h2>
                  </div>
                )}

                <div>
                  {isEditing ? (
                    <button
                      onClick={handleSaveDoc}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md"
                    >
                      <Save className="w-4 h-4" /> Guardar
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                    >
                      <Edit className="w-4 h-4" /> Editar
                    </button>
                  )}
                </div>
              </div>

              {/* Document Body */}
              {isEditing ? (
                <textarea
                  rows={16}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-cyan-500 resize-none"
                />
              ) : (
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800/80 text-sm font-mono leading-relaxed text-slate-300 whitespace-pre-line min-h-[400px]">
                  {selectedDoc.content}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-sm">
              Selecciona un documento del menú izquierdo o crea uno nuevo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
