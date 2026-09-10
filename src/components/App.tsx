import { AppRoot } from '@telegram-apps/telegram-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo, useEffect } from 'react';
import { retrieveLaunchParams, isMiniAppDark } from '@telegram-apps/sdk-react';
import { TodoApp } from '@/pages/TodoApp';
import { registerUser } from '@/pages/TodoApp/api';

import '@telegram-apps/telegram-ui/dist/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export function App() {
  const lp = useMemo(() => {
    try { return retrieveLaunchParams(); } catch { return null; }
  }, []);

  const isDark = useMemo(() => {
    try { return isMiniAppDark(); } catch { return true; }
  }, []);

  const platform = lp?.tgWebAppPlatform ?? 'base';

  // Auto-register user on app open so admin panel can see them
  useEffect(() => {
    if (!lp?.tgWebAppInitData) return;
    try {
      const params = new URLSearchParams(lp.tgWebAppInitData);
      const userRaw = params.get('user');
      if (!userRaw) return;
      const user = JSON.parse(userRaw);
      if (!user?.id) return;
      registerUser({
        tg_id: String(user.id),
        first_name: user.first_name,
        last_name:  user.last_name,
        username:   user.username,
      }).catch(() => {/* silent — non-critical */});
    } catch {
      // ignore parse errors in dev mock mode
    }
  }, [lp]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRoot
        appearance={isDark ? 'dark' : 'light'}
        platform={['macos', 'ios'].includes(platform) ? 'ios' : 'base'}
      >
        <TodoApp />
      </AppRoot>
    </QueryClientProvider>
  );
}
