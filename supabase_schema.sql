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
-- POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura/escritura para usuarios autenticados y anon/public (modo desarrollo/demo)
CREATE POLICY "Permitir lectura completa a usuarios autenticados" ON public.users FOR SELECT USING (true);
CREATE POLICY "Permitir insercion/actualizacion de usuario propio" ON public.users FOR ALL USING (true);

CREATE POLICY "Lectura libre de tareas" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Escritura de tareas para usuarios" ON public.tasks FOR ALL USING (true);

CREATE POLICY "Lectura libre de proyectos" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Escritura de proyectos" ON public.projects FOR ALL USING (true);

CREATE POLICY "Lectura libre de incidencias" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Escritura de incidencias" ON public.incidents FOR ALL USING (true);

CREATE POLICY "Lectura libre de reuniones" ON public.meetings FOR SELECT USING (true);
CREATE POLICY "Escritura de reuniones" ON public.meetings FOR ALL USING (true);

CREATE POLICY "Lectura libre de documentos" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Escritura de documentos" ON public.documents FOR ALL USING (true);

CREATE POLICY "Lectura libre de activos" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Escritura de activos" ON public.assets FOR ALL USING (true);

CREATE POLICY "Lectura libre de renovaciones" ON public.renewals FOR SELECT USING (true);
CREATE POLICY "Escritura de renovaciones" ON public.renewals FOR ALL USING (true);

CREATE POLICY "Lectura libre de archivos" ON public.files FOR SELECT USING (true);
CREATE POLICY "Escritura de archivos" ON public.files FOR ALL USING (true);

CREATE POLICY "Lectura libre de notificaciones" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Escritura de notificaciones" ON public.notifications FOR ALL USING (true);

-- Bitácora de Auditoría: Solo lectura e inserción (Inmutable)
CREATE POLICY "Lectura libre de bitacora" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Insercion de bitacora" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- TRIGGER POSTGRESQL: INMUTABILIDAD STRICTA DE BITÁCORA
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.prevent_activity_log_tampering()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Operación no permitida: Los registros de la bitácora de auditoría son inmutables y no se pueden modificar ni eliminar.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_activity_log_tampering ON public.activity_logs;

CREATE TRIGGER trg_prevent_activity_log_tampering
BEFORE UPDATE OR DELETE ON public.activity_logs
FOR EACH ROW
EXECUTE FUNCTION public.prevent_activity_log_tampering();

-- ─────────────────────────────────────────────────────────────
-- USUARIOS INICIALES DE PRUEBA / SISTEMA
-- ─────────────────────────────────────────────────────────────
-- 1. Analista IT: Eduardo Toro
INSERT INTO public.users (uid, email, display_name, role, title, organization_id)
VALUES (
  'e7b28a90-1111-4444-9999-000000000001',
  'sistemas@clinicaieq.com',
  'Eduardo Toro',
  'analyst',
  'Analista IT',
  'org_sistemas_main'
)
ON CONFLICT (uid) DO UPDATE
SET email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    title = EXCLUDED.title;

-- 2. Jefe de Sistemas (Admin)
INSERT INTO public.users (uid, email, display_name, role, title, organization_id)
VALUES (
  'a1b2c3d4-0000-4000-8000-000000000000',
  'admin@clinicaieq.com',
  'Jefe de Sistemas',
  'admin',
  'Jefe de Sistemas',
  'org_sistemas_main'
)
ON CONFLICT (uid) DO UPDATE
SET email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    title = EXCLUDED.title;

