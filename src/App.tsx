import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { AppShell } from './components/layout/AppShell';

// ─── Pantalla de carga global ───
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-4">
    <div className="w-8 h-8 border-2 border-border-subtle border-t-cyan-500 rounded-full animate-spin" />
    <p className="text-content-muted text-sm font-mono">Autenticando...</p>
  </div>
);

// ─── Puerta de autenticación ───
const AppGate: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!currentUser) return <LoginPage />;

  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
};

// ─── Raíz de la aplicación ───
export default function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}
