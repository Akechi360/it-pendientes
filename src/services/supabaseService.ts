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
    organizationId: 'org_sistemas_main',
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
 
 / /    % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % 
 / /   O n e S i g n a l   P u s h   N o t i f i c a t i o n   S e n d e r  
 / /    % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % % 
 e x p o r t   a s y n c   f u n c t i o n   s e n d O n e S i g n a l P u s h ( t a r g e t U s e r I d :   s t r i n g ,   t i t l e :   s t r i n g ,   m e s s a g e :   s t r i n g ) :   P r o m i s e < v o i d >   {  
     c o n s t   a p p I d   =   i m p o r t . m e t a . e n v . V I T E _ O N E S I G N A L _ A P P _ I D ;  
     c o n s t   r e s t A p i K e y   =   i m p o r t . m e t a . e n v . V I T E _ O N E S I G N A L _ R E S T _ K E Y ;  
     i f   ( ! a p p I d   | |   ! r e s t A p i K e y )   {  
         c o n s o l e . w a r n ( ' [ O n e S i g n a l ]   M i s s i n g   A P P _ I D   o r   R E S T _ K E Y .   C a n n o t   s e n d   p u s h   n o t i f i c a t i o n . ' ) ;  
         r e t u r n ;  
     }  
     t r y   {  
         c o n s t   r e s p o n s e   =   a w a i t   f e t c h ( ' h t t p s : / / a p i . o n e s i g n a l . c o m / n o t i f i c a t i o n s ' ,   {  
             m e t h o d :   ' P O S T ' ,  
             h e a d e r s :   {  
                 ' C o n t e n t - T y p e ' :   ' a p p l i c a t i o n / j s o n ' ,  
                 ' A u t h o r i z a t i o n ' :   \ K e y   \ \ ,  
                 ' A c c e p t ' :   ' a p p l i c a t i o n / j s o n '  
             } ,  
             b o d y :   J S O N . s t r i n g i f y ( {  
                 a p p _ i d :   a p p I d ,  
                 t a r g e t _ c h a n n e l :   ' p u s h ' ,  
                 i n c l u d e _ a l i a s e s :   {  
                     e x t e r n a l _ i d :   [ t a r g e t U s e r I d ]  
                 } ,  
                 h e a d i n g s :   {   e n :   t i t l e   } ,  
                 c o n t e n t s :   {   e n :   m e s s a g e   } ,  
                 u r l :   w i n d o w . l o c a t i o n . o r i g i n  
             } )  
         } ) ;  
         i f   ( ! r e s p o n s e . o k )   {  
             c o n s t   e r r o r T e x t   =   a w a i t   r e s p o n s e . t e x t ( ) ;  
             c o n s o l e . e r r o r ( ' [ O n e S i g n a l ]   E r r o r   s e n d i n g   p u s h : ' ,   e r r o r T e x t ) ;  
         }  
     }   c a t c h   ( e r r )   {  
         c o n s o l e . e r r o r ( ' [ O n e S i g n a l ]   N e t w o r k   e r r o r   s e n d i n g   p u s h : ' ,   e r r ) ;  
     }  
 }  
 