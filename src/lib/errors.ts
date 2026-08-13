// Nota: firebase.ts fue reemplazado por Supabase. Este archivo mantiene
// compatibilidad con el enum OperationType y la función handleFirestoreError
// que usa supabaseService.ts internamente.

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST   = 'list',
  GET    = 'get',
  WRITE  = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo?: Record<string, unknown>;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const msg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = { error: msg, operationType, path };
  console.error('[Supabase] Error Details:', errInfo);
  throw new Error(JSON.stringify(errInfo));
}
