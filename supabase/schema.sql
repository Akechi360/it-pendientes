-- ═══════════════════════════════════════════════════════════════════════
-- Portal IT / Sistemas — Schema SQL para Supabase
-- Ejecuta este script completo en: Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Extensiones necesarias ───────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════════════
-- TABLAS
-- ═══════════════════════════════════════════════════════════════════════

-- ─── users ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  uid               TEXT        PRIMARY KEY,
  email             TEXT        UNIQUE NOT NULL,
  display_name      TEXT        NOT NULL,
  role              TEXT        NOT NULL CHECK (role IN ('admin', 'analyst')),
  title             TEXT,
  organization_id   TEXT        NOT NULL DEFAULT 'org_portal_it',
  photo_url         TEXT,
  created_at        TEXT,
  updated_at        TEXT
);

-- ─── tasks ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id                TEXT        PRIMARY KEY,
  title             TEXT        NOT NULL,
  description       TEXT        DEFAULT '',
  status            TEXT        NOT NULL DEFAULT 'pendiente',
  priority          TEXT        NOT NULL DEFAULT 'media',
  category          TEXT        NOT NULL DEFAULT 'otro',
  assignee_id       TEXT        DEFAULT '',
  assignee_name     TEXT        DEFAULT '',
  creator_id        TEXT        DEFAULT '',
  creator_name      TEXT        DEFAULT '',
  project_id        TEXT,
  project_title     TEXT,
  incident_id       TEXT,
  due_date          TEXT        DEFAULT '',
  due_time          TEXT,
  start_date        TEXT,
  estimated_hours   NUMERIC,
  actual_hours      NUMERIC,
  tags              JSONB       DEFAULT '[]',
  checklist         JSONB       DEFAULT '[]',
  comments          JSONB       DEFAULT '[]',
  recurrence        TEXT        DEFAULT 'ninguna',
  is_blocked        BOOLEAN     DEFAULT FALSE,
  block_reason      TEXT,
  blocked_by        TEXT,
  is_focused        BOOLEAN     DEFAULT FALSE,
  is_archived       BOOLEAN     DEFAULT FALSE,
  organization_id   TEXT        NOT NULL DEFAULT 'org_portal_it',
  created_at        TEXT,
  updated_at        TEXT
);

-- ─── projects ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id                TEXT        PRIMARY KEY,
  name              TEXT        NOT NULL,
  description       TEXT        DEFAULT '',
  status            TEXT        NOT NULL DEFAULT 'planificacion',
  priority          TEXT        NOT NULL DEFAULT 'media',
  lead_id           TEXT        DEFAULT '',
  lead_name         TEXT        DEFAULT '',
  participants      JSONB       DEFAULT '[]',
  progress          INTEGER     DEFAULT 0,
  start_date        TEXT        DEFAULT '',
  target_date       TEXT        DEFAULT '',
  real_date         TEXT,
  objectives        TEXT,
  scope             TEXT,
  risks             TEXT,
  budget            NUMERIC,
  tags              JSONB       DEFAULT '[]',
  organization_id   TEXT        NOT NULL DEFAULT 'org_portal_it',
  created_at        TEXT,
  updated_at        TEXT
);

-- ─── incidents ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.incidents (
  id                TEXT        PRIMARY KEY,
  title             TEXT        NOT NULL,
  description       TEXT        DEFAULT '',
  category          TEXT        NOT NULL DEFAULT 'otro',
  impact            TEXT        NOT NULL DEFAULT 'medio',
  urgency           TEXT        NOT NULL DEFAULT 'media',
  priority          TEXT        NOT NULL DEFAULT 'media',
  status            TEXT        NOT NULL DEFAULT 'abierta',
  requester         TEXT        DEFAULT '',
  assignee_id       TEXT        DEFAULT '',
  assignee_name     TEXT        DEFAULT '',
  asset_id          TEXT,
  asset_name        TEXT,
  diagnosis         TEXT,
  solution          TEXT,
  root_cause        TEXT,
  sla_due_date      TEXT        DEFAULT '',
  comments          JSONB       DEFAULT '[]',
  organization_id   TEXT        NOT NULL DEFAULT 'org_portal_it',
  created_at        TEXT,
  updated_at        TEXT
);

-- ─── meetings ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.meetings (
  id                TEXT        PRIMARY KEY,
  title             TEXT        NOT NULL,
  objective         TEXT        DEFAULT '',
  start_time        TEXT        NOT NULL,
  end_time          TEXT        NOT NULL,
  participants      JSONB       DEFAULT '[]',
  modality          TEXT        NOT NULL DEFAULT 'presencial',
  location          TEXT,
  agenda            TEXT,
  notes             TEXT,
  decisions         TEXT,
  commitments       JSONB       DEFAULT '[]',
  status            TEXT        NOT NULL DEFAULT 'programada',
  organization_id   TEXT        NOT NULL DEFAULT 'org_portal_it',
  created_at        TEXT
);

-- ─── documents ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.documents (
  id                TEXT        PRIMARY KEY,
  title             TEXT        NOT NULL,
  content           TEXT        DEFAULT '',
  space             TEXT        NOT NULL DEFAULT 'General',
  parent_id         TEXT,
  status            TEXT        NOT NULL DEFAULT 'borrador',
  author_id         TEXT        DEFAULT '',
  author_name       TEXT        DEFAULT '',
  is_favorite       BOOLEAN     DEFAULT FALSE,
  tags              JSONB       DEFAULT '[]',
  organization_id   TEXT        NOT NULL DEFAULT 'org_portal_it',
  created_at        TEXT,
  updated_at        TEXT
);

-- ─── assets ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assets (
  id                    TEXT        PRIMARY KEY,
  name                  TEXT        NOT NULL,
  type                  TEXT        NOT NULL DEFAULT 'otro',
  tag                   TEXT,
  tag_code              TEXT,
  brand_model           TEXT,
  serial_number         TEXT,
  ip_address            TEXT,
  status                TEXT        NOT NULL DEFAULT 'activo',
  assigned_to           TEXT,
  location              TEXT,
  purchase_date         TEXT,
  warranty_expiration   TEXT,
  notes                 TEXT,
  organization_id       TEXT        NOT NULL DEFAULT 'org_portal_it',
  created_at            TEXT,
  updated_at            TEXT
);

-- ─── renewals ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.renewals (
  id                TEXT        PRIMARY KEY,
  title             TEXT        NOT NULL,
  type              TEXT        NOT NULL DEFAULT 'licencia',
  vendor            TEXT        DEFAULT '',
  status            TEXT        NOT NULL DEFAULT 'activo',
  cost              NUMERIC     DEFAULT 0,
  renewal_date      TEXT        NOT NULL DEFAULT '',
  frequency         TEXT        DEFAULT 'anual',
  responsible_id    TEXT        DEFAULT '',
  responsible_name  TEXT        DEFAULT '',
  organization_id   TEXT        NOT NULL DEFAULT 'org_portal_it',
  created_at        TEXT
);

-- ─── files ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.files (
  id                TEXT        PRIMARY KEY,
  name              TEXT        NOT NULL,
  size              BIGINT      DEFAULT 0,
  type              TEXT        DEFAULT '',
  url               TEXT        DEFAULT '',
  module            TEXT        DEFAULT 'general',
  entity_id         TEXT,
  entity_title      TEXT,
  uploaded_by       TEXT        DEFAULT '',
  created_at        TEXT,
  organization_id   TEXT        NOT NULL DEFAULT 'org_portal_it'
);

-- ─── activity_logs (inmutable) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id                TEXT        PRIMARY KEY,
  actor_id          TEXT        NOT NULL DEFAULT '',
  actor_name        TEXT        NOT NULL DEFAULT '',
  actor_role        TEXT        NOT NULL DEFAULT 'analyst',
  action            TEXT        NOT NULL DEFAULT '',
  module            TEXT        NOT NULL DEFAULT '',
  entity_id         TEXT        DEFAULT '',
  entity_title      TEXT        DEFAULT '',
  details           TEXT        DEFAULT '',
  timestamp         TEXT        NOT NULL,
  organization_id   TEXT        NOT NULL DEFAULT 'org_portal_it'
);

-- ─── notifications ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id                TEXT        PRIMARY KEY,
  user_id           TEXT        NOT NULL DEFAULT '',
  title             TEXT        NOT NULL DEFAULT '',
  message           TEXT        NOT NULL DEFAULT '',
  link_module       TEXT,
  link_entity_id    TEXT,
  is_read           BOOLEAN     DEFAULT FALSE,
  created_at        TEXT,
  organization_id   TEXT        NOT NULL DEFAULT 'org_portal_it'
);


-- ═══════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper: verificar si el usuario autenticado es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE uid = auth.uid()::text AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── Políticas: users ────────────────────────────────────────────────
CREATE POLICY "users_select" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "users_insert" ON public.users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "users_update" ON public.users FOR UPDATE USING (auth.uid()::text = uid OR public.is_admin());
CREATE POLICY "users_delete" ON public.users FOR DELETE USING (public.is_admin());

-- ─── Políticas: tasks ────────────────────────────────────────────────
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE USING (public.is_admin());

-- ─── Políticas: projects ─────────────────────────────────────────────
CREATE POLICY "projects_select" ON public.projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "projects_insert" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "projects_update" ON public.projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "projects_delete" ON public.projects FOR DELETE USING (public.is_admin());

-- ─── Políticas: incidents ────────────────────────────────────────────
CREATE POLICY "incidents_select" ON public.incidents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "incidents_insert" ON public.incidents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "incidents_update" ON public.incidents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "incidents_delete" ON public.incidents FOR DELETE USING (public.is_admin());

-- ─── Políticas: meetings ─────────────────────────────────────────────
CREATE POLICY "meetings_select" ON public.meetings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "meetings_insert" ON public.meetings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "meetings_update" ON public.meetings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "meetings_delete" ON public.meetings FOR DELETE USING (public.is_admin());

-- ─── Políticas: documents ────────────────────────────────────────────
CREATE POLICY "documents_select" ON public.documents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "documents_insert" ON public.documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "documents_update" ON public.documents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "documents_delete" ON public.documents FOR DELETE USING (public.is_admin());

-- ─── Políticas: assets ───────────────────────────────────────────────
CREATE POLICY "assets_select" ON public.assets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "assets_insert" ON public.assets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "assets_update" ON public.assets FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "assets_delete" ON public.assets FOR DELETE USING (public.is_admin());

-- ─── Políticas: renewals ─────────────────────────────────────────────
CREATE POLICY "renewals_select" ON public.renewals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "renewals_insert" ON public.renewals FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "renewals_update" ON public.renewals FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "renewals_delete" ON public.renewals FOR DELETE USING (public.is_admin());

-- ─── Políticas: files ────────────────────────────────────────────────
CREATE POLICY "files_select" ON public.files FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "files_insert" ON public.files FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "files_update" ON public.files FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "files_delete" ON public.files FOR DELETE USING (public.is_admin());

-- ─── Políticas: activity_logs (INMUTABLE — solo lectura e inserción) ─
CREATE POLICY "logs_select" ON public.activity_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "logs_insert" ON public.activity_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Sin UPDATE ni DELETE = nadie puede modificar o eliminar logs

-- ─── Políticas: notifications ────────────────────────────────────────
CREATE POLICY "notif_select" ON public.notifications FOR SELECT
  USING (auth.role() = 'authenticated' AND (user_id = auth.uid()::text OR public.is_admin()));
CREATE POLICY "notif_insert" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "notif_update" ON public.notifications FOR UPDATE
  USING (user_id = auth.uid()::text OR public.is_admin());
CREATE POLICY "notif_delete" ON public.notifications FOR DELETE
  USING (user_id = auth.uid()::text OR public.is_admin());


-- ═══════════════════════════════════════════════════════════════════════
-- REALTIME — Habilitar publicación Postgres Changes
-- ═══════════════════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.renewals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;


-- ═══════════════════════════════════════════════════════════════════════
-- USUARIOS INICIALES DE AUTENTICACIÓN
-- Ejecuta SOLO si vas a usar estos usuarios de demo.
-- También puedes crear usuarios manualmente en:
-- Supabase Dashboard → Authentication → Users → "Add user"
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Admin: Carlos Mendoza ───────────────────────────────────────────
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'admin@portal-it.com',
  crypt('Admin@2026!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(), NOW(), FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@portal-it.com","email_verified":true}',
  'email', NOW(), NOW(), NOW()
) ON CONFLICT DO NOTHING;

-- ─── Analista: Laura García ──────────────────────────────────────────
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated',
  'analista@portal-it.com',
  crypt('Analista@2026!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(), NOW(), FALSE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  '{"sub":"22222222-2222-2222-2222-222222222222","email":"analista@portal-it.com","email_verified":true}',
  'email', NOW(), NOW(), NOW()
) ON CONFLICT DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════
-- PERFILES DE USUARIO EN TABLA PUBLIC.USERS
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO public.users (uid, email, display_name, role, title, organization_id, created_at)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'admin@portal-it.com',
    'Carlos Mendoza',
    'admin',
    'Jefe de Sistemas IT',
    'org_portal_it',
    NOW()::TEXT
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'analista@portal-it.com',
    'Laura García',
    'analyst',
    'Analista IT',
    'org_portal_it',
    NOW()::TEXT
  )
ON CONFLICT (uid) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════
-- FIN DEL SCRIPT
-- Los datos de demostración (tareas, proyectos, incidencias, etc.)
-- se insertan automáticamente la primera vez que el app detecta
-- las tablas vacías (función checkAndSeedSupabase en supabaseService.ts).
-- ═══════════════════════════════════════════════════════════════════════
