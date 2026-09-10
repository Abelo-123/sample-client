import { init as initSdk, backButton, miniApp, themeParams } from '@telegram-apps/sdk-react';

interface InitOptions {
  debug?: boolean;
  eruda?: boolean;
  mockForMacOS?: boolean;
}

export async function init(options: InitOptions = {}) {
  try {
    initSdk();

    if (miniApp.isSupported()) {
      miniApp.mount();
      miniApp.ready();
    }

    try {
      themeParams.mount();
    } catch {
      // themeParams mounting optional/fallback
    }

    if (backButton.isSupported()) {
      backButton.mount();
    }

    if (options.eruda) {
      const eruda = await import('eruda');
      eruda.default.init();
    }
  } catch (err) {
    console.warn('[Init] SDK initialization warning:', err);
  }
}
