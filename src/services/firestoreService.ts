// firestoreService.ts — DEPRECADO
// Esta app ahora usa Supabase. Toda la lógica de datos está en supabaseService.ts
// Este archivo existe solo para evitar errores de compilación en importaciones antiguas.

export const logActivity = async (..._args: unknown[]) => {};
export const checkAndSeedFirestore = async () => {};
export const subscribeCollection = (_c: string, cb: (items: unknown[]) => void, fallback: unknown[] = []) => {
  cb(fallback);
  return () => {};
};
export const createDocument = async () => {};
export const updateDocument = async () => {};
export const deleteDocument = async () => {};
