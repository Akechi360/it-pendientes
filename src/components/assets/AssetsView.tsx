import React, { useState } from 'react';
import {
  Server,
  Search,
  Cpu,
  Globe,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createDocument, logActivity, deleteDocument } from '../../services/supabaseService';
import { AssetItem, AssetType } from '../../types';
import { EntityPageHeader } from '../shared/EntityPageHeader';
import { StatusBadge } from '../shared/StatusBadge';
import { formatDate } from '../../utils/dateUtils';
import { parseInventoryExcel } from '../../utils/excelParser';
import { Upload } from 'lucide-react';

export const AssetsView: React.FC = () => {
  const { assets, toast } = useApp();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // New Asset Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('servidor');
  const [serialNumber, setSerialNumber] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [location, setLocation] = useState('Data Center Principal');

  const filteredAssets = assets.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || (a.tag || a.tagCode || '').toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentUser) return;

    const year = new Date().getFullYear();
    const randStr = Math.floor(1000 + Math.random() * 9000).toString();
    const assetId = `AST-${year}-${randStr}`;
    const tag = `TAG-${randStr}`;

    const newAsset: AssetItem = {
      id: assetId,
      name,
      type,
      tag,
      serialNumber: serialNumber || 'N/A',
      ipAddress: ipAddress || 'N/A',
      location,
      status: 'activo',
      organizationId: currentUser.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await createDocument('assets', newAsset);
      await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Registro de Activo', 'Inventario', assetId, name, 'Activo de TI registrado.');
      toast(`Activo ${tag} registrado`, 'success');
      setIsAdding(false);
      setName('');
      setSerialNumber('');
      setIpAddress('');
    } catch (err) {
      toast('Error al registrar activo', 'error');
    }
  };

  const [isUploading, setIsUploading] = useState(false);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    
    setIsUploading(true);
    try {
      toast('Analizando archivo Excel...', 'info');
      const parsedAssets = await parseInventoryExcel(file, currentUser.organizationId);
      
      if (parsedAssets.length === 0) {
        toast('No se encontraron registros válidos', 'error');
        setIsUploading(false);
        return;
      }

      toast(`Importando ${parsedAssets.length} activos...`, 'info');
      
      for (const asset of parsedAssets) {
        await createDocument('assets', asset);
      }
      
      await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Importación Masiva', 'Inventario', 'MULTIPLE', 'N/A', `Se importaron ${parsedAssets.length} activos desde Excel.`);
      toast(`Se importaron ${parsedAssets.length} activos exitosamente`, 'success');
      
    } catch (err: any) {
      toast('Error al procesar el Excel: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este activo del inventario?')) return;
    try {
      await deleteDocument('assets', id);
      toast('Activo eliminado exitosamente', 'success');
    } catch (err) {
      toast('Error al eliminar', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <EntityPageHeader 
        icon={<Server className="w-5 h-5" />}
        title="Inventario de Activos de TI"
        description="Control de servidores, switches, laps, impresoras, direcciones IP, etiquetas internas y garantías."
        actionLabel={isAdding ? 'Cancelar' : 'Registrar Activo'}
        onAction={() => setIsAdding(!isAdding)}
      />

      {/* Add Asset Form Modal / Inline Box */}
      {isAdding && (
        <form onSubmit={handleCreateAsset} className="p-4 lg:p-6 rounded-xl border border-border-subtle bg-surface space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2">
          <h3 className="text-sm font-bold text-content-primary">Nuevo Registro de Activo Físico / Lógico</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Nombre del Dispositivo / Servidor *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Servidor Hyper-V Node 01"
                className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Tipo de Activo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-xs text-content-primary focus:outline-none focus:border-cyan-500/50"
              >
                <option value="servidor">Servidor</option>
                <option value="laptop">Laptop / PC</option>
                <option value="switch">Switch / Router</option>
                <option value="firewall">Firewall</option>
                <option value="impresora">Impresora</option>
                <option value="maquina_virtual">Máquina Virtual</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Dirección IP (Opcional)</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.100"
                className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Número de Serie</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="SN-99882211"
                className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1.5">Ubicación Física</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-xs text-content-primary focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-5 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-sm"
            >
              Guardar Activo
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="p-3 lg:p-4 rounded-xl border border-border-subtle bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-content-muted absolute left-3 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o etiqueta tag..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-raised border border-border-subtle text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        
        <div className="flex items-center gap-3">
           <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={isUploading} className="hidden" id="excel-upload" />
           <label htmlFor="excel-upload" className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-raised hover:bg-surface-hover text-content-primary text-xs font-semibold transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Upload className="w-4 h-4 text-cyan-400" /> 
              {isUploading ? 'Importando...' : 'Importar Excel'}
           </label>
        </div>
      </div>

      {/* Assets Table */}
      <div className="rounded-xl border border-border-subtle overflow-hidden bg-surface shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-surface-raised text-content-muted font-mono text-[10px] uppercase border-b border-border-subtle">
              <tr>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Tag Interno</th>
                <th className="px-4 py-3 font-semibold">Nombre del Activo</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Dirección IP</th>
                <th className="px-4 py-3 font-semibold">Número de Serie</th>
                <th className="px-4 py-3 font-semibold">Ubicación</th>
                {currentUser?.role === 'admin' && <th className="px-4 py-3 font-semibold text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-content-secondary">
              {filteredAssets.length === 0 ? (
                 <tr><td colSpan={currentUser?.role === 'admin' ? 8 : 7} className="text-center py-10">No hay activos</td></tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-surface-hover transition-colors group">
                    <td className="px-4 py-3">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-cyan-400">{asset.tag}</td>
                    <td className="px-4 py-3 font-medium text-content-primary">{asset.name}</td>
                    <td className="px-4 py-3 capitalize text-[11px]">{asset.type.replace('_', ' ')}</td>
                    <td className="px-4 py-3 font-mono text-cyan-400 text-[11px]">{asset.ipAddress && asset.ipAddress !== 'N/A' ? asset.ipAddress : <span className="text-content-muted">N/A</span>}</td>
                    <td className="px-4 py-3 font-mono text-content-muted text-[11px]">{asset.serialNumber}</td>
                    <td className="px-4 py-3 text-[11px]">{asset.location}</td>
                    {currentUser?.role === 'admin' && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="p-1.5 text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                          title="Eliminar activo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
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
