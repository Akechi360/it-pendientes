import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { CreateTaskModal } from '../tasks/CreateTaskModal';
import { CreateIncidentModal } from '../incidents/CreateIncidentModal';
import { CreateProjectModal } from '../projects/CreateProjectModal';
import { CreateMeetingModal } from '../meetings/CreateMeetingModal';
import { TaskDetailModal } from '../tasks/TaskDetailModal';
import { IncidentDetailModal } from '../incidents/IncidentDetailModal';
import { ProjectDetailModal } from '../projects/ProjectDetailModal';
import { UserProfileModal } from '../profile/UserProfileModal';
import { useApp } from '../../context/AppContext';

import { DashboardView } from '../dashboard/DashboardView';
import { TasksView } from '../tasks/TasksView';
import { ProjectsView } from '../projects/ProjectsView';
import { IncidentsView } from '../incidents/IncidentsView';
import { MeetingsView } from '../meetings/MeetingsView';
import { CalendarView } from '../calendar/CalendarView';
import { DocumentsView } from '../documents/DocumentsView';
import { AssetsView } from '../assets/AssetsView';
import { RenewalsView } from '../renewals/RenewalsView';
import { FilesView } from '../files/FilesView';
import { AuditLogView } from '../audit/AuditLogView';

import { useAuth } from '../../context/AuthContext';

export const AppShell: React.FC = () => {
  const { activeTab, toastMessage } = useApp();
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen font-sans flex transition-colors bg-canvas text-content-primary">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-[1920px] w-full mx-auto custom-scrollbar">
          {activeTab === 'dashboard'  && <DashboardView />}
          {activeTab === 'tasks'      && <TasksView />}
          {activeTab === 'projects'   && isAdmin && <ProjectsView />}
          {activeTab === 'incidents'  && <IncidentsView />}
          {activeTab === 'meetings'   && <MeetingsView />}
          {activeTab === 'calendar'   && <CalendarView />}
          {activeTab === 'documents'  && <DocumentsView />}
          {activeTab === 'assets'     && <AssetsView />}
          {activeTab === 'renewals'   && <RenewalsView />}
          {activeTab === 'files'      && <FilesView />}
          {activeTab === 'audit'      && isAdmin && <AuditLogView />}
          
          {/* Fallback para analistas que intentan entrar a URLs protegidas por tab state */}
          {(activeTab === 'projects' || activeTab === 'audit') && !isAdmin && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8 rounded-2xl border border-border-subtle bg-surface">
                <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-content-primary mb-2">Acceso Denegado</h3>
                <p className="text-sm text-content-secondary max-w-md">
                  Tu rol de Analista IT no tiene permisos para visualizar este módulo.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <CommandPalette />
      
      {/* Specific Creation Modals */}
      <CreateTaskModal />
      <CreateIncidentModal />
      <CreateProjectModal />
      <CreateMeetingModal />
      
      <UserProfileModal />
      
      {/* Global Entity Modals */}
      <TaskDetailModal />
      <IncidentDetailModal />
      <ProjectDetailModal />

      {/* Toast notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className={`px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 font-semibold text-xs
              ${toastMessage.type === 'success' ? 'bg-surface/95 border-emerald-500/40 text-emerald-400' :
                toastMessage.type === 'error'   ? 'bg-surface/95 border-rose-500/40 text-rose-400' :
                toastMessage.type === 'warning' ? 'bg-surface/95 border-amber-500/40 text-amber-400' :
                'bg-surface/95 border-cyan-500/40 text-cyan-400'
              }`}
            >
              {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
              {toastMessage.type === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0" />}
              {toastMessage.type !== 'success' && toastMessage.type !== 'error' && toastMessage.type !== 'warning' && <Info className="w-4 h-4 shrink-0" />}
              <span className="font-mono">{toastMessage.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
