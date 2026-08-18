import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { QuickCreateModal } from './QuickCreateModal';
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

export const AppShell: React.FC = () => {
  const { activeTab, toastMessage } = useApp();

  return (
    <div className="min-h-screen font-sans flex transition-colors bg-canvas text-content-primary">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-[1920px] w-full mx-auto custom-scrollbar">
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
      <UserProfileModal />
      
      {/* Global Entity Modals */}
      <TaskDetailModal />
      <IncidentDetailModal />
      <ProjectDetailModal />

      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 font-semibold text-xs font-mono
            ${toastMessage.type === 'success' ? 'bg-surface border-emerald-500/50 text-emerald-400' :
              toastMessage.type === 'error'   ? 'bg-surface border-rose-500/50 text-rose-400' :
              toastMessage.type === 'warning' ? 'bg-surface border-amber-500/50 text-amber-400' :
              'bg-surface border-cyan-500/50 text-cyan-400'
            }`}
          >
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};
