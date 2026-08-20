import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  // Desregistrar cualquier service worker viejo que esté causando conflictos con OneSignal
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      if (!registration.active?.scriptURL.includes('OneSignalSDKWorker')) {
        console.log('Desregistrando Service Worker conflictivo:', registration.active?.scriptURL);
        registration.unregister();
      }
    }
  });
}
