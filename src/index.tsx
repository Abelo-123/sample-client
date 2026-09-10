// Include Telegram UI stylestyfyt first to allow our code to override the package CSS.
import '@telegram-apps/telegram-ui/dist/styles.css';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

import { Root } from '@/components/Root';
import { EnvUnsupported } from '@/components/EnvUnsupported';
import { init } from '@/init';

import './index.css';

// Mock the environment in dev mode only (tree-shaken in production)
if (import.meta.env.DEV) {
  await import('./mockEnv');
}

const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
  let launchParams;
  try {
    launchParams = retrieveLaunchParams();
  } catch (err) {
    // Try to load cached launch params from sessionStorage
    const cached = sessionStorage.getItem('todoapp:launch_params');
    if (cached) {
      const parsedParams = new URLSearchParams(cached);
      const { mockTelegramEnv } = await import('@telegram-apps/sdk-react');
      mockTelegramEnv({ launchParams: parsedParams });
      launchParams = retrieveLaunchParams();
    } else {
      console.warn('[Init] Launch params missing, using fallback mock');
      const { mockTelegramEnv, emitEvent } = await import('@telegram-apps/sdk-react');
      const mockTheme = {
        accent_text_color: '#6ab2f2',
        bg_color: '#0a0a0f',
        button_color: '#6c63ff',
        button_text_color: '#ffffff',
        destructive_text_color: '#ec3942',
        header_bg_color: '#0a0a0f',
        hint_color: '#708499',
        link_color: '#6ab3f3',
        secondary_bg_color: '#14141f',
        text_color: '#f5f5f5',
      } as const;

      const mockUser = {
        id: 123456789,
        first_name: 'Demo',
        last_name: 'User',
        username: 'demouser',
        language_code: 'en',
      };

      const mockInitData = new URLSearchParams([
        ['auth_date', (Date.now() / 1000 | 0).toString()],
        ['hash', 'mock-hash'],
        ['signature', 'mock-signature'],
        ['user', JSON.stringify(mockUser)],
      ]).toString();

      mockTelegramEnv({
        onEvent(e) {
          if (e[0] === 'web_app_request_theme') {
            return emitEvent('theme_changed', { theme_params: mockTheme });
          }
        },
        launchParams: new URLSearchParams([
          ['tgWebAppThemeParams', JSON.stringify(mockTheme)],
          ['tgWebAppData', mockInitData],
          ['tgWebAppVersion', '8.4'],
          ['tgWebAppPlatform', 'tdesktop'],
        ]),
      });

      launchParams = retrieveLaunchParams();
    }
  }

  const { tgWebAppPlatform: platform } = launchParams;
  const debug = (launchParams.tgWebAppStartParam || '').includes('debug')
    || import.meta.env.DEV;

  // Start init — but render immediately
  init({
    debug,
    eruda: debug && ['ios', 'android'].includes(platform),
    mockForMacOS: platform === 'macos',
  }).then(() => {
    // Deferred tasks done
  });

  // Cache launch params for next session
  try {
    const lp = window.location.search + window.location.hash;
    if (lp.includes('tgWebAppData')) {
      sessionStorage.setItem('todoapp:launch_params', lp);
    }
  } catch { /* ignore */ }

  root.render(
    <StrictMode>
      <Root />
    </StrictMode>,
  );
} catch (e) {
  console.error('[Init] Initialization crashed completely:', e);
  root.render(<EnvUnsupported />);
}
