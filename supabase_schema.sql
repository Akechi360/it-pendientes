-- ─────────────────────────────────────────────────────────────
-- SCRIPT DE INICIALIZACIÓN PARA SUPABASE
-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase
-- ─────────────────────────────────────────────────────────────

-- 1. Tabla: users
CREATE TABLE IF NOT EXISTS public.users (
  uid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'analyst',
  title TEXT,
  organization_id TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla: tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  category TEXT NOT NULL,
  assignee_id TEXT,
  assignee_name TEXT,
  creator_id TEXT,
  creator_name TEXT,
  project_id TEXT,
  project_title TEXT,
  incident_id TEXT,
  due_date DATE,
  due_time TEXT,
  start_date DATE,
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  tags TEXT[],
  checklist JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  recurrence TEXT,
  is_blocked BOOLEAN DEFAULT false,
  block_reason TEXT,
  blocked_by TEXT,
  is_focused BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  organization_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla: projects
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  lead_id TEXT,
  lead_name TEXT,
  participants TEXT[] DEFAULT '{}',
  progress NUMERIC DEFAULT 0,
  start_date DATE,
  target_date DATE,
  real_date DATE,
  objectives TEXT,
  scope TEXT,
  risks TEXT,
  budget NUMERIC,
  tags TEXT[] DEFAULT '{}',
  organization_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla: incidents
CREATE TABLE IF NOT EXISTS public.incidents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  impact TEXT,
  urgency TEXT,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  requester TEXT NOT NULL,
  assignee_id TEXT,
  assignee_name TEXT,
  asset_id TEXT,
  asset_name TEXT,
  diagnosis TEXT,
  solution TEXT,
  root_cause TEXT,
  sla_due_date DATE,
  comments JSONB DEFAULT '[]'::jsonb,
  organization_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla: meetings
CREATE TABLE IF NOT EXISTS public.meetings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  objective TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  participants TEXT[] DEFAULT '{}',
  modality TEXT NOT NULL,
  location TEXT,
  agenda TEXT,
  notes TEXT,
  decisions TEXT,
  commitments TEXT[] DEFAULT '{}',
  status TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla: documents
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  space TEXT NOT NULL,
  parent_id TEXT,
  status TEXT NOT NULL,
  author_id TEXT,
  author_name TEXT,
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  organization_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla: assets
CREATE TABLE IF NOT EXISTS public.assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  tag TEXT,
  tag_code TEXT,
  brand_model TEXT,
  serial_number TEXT,
  ip_address TEXT,
  status TEXT NOT NULL,
  assigned_to TEXT,
  location TEXT,
  purchase_date DATE,
  warranty_expiration DATE,
  notes TEXT,
  organization_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabla: renewals
CREATE TABLE IF NOT EXISTS public.renewals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  vendor TEXT NOT NULL,
  status TEXT NOT NULL,
  cost NUMERIC NOT NULL,
  renewal_date DATE NOT NULL,
  frequency TEXT NOT NULL,
  responsible_id TEXT,
  responsible_name TEXT,
  organization_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabla: files
CREATE TABLE IF NOT EXISTS public.files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  size NUMERIC NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  module TEXT NOT NULL,
  entity_id TEXT,
  entity_title TEXT,
  uploaded_by TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabla: activity_logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_title TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  organization_id TEXT NOT NULL
);

-- 11. Tabla: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_module TEXT,
  link_entity_id TEXT,
  is_read BOOLEAN DEFAULT false,
  organization_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- HABILITAR REALTIME (Para que la app reaccione en vivo)
-- ─────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.incidents;
alter publication supabase_realtime add table public.meetings;
alter publication supabase_realtime add table public.documents;
alter publication supabase_realtime add table public.assets;
alter publication supabase_realtime add table public.renewals;
alter publication supabase_realtime add table public.files;
alter publication supabase_realtime add table public.activity_logs;
alter publication supabase_realtime add table public.notifications;

-- ─────────────────────────────────────────────────────────────
-- DESACTIVAR RLS TEMPORALMENTE (Para evitar bloqueos 403)
-- ─────────────────────────────────────────────────────────────
-- Dado que la app aún está en desarrollo y se necesita escribir libremente:
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.files DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
