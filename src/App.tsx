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

const AppGate: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const isOneSignalInitPending = React.useRef(false);

  React.useEffect(() => {
    if (loading) return;
    import('react-onesignal').then(({ default: OneSignal }) => {
      const handleAuth = () => {
        if (currentUser) {
          OneSignal.login(currentUser.uid).then(() => {
            // Fuerza a OneSignal a mostrar el popup de pedir permisos si no los tiene
            OneSignal.Slidedown.promptPush();
          }).catch(console.error);
        } else {
          OneSignal.logout().catch(console.error);
        }
      };

      if (!OneSignal.initialized && !isOneSignalInitPending.current) {
        isOneSignalInitPending.current = true;
        OneSignal.init({
          appId: 'd1338b94-ffbe-4c72-8a96-b9ca075f7147',
          allowLocalhostAsSecureOrigin: true,
        }).then(() => {
          handleAuth();
        }).catch(err => {
          console.error(err);
          isOneSignalInitPending.current = false;
        });
      } else if (OneSignal.initialized) {
        handleAuth();
      }
    });
  }, [currentUser, loading]);

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
