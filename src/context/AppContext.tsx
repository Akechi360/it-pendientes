import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TaskItem,
  ProjectItem,
  IncidentItem,
  MeetingItem,
  DocumentItem,
  AssetItem,
  RenewalItem,
  ActivityLogItem,
  NotificationItem,
  FileItem
} from '../types';
import { useRealtimeQuery } from '../hooks/useRealtimeQuery';

export type ActiveTab =
  | 'dashboard'
  | 'tasks'
  | 'projects'
  | 'incidents'
  | 'calendar'
  | 'meetings'
  | 'documents'
  | 'assets'
  | 'renewals'
  | 'files'
  | 'audit'
  | 'notifications';

export type QuickCreateType = 'task' | 'incident' | 'meeting' | 'project' | 'document' | 'asset' | 'renewal' | 'file';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isDarkTheme: boolean;
  toggleTheme: () => void;
  
  // Real-time Collections
  tasks: TaskItem[];
  projects: ProjectItem[];
  incidents: IncidentItem[];
  meetings: MeetingItem[];
  documents: DocumentItem[];
  assets: AssetItem[];
  renewals: RenewalItem[];
  activityLogs: ActivityLogItem[];
  notifications: NotificationItem[];
  files: FileItem[];

  // Modals & Panels
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isQuickCreateOpen: boolean;
  setIsQuickCreateOpen: (open: boolean) => void;
  quickCreateType: QuickCreateType;
  openQuickCreate: (type: QuickCreateType) => void;

  // Selected Detail Modal
  selectedTask: TaskItem | null;
  setSelectedTask: (task: TaskItem | null) => void;
  selectedProject: ProjectItem | null;
  setSelectedProject: (project: ProjectItem | null) => void;
  selectedIncident: IncidentItem | null;
  setSelectedIncident: (incident: IncidentItem | null) => void;

  // Toast System
  toast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);

  // TanStack Query Realtime Collections
  const { data: tasks = [] } = useRealtimeQuery<TaskItem>('tasks');
  const { data: projects = [] } = useRealtimeQuery<ProjectItem>('projects');
  const { data: incidents = [] } = useRealtimeQuery<IncidentItem>('incidents');
  const { data: meetings = [] } = useRealtimeQuery<MeetingItem>('meetings');
  const { data: documents = [] } = useRealtimeQuery<DocumentItem>('documents');
  const { data: assets = [] } = useRealtimeQuery<AssetItem>('assets');
  const { data: renewals = [] } = useRealtimeQuery<RenewalItem>('renewals');
  const { data: activityLogs = [] } = useRealtimeQuery<ActivityLogItem>('activity_logs');
  const { data: notifications = [] } = useRealtimeQuery<NotificationItem>('notifications');
  const { data: files = [] } = useRealtimeQuery<FileItem>('files');

  // Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState<boolean>(false);
  const [quickCreateType, setQuickCreateType] = useState<QuickCreateType>('task');

  // Selected Details
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const toast = (text: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const toggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
  };

  const openQuickCreate = (type: QuickCreateType) => {
    setQuickCreateType(type);
    setIsQuickCreateOpen(true);
  };

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (!isQuickCreateOpen && !isCommandPaletteOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          openQuickCreate('task');
        } else if (e.key === 't' || e.key === 'T') {
          e.preventDefault();
          openQuickCreate('task');
        } else if (e.key === 'i' || e.key === 'I') {
          e.preventDefault();
          openQuickCreate('incident');
        } else if (e.key === 'm' || e.key === 'M') {
          e.preventDefault();
          openQuickCreate('meeting');
        } else if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          openQuickCreate('project');
        } else if (e.key === '/') {
          e.preventDefault();
          setIsCommandPaletteOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickCreateOpen, isCommandPaletteOpen]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        searchTerm,
        setSearchTerm,
        isDarkTheme,
        toggleTheme,
        tasks,
        projects,
        incidents,
        meetings,
        documents,
        assets,
        renewals,
        activityLogs,
        notifications,
        files,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isQuickCreateOpen,
        setIsQuickCreateOpen,
        quickCreateType,
        openQuickCreate,
        selectedTask,
        setSelectedTask,
        selectedProject,
        setSelectedProject,
        selectedIncident,
        setSelectedIncident,
        toast,
        toastMessage
      }}
    >
      <div className={isDarkTheme ? 'dark bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-cyan-500 selection:text-slate-950' : 'bg-slate-50 text-slate-900 min-h-screen font-sans selection:bg-cyan-500 selection:text-slate-950'}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
