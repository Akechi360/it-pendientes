import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { QuickCreateModal } from './components/layout/QuickCreateModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { ProjectsView } from './components/projects/ProjectsView';
import { IncidentsView } from './components/incidents/IncidentsView';
import { MeetingsView } from './components/meetings/MeetingsView';
import { CalendarView } from './components/calendar/CalendarView';
import { DocumentsView } from './components/documents/DocumentsView';
import { AssetsView } from './components/assets/AssetsView';
import { RenewalsView } from './components/renewals/RenewalsView';
import { FilesView } from './components/files/FilesView';
import { AuditLogView } from './components/audit/AuditLogView';

// ─── Layout principal (solo se monta si el usuario está autenticado) ───
const MainLayout: React.FC = () => {
  const { activeTab, toastMessage, isDarkTheme } = useApp();

  return (
    <div className={`min-h-screen font-sans flex transition-colors ${
      isDarkTheme ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard'  && <DashboardView />}
          {activeTab === 'tasks'      && <TasksView />}
          {activeTab === 'projects'   && <ProjectsView />}
          {activeTab === 'incidents'  && <IncidentsView />}
          {activeTab === 'meetings'   && <MeetingsView />}
          {activeTab === 'calendar'   && <CalendarView />}
          {activeTab === 'documents'  && <DocumentsView />}
          {activeTab === 'assets'     && <AssetsView />}
          {activeTab === 'renewals'   && <RenewalsView />}
          {activeTab === 'files'      && <FilesView />}
          {activeTab === 'audit'      && <AuditLogView />}
        </main>
      </div>

      <CommandPalette />
      <QuickCreateModal />

      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 font-semibold text-xs font-mono ${
            toastMessage.type === 'success' ? 'bg-emerald-500 text-slate-950 border-emerald-400' :
            toastMessage.type === 'error'   ? 'bg-rose-500 text-white border-rose-400' :
            toastMessage.type === 'warning' ? 'bg-amber-500 text-slate-950 border-amber-400' :
            'bg-slate-900 text-cyan-400 border-cyan-500'
          }`}>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Pantalla de carga global ───
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
    <div className="w-10 h-10 border-2 border-slate-800 border-t-cyan-500 rounded-full animate-spin" />
    <p className="text-slate-500 text-sm font-mono">Conectando con el servidor...</p>
  </div>
);

// ─── Puerta de autenticación ───
const AppGate: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!currentUser) return <LoginPage />;

  return (
    <AppProvider>
      <MainLayout />
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
