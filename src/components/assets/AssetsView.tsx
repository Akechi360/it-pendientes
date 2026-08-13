import React, { useState } from 'react';
import {
  Server,
  Plus,
  Search,
  HardDrive,
  Cpu,
  Globe,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createDocument, logActivity } from '../../services/supabaseService';
import { AssetItem, AssetType } from '../../types';

export const AssetsView: React.FC = () => {
  const { assets, toast, isDarkTheme } = useApp();
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
    if (!name.trim()) return;

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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-cyan-400" /> Inventario de Activos de TI
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Control de servidores, switches, laps, impresoras, direcciones IP, etiquetas internas y garantías.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Registrar Activo
        </button>
      </div>

      {/* Add Asset Form Modal / Inline Box */}
      {isAdding && (
        <form onSubmit={handleCreateAsset} className={`p-6 rounded-2xl border space-y-4 ${
          isDarkTheme ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className="text-sm font-bold text-white">Nuevo Registro de Activo Físico / Lógico</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre del Dispositivo / Servidor *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Servidor Hyper-V Node 01"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Tipo de Activo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
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
              <label className="block text-xs font-semibold text-slate-400 mb-1">Dirección IP (Opcional)</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.100"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Número de Serie</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="SN-99882211"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Ubicación Física</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md"
            >
              Guardar Activo
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className={`p-4 rounded-2xl border ${isDarkTheme ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o etiqueta tag..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Assets Table */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/80">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
            <tr>
              <th className="p-3">Tag Interno</th>
              <th className="p-3">Nombre del Activo</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Dirección IP</th>
              <th className="p-3">Número de Serie</th>
              <th className="p-3">Ubicación</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredAssets.map((asset) => (
              <tr key={asset.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-3 font-mono font-bold text-cyan-400">{asset.tag}</td>
                <td className="p-3 font-semibold text-slate-100">{asset.name}</td>
                <td className="p-3 capitalize">{asset.type.replace('_', ' ')}</td>
                <td className="p-3 font-mono text-cyan-300">{asset.ipAddress || 'N/A'}</td>
                <td className="p-3 font-mono text-slate-400">{asset.serialNumber}</td>
                <td className="p-3">{asset.location}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                    {asset.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
