import {
  UserProfile,
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

export const DEFAULT_ORG_ID = 'org_sistemas_main';

export const SEED_USERS: UserProfile[] = [
  {
    uid: 'usr_admin_01',
    email: 'carlos.mendoza@empresa.com',
    displayName: 'Carlos Mendoza',
    role: 'admin',
    title: 'Jefe de Sistemas & Infraestructura',
    organizationId: DEFAULT_ORG_ID,
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'usr_analyst_02',
    email: 'roberto.gomez@empresa.com',
    displayName: 'Roberto Gómez',
    role: 'analyst',
    title: 'Analista de Sistemas / Soporte IT',
    organizationId: DEFAULT_ORG_ID,
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const today = new Date().toISOString().split('T')[0];

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export const SEED_TASKS: TaskItem[] = [
  {
    id: 'TASK-2026-0001',
    title: 'Renovación de Certificado SSL de Servidor Principal',
    description: '### Objetivo\nActualizar el certificado Wildcard SSL (`*.empresa.com`) en el proxy inverso Nginx antes de la fecha de expiración.\n\n### Pasos Requeridos:\n1. Generar la solicitud CSR en el servidor web.\n2. Descargar archivos de certificado desde el proveedor SSL.\n3. Reemplazar `server.crt` y `server.key` en `/etc/nginx/ssl/`.\n4. Probar configuración con `nginx -t` y reiniciar servicio.',
    status: 'en_progreso',
    priority: 'critica',
    category: 'seguridad',
    assigneeId: 'usr_admin_01',
    assigneeName: 'Carlos Mendoza',
    creatorId: 'usr_admin_01',
    creatorName: 'Carlos Mendoza',
    projectId: 'PROJ-2026-0001',
    projectTitle: 'Actualización de Seguridad e Infraestructura 2026',
    dueDate: dateOffset(2),
    dueTime: '17:00',
    startDate: dateOffset(-1),
    estimatedHours: 4,
    actualHours: 2,
    tags: ['SSL', 'Nginx', 'Seguridad', 'Crítico'],
    checklist: [
      { id: 'chk_1', title: 'Generar CSR y Private Key', completed: true },
      { id: 'chk_2', title: 'Comprar y verificar dominio en DigiCert', completed: true },
      { id: 'chk_3', title: 'Instalar archivo bundle en Nginx', completed: false },
      { id: 'chk_4', title: 'Verificar HTTPS con SSL Labs test', completed: false }
    ],
    comments: [
      {
        id: 'cm_1',
        authorId: 'usr_analyst_02',
        authorName: 'Roberto Gómez',
        content: 'CSR generado y compartido en la carpeta de seguridad.',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ],
    recurrence: 'anual',
    isBlocked: false,
    isFocused: true,
    isArchived: false,
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TASK-2026-0002',
    title: 'Mantenimiento Preventivo Servidor de Base de Datos PostgreSQL',
    description: 'Ejecutar vacuado completo (`VACUUM FULL`), optimización de índices y respaldos de prueba en frío del clúster de base de datos.',
    status: 'pendiente',
    priority: 'alta',
    category: 'base_de_datos',
    assigneeId: 'usr_analyst_02',
    assigneeName: 'Roberto Gómez',
    creatorId: 'usr_admin_01',
    creatorName: 'Carlos Mendoza',
    projectId: 'PROJ-2026-0002',
    projectTitle: 'Plan de Alta Disponibilidad DB',
    dueDate: dateOffset(4),
    dueTime: '23:00',
    estimatedHours: 3,
    tags: ['PostgreSQL', 'Mantenimiento', 'DBA'],
    checklist: [
      { id: 'chk_21', title: 'Notificar ventana de mantenimiento a la empresa', completed: false },
      { id: 'chk_22', title: 'Ejecutar script pg_dumpall', completed: false },
      { id: 'chk_23', title: 'Verificar logs de replicación', completed: false }
    ],
    comments: [],
    recurrence: 'mensual',
    isBlocked: false,
    isFocused: true,
    isArchived: false,
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TASK-2026-0003',
    title: 'Auditoría de Accesos y Cuentas de Usuarios Inactivos',
    description: 'Depuración de usuarios en Active Directory / Google Workspace que hayan estado inactivos por más de 30 días.',
    status: 'completada',
    priority: 'media',
    category: 'seguridad',
    assigneeId: 'usr_analyst_02',
    assigneeName: 'Roberto Gómez',
    creatorId: 'usr_admin_01',
    creatorName: 'Carlos Mendoza',
    dueDate: dateOffset(-1),
    dueTime: '12:00',
    estimatedHours: 2,
    actualHours: 2,
    tags: ['Auditoría', 'ActiveDirectory', 'Cuentas'],
    checklist: [
      { id: 'chk_31', title: 'Exportar lista de usuarios sin login en 30 días', completed: true },
      { id: 'chk_32', title: 'Confirmar bajas con Recursos Humanos', completed: true },
      { id: 'chk_33', title: 'Desactivar licencias y suspender cuentas', completed: true }
    ],
    comments: [],
    recurrence: 'mensual',
    isBlocked: false,
    isFocused: false,
    isArchived: false,
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TASK-2026-0004',
    title: 'Configuración de VLAN de Telefonía IP en Switch Core',
    description: 'Aislar tráfico de voz en la VLAN 30 para mejorar calidad de llamadas VoIP.',
    status: 'bloqueada',
    priority: 'alta',
    category: 'redes',
    assigneeId: 'usr_analyst_02',
    assigneeName: 'Roberto Gómez',
    creatorId: 'usr_admin_01',
    creatorName: 'Carlos Mendoza',
    dueDate: dateOffset(1),
    dueTime: '15:00',
    estimatedHours: 5,
    tags: ['Cisco', 'VLAN', 'VoIP', 'Switches'],
    checklist: [
      { id: 'chk_41', title: 'Mapear puertos de switches de piso', completed: true },
      { id: 'chk_42', title: 'Configurar trunking en Cisco 3850', completed: false }
    ],
    comments: [
      {
        id: 'cm_41',
        authorId: 'usr_analyst_02',
        authorName: 'Roberto Gómez',
        content: 'Bloqueado a la espera de confirmación de ventana de reinicio por la gerencia.',
        createdAt: new Date().toISOString()
      }
    ],
    isBlocked: true,
    blockReason: 'A espera de aprobación de ventana de corte de red por Operaciones',
    blockedBy: 'Roberto Gómez',
    isFocused: false,
    isArchived: false,
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const SEED_PROJECTS: ProjectItem[] = [
  {
    id: 'PROJ-2026-0001',
    name: 'Actualización de Seguridad e Infraestructura 2026',
    description: 'Renovación de servidores físicos, hardening de firewalls Fortinet, migración a TLS 1.3 e implementación de autenticación de dos factores (2FA) obligatoria.',
    status: 'activo',
    priority: 'critica',
    leadId: 'usr_admin_01',
    leadName: 'Carlos Mendoza',
    participants: ['Carlos Mendoza', 'Roberto Gómez'],
    progress: 65,
    startDate: dateOffset(-30),
    targetDate: dateOffset(45),
    objectives: 'Alcanzar estándar de ciberseguridad corporativa ISO 27001.',
    scope: 'Firewalls, Active Directory, Servidores Web, Proxy Inverso y VPNs.',
    risks: 'Posible breve interrupción de VPN durante migración de certificados.',
    budget: 15000,
    tags: ['Ciberseguridad', 'Infraestructura', 'Hardware'],
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PROJ-2026-0002',
    name: 'Plan de Alta Disponibilidad DB & Backups Inmutables',
    description: 'Implementación de réplica en caliente PostgreSQL con Patroni y almacenamiento de backups inmutables en Cloud Storage.',
    status: 'activo',
    priority: 'alta',
    leadId: 'usr_analyst_02',
    leadName: 'Roberto Gómez',
    participants: ['Carlos Mendoza', 'Roberto Gómez'],
    progress: 40,
    startDate: dateOffset(-15),
    targetDate: dateOffset(30),
    objectives: 'RTO < 15 minutos y RPO < 5 minutos para bases de datos críticas.',
    tags: ['PostgreSQL', 'Backups', 'AltaDisponibilidad'],
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const SEED_INCIDENTS: IncidentItem[] = [
  {
    id: 'INC-2026-0001',
    title: 'Falla de Conectividad con Impresora de Gerencia General',
    description: 'La impresora multifuncional HP LaserJet Enterprise no responde a peticiones de impresión en la red local (IP 192.168.1.150).',
    category: 'impresora',
    impact: 'media',
    urgency: 'alta',
    priority: 'alta',
    status: 'en_progreso',
    requester: 'María Fernanda (Secretaría de Dirección)',
    assigneeId: 'usr_analyst_02',
    assigneeName: 'Roberto Gómez',
    assetId: 'AST-2026-0003',
    assetName: 'HP LaserJet Enterprise M507',
    slaDueDate: dateOffset(0) + 'T18:00:00',
    comments: [
      {
        id: 'cm_inc_1',
        authorId: 'usr_analyst_02',
        authorName: 'Roberto Gómez',
        content: 'Se realizó ping sin respuesta. Se procederá a revisar el cable de red en el patch panel.',
        createdAt: new Date().toISOString()
      }
    ],
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'INC-2026-0002',
    title: 'Lentitud Generalizada en Enlace de Internet Principal',
    description: 'Pérdida de paquetes del 12% en el enlace de fibra óptica primario con el proveedor Claro.',
    category: 'internet',
    impact: 'alta',
    urgency: 'critica',
    priority: 'critica',
    status: 'esperando_proveedor',
    requester: 'Dpto. de Operaciones',
    assigneeId: 'usr_admin_01',
    assigneeName: 'Carlos Mendoza',
    diagnosis: 'Atenuación alta en tramo externo de fibra óptica.',
    slaDueDate: dateOffset(0) + 'T16:00:00',
    comments: [],
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const SEED_MEETINGS: MeetingItem[] = [
  {
    id: 'MEET-2026-0001',
    title: 'Reunión Semanal de Alineación Técnica e Infraestructura',
    objective: 'Revisar estado de tareas semanales, avance de proyectos y renovaciones pendientes.',
    startTime: `${today}T10:00`,
    endTime: `${today}T11:00`,
    participants: ['Carlos Mendoza', 'Roberto Gómez'],
    modality: 'presencial',
    location: 'Sala de Juntas IT',
    agenda: '1. Revisión de incidencias SLA\n2. Renovaciones de SSL y Dominios\n3. Avance de migración DB',
    notes: 'Se aprueba la compra de licencias Antivirus corporativo.',
    decisions: 'Migrar el mantenimiento de BD para el sábado a las 23:00 hrs.',
    commitments: ['Crear orden de compra para renovación de dominio empresa.com', 'Notificar mantenimiento de BD a Gerencia'],
    status: 'programada',
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date().toISOString()
  },
  {
    id: 'MEET-2026-0002',
    title: 'Comité de Cambio (CAB) - Despliegue de Nuevo Firewall',
    objective: 'Evaluar riesgos de corte de red para la actualización del firmware del FortiGate 100F.',
    startTime: `${dateOffset(3)}T16:00`,
    endTime: `${dateOffset(3)}T17:00`,
    participants: ['Carlos Mendoza', 'Roberto Gómez', 'Gerente de Operaciones'],
    modality: 'hibrida',
    location: 'Google Meet / Sala IT',
    status: 'programada',
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date().toISOString()
  }
];

export const SEED_DOCUMENTS: DocumentItem[] = [
  {
    id: 'DOC-2026-0001',
    title: 'Runbook: Procedimiento de Conmutación por Error (Failover) de BD PostgreSQL',
    content: `# Runbook de Failover de Base de Datos PostgreSQL

## Propósito
Este documento describe el procedimiento paso a paso para ejecutar la conmutación por error en caso de fallo del nodo primario de base de datos.

## Procedimiento

### 1. Verificación del Estado del Clúster
Verificar el estado del servicio Patroni ejecutando:
\`\`\`bash
patronictl -c /etc/patroni/patroni.yml list
\`\`\`

### 2. Promoción Manual de Nodo Standby
Si el nodo máster no responde y el cuórum no fue automático:
\`\`\`bash
patronictl -c /etc/patroni/patroni.yml failover
\`\`\`

### 3. Verificación de Aplicación
Confirmar conexión desde la aplicación con la URL virtual de réplica.
`,
    space: 'Runbooks',
    status: 'publicado',
    authorId: 'usr_admin_01',
    authorName: 'Carlos Mendoza',
    isFavorite: true,
    tags: ['Runbook', 'PostgreSQL', 'Failover', 'BD'],
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'DOC-2026-0002',
    title: 'Política de Contraseñas y Seguridad de Cuentas de Servidores',
    content: `# Política de Seguridad de Credenciales

1. Mínimo 16 caracteres alfanuméricos con caracteres especiales.
2. Cambio obligatorio cada 90 días.
3. Almacenamiento exclusivo en el Gestor de Secretos Corporativo.
4. Prohibido almacenar contraseñas en código fuente o archivos de texto plano.`,
    space: 'Politicas',
    status: 'publicado',
    authorId: 'usr_admin_01',
    authorName: 'Carlos Mendoza',
    isFavorite: true,
    tags: ['Seguridad', 'Política', 'Password'],
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const SEED_ASSETS: AssetItem[] = [
  {
    id: 'AST-2026-0001',
    name: 'Servidor Dell PowerEdge R740 - BD Master',
    type: 'servidor',
    brandModel: 'Dell PowerEdge R740',
    serialNumber: 'SRV-DL-99210',
    tagCode: 'ACT-IT-001',
    status: 'activo',
    assignedTo: 'Infraestructura / BD',
    location: 'Rack 02 - Data Center Principal',
    purchaseDate: '2024-03-15',
    warrantyExpiration: '2027-03-15',
    notes: '64GB RAM, 2x Intel Xeon, 4TB SSD RAID 10',
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date().toISOString()
  },
  {
    id: 'AST-2026-0002',
    name: 'Firewall Fortinet FortiGate 100F',
    type: 'router',
    brandModel: 'Fortinet FortiGate 100F',
    serialNumber: 'FGT100F-882193',
    tagCode: 'ACT-IT-002',
    status: 'activo',
    assignedTo: 'Redes y Ciberseguridad',
    location: 'Rack 01 - Data Center Principal',
    purchaseDate: '2023-08-20',
    warrantyExpiration: '2026-08-20',
    notes: 'Firewall perimetral principal con UTM activo',
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date().toISOString()
  },
  {
    id: 'AST-2026-0003',
    name: 'HP LaserJet Enterprise M507 - Impresora Dirección',
    type: 'impresora',
    brandModel: 'HP M507',
    serialNumber: 'CND820192',
    tagCode: 'ACT-IT-003',
    status: 'mantenimiento',
    assignedTo: 'Secretaría de Dirección',
    location: 'Piso 2 - Dirección',
    purchaseDate: '2022-11-10',
    warrantyExpiration: '2025-11-10',
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date().toISOString()
  }
];

export const SEED_RENEWALS: RenewalItem[] = [
  {
    id: 'REN-2026-0001',
    title: 'Dominio Corporativo Principal (empresa.com)',
    type: 'dominio',
    vendor: 'Namecheap / GoDaddy',
    status: 'proximo_a_renovar',
    cost: 45,
    renewalDate: dateOffset(12),
    frequency: 'anual',
    responsibleId: 'usr_admin_01',
    responsibleName: 'Carlos Mendoza',
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date().toISOString()
  },
  {
    id: 'REN-2026-0002',
    title: 'Licencias Google Workspace Business (25 usuarios)',
    type: 'suscripcion_saas',
    vendor: 'Google Cloud Partner',
    status: 'activo',
    cost: 3600,
    renewalDate: dateOffset(60),
    frequency: 'anual',
    responsibleId: 'usr_admin_01',
    responsibleName: 'Carlos Mendoza',
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date().toISOString()
  },
  {
    id: 'REN-2026-0003',
    title: 'Certificado SSL Wildcard *.empresa.com',
    type: 'certificado_ssl',
    vendor: 'DigiCert',
    status: 'proximo_a_renovar',
    cost: 220,
    renewalDate: dateOffset(5),
    frequency: 'anual',
    responsibleId: 'usr_admin_01',
    responsibleName: 'Carlos Mendoza',
    organizationId: DEFAULT_ORG_ID,
    createdAt: new Date().toISOString()
  }
];

export const SEED_LOGS: ActivityLogItem[] = [
  {
    id: 'log_1',
    actorId: 'usr_admin_01',
    actorName: 'Carlos Mendoza',
    actorRole: 'admin',
    action: 'Creación de Tarea',
    module: 'Tareas',
    entityId: 'TASK-2026-0001',
    entityTitle: 'Renovación de Certificado SSL de Servidor Principal',
    details: 'Se creó la tarea con prioridad crítica y asignada a Carlos Mendoza.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    organizationId: DEFAULT_ORG_ID
  },
  {
    id: 'log_2',
    actorId: 'usr_analyst_02',
    actorName: 'Roberto Gómez',
    actorRole: 'analyst',
    action: 'Comentario en Incidencia',
    module: 'Incidencias',
    entityId: 'INC-2026-0001',
    entityTitle: 'Falla de Conectividad con Impresora de Gerencia General',
    details: 'Se actualizó el estado de la revisión del cableado físico.',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    organizationId: DEFAULT_ORG_ID
  }
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    userId: 'usr_admin_01',
    title: 'Alerta de Renovación SSL',
    message: 'El certificado SSL para *.empresa.com vence en 5 días.',
    linkModule: 'renewals',
    linkEntityId: 'REN-2026-0003',
    isRead: false,
    createdAt: new Date().toISOString(),
    organizationId: DEFAULT_ORG_ID
  },
  {
    id: 'notif_2',
    userId: 'usr_analyst_02',
    title: 'Tarea Asignada',
    message: 'Se te ha asignado la tarea Mantenimiento Preventivo PostgreSQL.',
    linkModule: 'tasks',
    linkEntityId: 'TASK-2026-0002',
    isRead: false,
    createdAt: new Date().toISOString(),
    organizationId: DEFAULT_ORG_ID
  }
];

export const SEED_FILES: FileItem[] = [
  {
    id: 'file_1',
    name: 'Cotizacion_Servidor_Dell_2026.pdf',
    size: 245000,
    type: 'application/pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    module: 'renewals',
    entityId: 'REN-2026-0001',
    entityTitle: 'Cotización Hardware',
    uploadedBy: 'Carlos Mendoza',
    createdAt: new Date().toISOString(),
    organizationId: DEFAULT_ORG_ID
  }
];
