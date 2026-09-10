import {
  hapticFeedbackImpactOccurred,
  hapticFeedbackNotificationOccurred,
  popup,
} from '@telegram-apps/sdk-react';

export function hapticImpact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') {
  try {
    if (hapticFeedbackImpactOccurred.isSupported()) {
      hapticFeedbackImpactOccurred(style);
    }
  } catch {
    // silent fallback for dev / browser
  }
}

export function hapticNotification(type: 'error' | 'success' | 'warning') {
  try {
    if (hapticFeedbackNotificationOccurred.isSupported()) {
      hapticFeedbackNotificationOccurred(type);
    }
  } catch {
    // silent fallback for dev / browser
  }
}

export async function showConfirm(message: string, title: string = 'Confirm'): Promise<boolean> {
  try {
    if (popup.isSupported()) {
      const buttonId = await popup.open({
        title,
        message,
        buttons: [
          { id: 'cancel', type: 'cancel' },
          { id: 'ok', type: 'destructive', text: 'Delete' },
        ],
      });
      return buttonId === 'ok';
    }
  } catch {
    // fallback for browser
  }
  return window.confirm(message);
}
