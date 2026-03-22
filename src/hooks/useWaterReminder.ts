import { useEffect } from 'react';
import { useStore } from '../store';
import { translations } from '../i18n';

export function useWaterReminder() {
  const isWaterReminderActive = useStore((state) => state.isWaterReminderActive);
  const language = useStore((state) => state.language);
  const t = translations[language];

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isWaterReminderActive) {
      // Remind every 60 minutes
      interval = setInterval(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window && Notification.permission === 'granted') {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(t.waterNotificationTitle, {
              body: t.waterNotificationBody,
              icon: '/icon.png',
              vibrate: [200, 100, 200],
            } as any);
          });
        } else if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(t.waterNotificationTitle, {
            body: t.waterNotificationBody,
            icon: '/icon.png',
          });
        } else {
          // Fallback to in-app alert if notifications are not granted or supported
          console.log('Water reminder triggered:', t.waterNotificationTitle);
          // We can use a simple custom event or just rely on the console for now
          // since alert() is blocked in iframe.
          // A better approach would be to dispatch a custom event that a Toast component listens to.
          window.dispatchEvent(new CustomEvent('show-toast', { 
            detail: { title: t.waterNotificationTitle, message: t.waterNotificationBody } 
          }));
        }
      }, 60 * 60 * 1000); // 1 hour
    }

    return () => clearInterval(interval);
  }, [isWaterReminderActive, language, t.waterNotificationTitle, t.waterNotificationBody]);
}
