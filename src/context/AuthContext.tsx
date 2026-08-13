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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Escuchar cambios en sesión de Supabase Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
          // Seed inicial de datos si las tablas están vacías
          await checkAndSeedSupabase();
        } else {
          // Usuario autenticado pero sin perfil en la tabla users — cierra sesión
          console.warn('[Auth] Usuario sin perfil en tabla users. Cerrando sesión.');
          await supabase.auth.signOut();
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    setAuthError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(
          error.message.includes('Invalid login credentials')
            ? 'Email o contraseña incorrectos. Verifica tus datos.'
            : error.message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, loading, authError, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
