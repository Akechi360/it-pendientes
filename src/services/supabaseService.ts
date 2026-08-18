import { supabase } from '../lib/supabase';
import { OperationType } from '../lib/errors';
import {
  UserProfile,
  ActivityLogItem,
} from '../types';


// ─────────────────────────────────────────────────────────────
// camelCase ↔ snake_case helpers
// ─────────────────────────────────────────────────────────────
const TO_CAMEL_OVERRIDES: Record<string, string> = {
  photo_url: 'photoURL',
};
const TO_SNAKE_OVERRIDES: Record<string, string> = {
  photoURL: 'photo_url',
};

function camelify(str: string): string {
  return str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function snakify(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

function toCamel<T>(obj: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(obj)) {
    out[TO_CAMEL_OVERRIDES[k] ?? camelify(k)] = obj[k];
  }
  return out as T;
}

function toSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(obj)) {
    out[TO_SNAKE_OVERRIDES[k] ?? snakify(k)] = obj[k];
  }
  return out;
}

// ─────────────────────────────────────────────────────────────
// Error handler (compatible with existing errors.ts interface)
// ─────────────────────────────────────────────────────────────
function handleError(error: unknown, op: OperationType, path: string): never {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(`[Supabase] ${op} error on ${path}:`, msg);
  throw new Error(JSON.stringify({ error: msg, operationType: op, path }));
}

// ─────────────────────────────────────────────────────────────
// Seed / initial data
// ─────────────────────────────────────────────────────────────
export async function checkAndSeedSupabase(): Promise<void> {
  // Función desactivada: La aplicación funcionará estrictamente con datos reales 
  // insertados por el usuario. No se inyectará mock data.
  console.log('[Supabase] checkAndSeedSupabase desactivado para garantizar pureza de DB.');
}

// ─────────────────────────────────────────────────────────────
// Real-time collection subscriptions (reemplaza onSnapshot)
// ─────────────────────────────────────────────────────────────
export function subscribeCollection<T>(
  tableName: string,
  callback: (items: T[]) => void,
  fallbackData: T[] = []
): () => void {
  // Fetch inicial
  (async () => {
    try {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) {
        console.warn(`[Supabase] Error fetch para ${tableName}:`, error.message);
        callback([]); // En producción no inyectamos mock data si hay error
      } else if (data) {
        const items = data.map((row) => toCamel<T>(row as Record<string, unknown>));
        callback(items);
      } else {
        callback([]);
      }
    } catch (err) {
      console.warn(`[Supabase] Excepción en fetch para ${tableName}:`, err);
      callback([]);
    }
  })();

  // Suscripción realtime (Postgres Changes)
  const channel = supabase
    .channel(`rt:${tableName}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: tableName },
      () => {
        supabase
          .from(tableName)
          .select('*')
          .then(({ data }) => {
            if (data && data.length > 0) {
              callback(data.map((row) => toCamel<T>(row as Record<string, unknown>)));
            }
          });
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.warn(`[Supabase] Error en canal realtime para ${tableName}. No se inyectan datos de prueba.`);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─────────────────────────────────────────────────────────────
// CRUD genérico
// ─────────────────────────────────────────────────────────────
export async function createDocument<T>(
  tableName: string,
  data: T
): Promise<void> {
  try {
    const { error } = await supabase.from(tableName).insert([toSnake(data as unknown as Record<string, unknown>)]);
    if (error) throw error;
  } catch (error) {
    handleError(error, OperationType.CREATE, tableName);
  }
}

export async function updateDocument<T>(
  tableName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  try {
    const payload = toSnake({
      ...data,
      updatedAt: new Date().toISOString(),
    } as Record<string, unknown>);
    const { error } = await supabase.from(tableName).update(payload).eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleError(error, OperationType.UPDATE, `${tableName}/${id}`);
  }
}

export async function deleteDocument(tableName: string, id: string): Promise<void> {
  try {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleError(error, OperationType.DELETE, `${tableName}/${id}`);
  }
}

// ─────────────────────────────────────────────────────────────
// Activity log (bitácora inmutable)
// ─────────────────────────────────────────────────────────────
export async function logActivity(
  actorId: string,
  actorName: string,
  actorRole: 'admin' | 'analyst',
  action: string,
  module: string,
  entityId: string,
  entityTitle: string,
  details: string
): Promise<void> {
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const logItem: ActivityLogItem = {
    id: logId,
    actorId,
    actorName,
    actorRole,
    action,
    module,
    entityId,
    entityTitle,
    details,
    timestamp: new Date().toISOString(),
    organizationId: DEFAULT_ORG_ID,
  };
  try {
    await supabase
      .from('activity_logs')
      .insert([toSnake(logItem as unknown as Record<string, unknown>)]);
  } catch (err) {
    console.warn('[Supabase] No se pudo registrar actividad:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers de perfil de usuario
// ─────────────────────────────────────────────────────────────
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('uid', uid)
      .single();
    if (error || !data) return null;
    return toCamel<UserProfile>(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function upsertUserProfile(profile: UserProfile): Promise<void> {
  try {
    await supabase
      .from('users')
      .upsert([toSnake(profile as unknown as Record<string, unknown>)]);
  } catch (err) {
    console.warn('[Supabase] No se pudo guardar perfil de usuario:', err);
  }
}
