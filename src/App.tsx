import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { AppShell } from './components/layout/AppShell';
import { AlertCircle, RefreshCw } from 'lucide-react';

// ─── Error Boundary Component para evitar pantallas negras ───
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props: ErrorBoundaryProps;
  state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[React ErrorBoundary caught error]:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 mb-4 text-rose-400">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold mb-2">Ha ocurrido un error en la aplicación</h2>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            {this.state.error?.message || 'Error inesperado de renderizado.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Recargar Portal
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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
      const handleAuth = async () => {
        try {
          if (currentUser) {
            await OneSignal.login(currentUser.uid);
            OneSignal.User.addTag('uid', currentUser.uid);
            
            // Log diagnostic info
            setTimeout(() => {
              console.log('[OneSignal Debug] User ID logged in:', currentUser.uid);
              console.log('[OneSignal Debug] Opted In:', OneSignal.User.PushSubscription.optedIn);
              console.log('[OneSignal Debug] Subscription ID:', OneSignal.User.PushSubscription.id);
              console.log('[OneSignal Debug] External ID in OneSignal:', OneSignal.User.externalId);
            }, 3000);

            OneSignal.Slidedown.promptPush();
          } else {
            await OneSignal.logout();
          }
        } catch (err) {
          console.error('[OneSignal] Auth Error:', err);
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
    <ErrorBoundary>
      <AuthProvider>
        <AppGate />
      </AuthProvider>
    </ErrorBoundary>
  );
}
