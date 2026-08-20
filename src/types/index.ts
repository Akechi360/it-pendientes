export type UserRole = 'admin' | 'analyst';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  title: string;
  organizationId: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TaskStatus = 'backlog' | 'pendiente' | 'en_progreso' | 'bloqueada' | 'en_revision' | 'completada' | 'cancelada';
export type PriorityLevel = 'baja' | 'media' | 'alta' | 'critica';
export type TaskCategory = 
  | 'soporte' 
  | 'infraestructura' 
  | 'redes' 
  | 'desarrollo' 
  | 'seguridad' 
  | 'base_de_datos' 
  | 'compras' 
  | 'documentacion' 
  | 'administracion' 
  | 'proyecto'
  | 'otro';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface CommentItem {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface TaskItem {
  id: string; // e.g. TASK-2026-0001
  title: string;
  description: string;
  status: TaskStatus;
  priority: PriorityLevel;
  category: TaskCategory;
  assigneeId: string;
  assigneeName: string;
  creatorId: string;
  creatorName: string;
  projectId?: string;
  projectTitle?: string;
  incidentId?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  checklist: ChecklistItem[];
  comments: CommentItem[];
  recurrence?: 'ninguna' | 'diaria' | 'semanal' | 'mensual' | 'anual';
  isBlocked: boolean;
  blockReason?: string;
  blockedBy?: string;
  isFocused?: boolean;
  isArchived?: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'planificacion' | 'activo' | 'pausado' | 'bloqueado' | 'finalizado' | 'cancelado';

export interface ProjectItem {
  id: string; // e.g. PROJ-2026-0001
  name: string;
  description: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  leadId: string;
  leadName: string;
  participants: string[];
  progress: number; // 0 to 100
  startDate: string;
  targetDate: string;
  realDate?: string;
  objectives?: string;
  scope?: string;
  risks?: string;
  budget?: number;
  tags?: string[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export type IncidentCategory = 
  | 'hardware' 
  | 'software' 
  | 'red' 
  | 'internet' 
  | 'impresora' 
  | 'correo' 
  | 'usuario' 
  | 'servidor' 
  | 'seguridad' 
  | 'telefonia' 
  | 'aplicacion' 
  | 'otro';

export type IncidentStatus = 
  | 'abierta' 
  | 'asignada' 
  | 'en_progreso' 
  | 'esperando_usuario' 
  | 'esperando_proveedor' 
  | 'resuelta' 
  | 'cerrada' 
  | 'cancelada';

export interface IncidentItem {
  id: string; // e.g. INC-2026-0001
  title: string;
  description: string;
  category: IncidentCategory;
  impact: PriorityLevel;
  urgency: PriorityLevel;
  priority: PriorityLevel;
  status: IncidentStatus;
  requester: string;
  assigneeId: string;
  assigneeName: string;
  assetId?: string;
  assetName?: string;
  diagnosis?: string;
  solution?: string;
  rootCause?: string;
  slaDueDate: string;
  comments: CommentItem[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export type MeetingStatus = 'programada' | 'realizada' | 'cancelada' | 'reprogramada';
export type MeetingModality = 'presencial' | 'remota' | 'hibrida';

export interface MeetingItem {
  id: string; // e.g. MEET-2026-0001
  title: string;
  objective: string;
  startTime: string; // ISO date string or YYYY-MM-DDTHH:mm
  endTime: string;
  participants: string[];
  modality: MeetingModality;
  location?: string;
  agenda?: string;
  notes?: string;
  decisions?: string;
  commitments?: string[];
  status: MeetingStatus;
  organizationId: string;
  createdAt: string;
}

export type DocumentSpace = 
  | 'Infraestructura' 
  | 'Redes' 
  | 'Seguridad' 
  | 'Desarrollo' 
  | 'Servidores' 
  | 'Procedimientos' 
  | 'Manuales' 
  | 'Runbooks' 
  | 'Postmortems' 
  | 'Politicas' 
  | 'General';

export type DocumentStatus = 'borrador' | 'publicado' | 'archivado';

export interface DocumentItem {
  id: string; // e.g. DOC-2026-0001
  title: string;
  content: string; // Markdown format
  space: DocumentSpace;
  parentId?: string;
  status: DocumentStatus;
  authorId: string;
  authorName: string;
  isFavorite?: boolean;
  tags: string[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export type AssetType = 
  | 'servidor' 
  | 'laptop' 
  | 'desktop' 
  | 'impresora' 
  | 'router' 
  | 'switch' 
  | 'access_point' 
  | 'biometrico' 
  | 'telefono_ip' 
  | 'licencia' 
  | 'dominio' 
  | 'ssl' 
  | 'cloud' 
  | 'suscripcion' 
  | 'otro';

export type AssetStatus = 'activo' | 'mantenimiento' | 'fuera_de_servicio' | 'retirado';

export interface AssetItem {
  id: string; // e.g. AST-2026-0001
  name: string;
  type: AssetType;
  tag?: string;
  tagCode?: string;
  brandModel?: string;
  serialNumber?: string;
  ipAddress?: string;
  status: AssetStatus;
  assignedTo?: string;
  location?: string;
  purchaseDate?: string;
  warrantyExpiration?: string;
  notes?: string;
  organizationId: string;
  createdAt: string;
  updatedAt?: string;
}

export type RenewalType = 'dominio' | 'licencia' | 'certificado_ssl' | 'proveedor' | 'suscripcion_saas' | 'compra_hardware' | 'mantenimiento';
export type RenewalStatus = 'solicitado' | 'cotizando' | 'aprobado' | 'comprado' | 'activo' | 'proximo_a_renovar' | 'vencido' | 'cancelado';

export interface RenewalItem {
  id: string; // e.g. REN-2026-0001
  title: string;
  type: RenewalType;
  vendor: string;
  status: RenewalStatus;
  cost: number;
  renewalDate: string; // YYYY-MM-DD
  frequency: 'mensual' | 'trimestral' | 'anual' | 'bienal' | 'unico';
  responsibleId: string;
  responsibleName: string;
  organizationId: string;
  createdAt: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  module: 'tasks' | 'projects' | 'incidents' | 'documents' | 'assets' | 'renewals' | 'general';
  entityId?: string;
  entityTitle?: string;
  uploadedBy: string;
  createdAt: string;
  organizationId: string;
}

export interface ActivityLogItem {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  module: string;
  entityId: string;
  entityTitle: string;
  details: string;
  timestamp: string;
  organizationId: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  linkModule?: string;
  linkEntityId?: string;
  isRead: boolean;
  createdAt: string;
  organizationId: string;
}
