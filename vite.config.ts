import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { parseVoiceWithGemini } from './api/_lib/parseVoice.js';

// ─────────────────────────────────────────────────────────────
// Plugin de desarrollo: monta /api/parse-voice sobre el dev server
// de Vite para que el MISMO camino (cliente -> /api -> Gemini) exista
// en local y en producción. En Vercel lo sirve la función serverless.
// ─────────────────────────────────────────────────────────────
const apiDevServer = (mode: string): Plugin => ({
  name: 'api-dev-server',
  apply: 'serve',
  configureServer(server) {
    // Carga TODAS las variables (prefijo '') para acceder a GEMINI_API_KEY,
    // que NO lleva prefijo VITE_ y por tanto no está en import.meta.env.
    const env = loadEnv(mode, process.cwd(), '');
    const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    server.middlewares.use('/api/parse-voice', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      }

      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', async () => {
        res.setHeader('Content-Type', 'application/json');
        try {
          const { command, membersText } = JSON.parse(body || '{}');
          if (!command) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Missing command' }));
          }
          const data = await parseVoiceWithGemini({ command, membersText, apiKey });
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, data }));
        } catch (error: any) {
          res.statusCode = error?.status || 500;
          res.end(JSON.stringify({
            success: false,
            error: error?.code || 'INTERNAL_ERROR',
            details: String(error?.message || error),
          }));
        }
      });
    });
  },
});

export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), tailwindcss(), apiDevServer(mode)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-charts': ['recharts'],
            'vendor-icons': ['lucide-react'],
            'vendor-motion': ['motion']
          }
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
