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
    // Escuchar cambios en sesión de Supabase Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        let profile = await getUserProfile(session.user.id);
        if (!profile) {
          console.log('[Auth] Creando perfil faltante para:', session.user.email);
          const newProfile: UserProfile = {
            uid: session.user.id,
            email: session.user.email || '',
            displayName: session.user.email?.includes('sistemas') ? 'Eduardo Toro' : (session.user.email?.split('@')[0] || 'Usuario IT'),
            role: session.user.email?.includes('sistemas') ? 'analyst' : 'admin',
            title: session.user.email?.includes('sistemas') ? 'Analista IT' : 'Jefe de Sistemas',
            organizationId: 'org_sistemas_main'
          };
          // Import y utiliza upsertUserProfile
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
