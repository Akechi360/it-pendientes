import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Helpers de supabaseService para mapear a camelCase
function camelify(str: string): string {
  return str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

const TO_CAMEL_OVERRIDES: Record<string, string> = {
  photo_url: 'photoURL',
};

function toCamel<T>(obj: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(obj)) {
    out[TO_CAMEL_OVERRIDES[k] ?? camelify(k)] = obj[k];
  }
  return out as T;
}

export function useRealtimeQuery<T>(tableName: string) {
  const queryClient = useQueryClient();
  const queryKey = [tableName];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<T[]> => {
      try {
        const { data, error } = await supabase.from(tableName).select('*');
        if (error) {
          console.warn(`[TanStack] Error fetch para ${tableName}:`, error.message);
          return [];
        }
        return data ? data.map((row) => toCamel<T>(row as Record<string, unknown>)) : [];
      } catch (err) {
        console.warn(`[TanStack] Exception fetch para ${tableName}:`, err);
        return [];
      }
    },
  });

  useEffect(() => {
    // Generar un ID único por suscripción para evitar colisión de canales en Supabase Realtime
    const channelId = `rt:${tableName}:${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn(`[TanStack] Error en canal realtime para ${tableName}.`);
        }
      });

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        // Safe cleanup
      }
    };
  }, [tableName, queryClient]);

  return query;
}
