import { read, utils } from 'xlsx';
import { AssetItem, AssetType } from '../types';

export const parseInventoryExcel = async (file: File, organizationId: string): Promise<AssetItem[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('File read failed');
        
        const workbook = read(data, { type: 'binary' });
        const assetsToImport: AssetItem[] = [];
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const sheetData: any[][] = utils.sheet_to_json(worksheet, { header: 1 });
          
          if (sheetData.length <= 3) return; // No data or headers
          
          const headerRow = sheetData[3];
          if (!headerRow || !Array.isArray(headerRow)) return;
          
          const hMap = new Map<string, number>();
          headerRow.forEach((h, i) => {
            if (typeof h === 'string') hMap.set(h.toLowerCase().trim(), i);
          });
          
          const getVal = (row: any[], keys: string[]) => {
            for (const k of keys) {
              const idx = hMap.get(k.toLowerCase());
              if (idx !== undefined && row[idx] !== undefined) {
                return String(row[idx]).trim();
              }
            }
            return '';
          };
          
          // Data starts at index 4
          for (let i = 4; i < sheetData.length; i++) {
            const row = sheetData[i];
            if (!row || row.length === 0) continue;
            
            const cat = getVal(row, ['categoría', 'categoria', 'category']);
            const marca = getVal(row, ['marca', 'brand']);
            const modelo = getVal(row, ['modelo', 'model']);
            const serial = getVal(row, ['serial', 'serial number']);
            const capacidad = getVal(row, ['capacidad', 'capacity']);
            const ubi = getVal(row, ['ubicación', 'ubicacion', 'location']);
            const usr = getVal(row, ['usuario', 'user']);
            const proc = getVal(row, ['procesador', 'processor']);
            const ram = getVal(row, ['ram', 'memory']);
            
            // Skip empty rows (no category, no brand)
            if (!cat && !marca && !modelo && !serial) continue;
            
            // Map Type
            let type: AssetType = 'otro';
            const catLower = cat.toLowerCase();
            if (catLower.includes('pc') || catLower.includes('desktop') || catLower.includes('computadora')) type = 'desktop';
            else if (catLower.includes('laptop') || catLower.includes('portatil')) type = 'laptop';
            else if (catLower.includes('impresora') || catLower.includes('print')) type = 'impresora';
            else if (catLower.includes('router') || catLower.includes('switch') || catLower.includes('red')) type = 'switch';
            
            // Construct Name
            const parts = [cat, marca, modelo || serial || capacidad].filter(Boolean);
            const assetName = parts.length > 0 ? parts.join(' ') : `Activo Importado (${sheetName})`;
            
            // Notes
            const notesArr = [];
            if (proc) notesArr.push(`Procesador: ${proc}`);
            if (ram) notesArr.push(`RAM: ${ram}`);
            if (capacidad) notesArr.push(`Capacidad: ${capacidad}`);
            const notes = notesArr.join(' | ');
            
            // Brand & Model
            const brandModel = [marca, modelo].filter(Boolean).join(' ');
            
            // Generate IDs
            const year = new Date().getFullYear();
            const randStr = Math.floor(10000 + Math.random() * 90000).toString();
            const assetId = `AST-${year}-${randStr}`;
            const tag = `TAG-${randStr}`;
            
            assetsToImport.push({
              id: assetId,
              name: assetName,
              type,
              tag,
              brandModel: brandModel || undefined,
              serialNumber: serial || 'N/A',
              ipAddress: 'N/A',
              location: ubi || 'Sin Asignar',
              assignedTo: usr || 'Sin Asignar',
              status: 'activo',
              notes: notes || undefined,
              organizationId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        });
        
        resolve(assetsToImport);
        
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
