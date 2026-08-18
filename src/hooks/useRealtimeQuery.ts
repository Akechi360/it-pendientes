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
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) {
        console.warn(`[TanStack] Error fetch para ${tableName}:`, error.message);
        throw new Error(error.message);
      }
      return data ? data.map((row) => toCamel<T>(row as Record<string, unknown>)) : [];
    },
  });

  useEffect(() => {
    // Suscripción realtime (Postgres Changes)
    const channel = supabase
      .channel(`rt:${tableName}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        () => {
          // Invalidate cache to trigger a refetch
          // This is the safest way to ensure data is perfectly in sync
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn(`[TanStack] Error en canal realtime para ${tableName}.`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, queryClient]); // Removed queryKey from dependencies to avoid loop, it's derived

  return query;
}
