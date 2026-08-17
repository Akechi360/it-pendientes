import { supabase } from '../lib/supabase';
import { OperationType } from '../lib/errors';
import {
  UserProfile,
  ActivityLogItem,
} from '../types';
import {
  DEFAULT_ORG_ID,
  SEED_TASKS,
  SEED_PROJECTS,
  SEED_INCIDENTS,
  SEED_MEETINGS,
  SEED_DOCUMENTS,
  SEED_ASSETS,
  SEED_RENEWALS,
  SEED_LOGS,
  SEED_NOTIFICATIONS,
  SEED_FILES,
} from './seedData';

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
  try {
    const { data, error } = await supabase.from('tasks').select('id').limit(1);
    if (error) {
      console.warn('[Supabase] No se pudo verificar seed:', error.message);
      return;
    }
    if (data && data.length > 0) return; // ya hay datos

    console.log('[Supabase] Tablas vacías — insertando datos iniciales...');

    const seedSets: Array<{ table: string; rows: unknown[] }> = [
      { table: 'tasks',          rows: SEED_TASKS },
      { table: 'projects',       rows: SEED_PROJECTS },
      { table: 'incidents',      rows: SEED_INCIDENTS },
      { table: 'meetings',       rows: SEED_MEETINGS },
      { table: 'documents',      rows: SEED_DOCUMENTS },
      { table: 'assets',         rows: SEED_ASSETS },
      { table: 'renewals',       rows: SEED_RENEWALS },
      { table: 'activity_logs',  rows: SEED_LOGS },
      { table: 'notifications',  rows: SEED_NOTIFICATIONS },
      { table: 'files',          rows: SEED_FILES },
    ];

    for (const { table, rows } of seedSets) {
      const snakeRows = (rows as Array<Record<string, unknown>>).map(toSnake);
      const { error: err } = await supabase.from(table).insert(snakeRows);
      if (err) console.warn(`[Supabase] Error seeding ${table}:`, err.message);
    }

    console.log('[Supabase] ✅ Seed completado.');
  } catch (err) {
    console.warn('[Supabase] Seed falló, usando datos locales como fallback.');
  }
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
  supabase
    .from(tableName)
    .select('*')
    .then(({ data, error }) => {
      if (error || !data || data.length === 0) {
        console.warn(`[Supabase] Utilizando respaldo demo para ${tableName}:`, error?.message || 'Tabla vacía o inaccesible');
        callback(fallbackData);
      } else {
        const items = data.map((row) => toCamel<T>(row as Record<string, unknown>));
        callback(items);
      }
    })
    .catch((err) => {
      console.warn(`[Supabase] Excepción en fetch para ${tableName}:`, err);
      callback(fallbackData);
    });

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
        console.warn(`[Supabase] Error en canal realtime para ${tableName}.`);
        callback(fallbackData);
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
