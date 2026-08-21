import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';
import { getUserProfile, checkAndSeedSupabase } from '../services/supabaseService';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Timeout de seguridad para evitar pantallas de carga bloqueadas por red
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 800);

    // Escuchar cambios en sesión de Supabase Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      clearTimeout(fallbackTimer);
      if (session?.user) {
        let profile = await getUserProfile(session.user.id);
        if (!profile) {
          console.log('[Auth] Creando perfil faltante para:', session.user.email);
          const newProfile: UserProfile = {
            uid: session.user.id,
            email: session.user.email || '',
            displayName: session.user.email?.startsWith('sistemas') ? 'Eduardo Toro' : 'Gerente de Sistemas',
            role: session.user.email?.startsWith('sistemas') ? 'analyst' : 'admin',
            title: session.user.email?.startsWith('sistemas') ? 'Analista IT' : 'Gerencia IT',
            organizationId: 'org_sistemas_main'
          };
          const { upsertUserProfile } = await import('../services/supabaseService');
          await upsertUserProfile(newProfile);
          profile = newProfile;
        }

        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    setAuthError(null);
    setLoading(true);
    try {
      // 1. Login normal en Supabase Auth → produce un uid REAL y único
      //    (session.user.id) vía onAuthStateChange.
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data?.user) {
        return;
      }

      // 2. Si el usuario no existía aún, intentar registrarlo en Supabase Auth.
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email, password });
      if (!signUpErr && signUpData?.session) {
        console.log('[Auth] Usuario registrado y sesión activa en Supabase Auth:', email);
        return;
      }

      // 3. Sin sesión real de Supabase => NO iniciamos con identidad falsa.
      //    (Se eliminó el fallback con uid hardcodeado del seed de desarrollo:
      //     compartía identidad entre usuarios y rompía el targeting de push.)
      setCurrentUser(null);
      setAuthError(
        error?.message ||
        signUpErr?.message ||
        'No se pudo iniciar sesión. Verifica tu correo y contraseña.'
      );
    } catch (err: any) {
      setCurrentUser(null);
      setAuthError(err?.message || 'Error de conexión al iniciar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al actualizar la contraseña' };
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, loading, authError, signIn, signOut, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
