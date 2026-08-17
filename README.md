# Portal IT / Sistemas - Gestión Integral de Departamento Tecnológico

Aplicación web profesional, ágil, segura y responsive diseñada específicamente para la operación y gestión del Departamento de Sistemas / IT. Inspirada en Notion, Jira, Google Calendar, Samsung Reminder y Trello, con una identidad corporativa minimalista.

## 🚀 Características Principales
- **Dashboard Operativo y Ejecutivo**: Vista de estado diario, tareas focales, alertas de vencimientos, próximos eventos, incidencias críticas y métricas visuales con Recharts.
- **Gestión de Tareas y Pendientes**: Identificadores únicos (`TASK-2026-0001`), prioridades, semáforos, bloqueos, checklists, recurrencias, estimaciones de tiempo y múltiples vistas (Lista, Kanban, Calendario, Agenda, Tabla).
- **Control de Proyectos**: Seguimiento de iniciativas de infraestructura, desarrollo, migración y redes con barra de avance, tareas vinculadas y detalles por pestañas.
- **Móduo Helpdesk e Incidencias**: Tickets de soporte con cálculo de SLA, impacto vs urgencia, diagnósticos, causa raíz y conversión a tareas/proyectos.
- **Calendario y Reuniones IT**: Calendario centralizado de mantenimientos, entregas y reuniones con minutas, decisiones y creación directa de tareas desde compromisos.
- **Base de Conocimiento (Estilo Notion)**: Documentación técnica, manuales, runbooks, políticas y referencias de credenciales con editor Markdown y árbol de documentos.
- **Inventario de Activos Tecnológicos**: Servidores, laptops, licencias, SSL, dominios y equipos de red con asignaciones y garantías.
- **Control de Compras y Renovaciones**: Alertas anticipadas de renovación para licencias, dominios, SSL y contratos a 90, 60, 30, 15, 7 y 1 días.
- **Gestor de Archivos**: Almacenamiento organizado de documentos técnicos, cotizaciones e imágenes vinculadas a cualquier entidad.
- **Bitácora e Historial Inmutable**: Registro automático de auditoría para trazabilidad técnica completa.
- **Búsqueda Global y Command Palette**: Activación rápida con `Ctrl/Cmd + K` o atajos de teclado (`C`, `T`, `I`, `M`, `P`, `/`).
- **Autenticación y Roles**: Aislamiento y permisos para el Jefe de Sistemas (`admin`) y Analista IT (`analyst`).

## 🛠️ Stack Tecnológico
- **Frontend**: React 19, TypeScript estricto, Vite, Tailwind CSS.
- **Iconos y Estilos**: Lucide React, Tema Oscuro Slate/Charcoal corporativo con soporte para Modo Claro.
- **Métricas**: Recharts.
- **Fechas**: Date-fns.
- **Backend & DB**: Supabase Auth, Supabase Database (PostgreSQL con Realtime y RLS), Supabase Storage.

## 🔐 Credenciales Iniciales de Acceso
- **Analista IT (Eduardo Toro)**:
  - **Email**: `sistemas@clinicaieq.com`
  - **Contraseña inicial**: `EduardoIT2026!`
  - **Rol**: `analyst`
- **Gerente de Sistemas (Admin)**:
  - **Email**: `gerencia_sistemas@clinicaieq.com`
  - **Contraseña inicial**: `AdminIT2026!`
  - **Rol**: `admin`

*Nota: Ambos usuarios pueden cambiar su contraseña en cualquier momento desde la barra lateral ("Cambiar Contraseña").*

## 📦 Instalación y Ejecución Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno copiando `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abrir en el navegador en `http://localhost:3000`.
