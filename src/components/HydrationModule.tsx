import { useStore } from '../store';
import { translations } from '../i18n';
import { Droplets, Plus, Bell, BellOff } from 'lucide-react';
import { useEffect } from 'react';

export function HydrationModule() {
  const language = useStore((state) => state.language);
  const t = translations[language];
  const waterIntake = useStore((state) => state.waterIntake);
  const waterGoal = useStore((state) => state.waterGoal);
  const isWaterReminderActive = useStore((state) => state.isWaterReminderActive);
  const addWater = useStore((state) => state.addWater);
  const toggleWaterReminder = useStore((state) => state.toggleWaterReminder);
  const checkWaterReset = useStore((state) => state.checkWaterReset);

  useEffect(() => {
    checkWaterReset();
  }, [checkWaterReset]);

  const progress = Math.min((waterIntake / waterGoal) * 100, 100);

  const handleToggleReminder = async () => {
    if (!isWaterReminderActive) {
      try {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            console.warn(t.enableNotifications);
            window.dispatchEvent(new CustomEvent('show-toast', { 
              detail: { 
                title: language === 'zh' ? '需要通知权限' : 'Notification Permission Required', 
                message: language === 'zh' ? '请在新标签页中打开应用以允许桌面通知，否则只能在应用内提醒。' : 'Please open the app in a new tab to allow desktop notifications. Otherwise, only in-app alerts will be shown.' 
              } 
            }));
          } else {
            window.dispatchEvent(new CustomEvent('show-toast', { 
              detail: { 
                title: language === 'zh' ? '已开启桌面提醒' : 'Desktop Notifications Enabled', 
                message: language === 'zh' ? '即使网站在后台，您也会收到喝水提醒。' : 'You will receive water reminders even when the site is in the background.' 
              } 
            }));
          }
        }
      } catch (error) {
        console.error('Notification permission error:', error);
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { 
            title: language === 'zh' ? '无法请求通知权限' : 'Cannot Request Permission', 
            message: language === 'zh' ? '请点击右上角在新标签页中打开应用，以启用桌面通知。' : 'Please open the app in a new tab using the top right button to enable desktop notifications.' 
          } 
        }));
      }
    }
    toggleWaterReminder();
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/20 mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 shrink-0">
            <Droplets className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-slate-800">{t.hydration}</h3>
            <p className="text-sm text-slate-500">{t.waterGoal}</p>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md">
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span className="text-blue-600">{waterIntake} ml</span>
            <span className="text-slate-400">{waterGoal} ml</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => addWater(250)}
            className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.addWater}
          </button>
          
          {isWaterReminderActive && (
            <button
              onClick={() => {
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
                  window.dispatchEvent(new CustomEvent('show-toast', { 
                    detail: { title: t.waterNotificationTitle, message: t.waterNotificationBody } 
                  }));
                }
              }}
              className="px-3 py-2 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full text-xs font-medium transition-colors"
              title={language === 'zh' ? '测试提醒' : 'Test Reminder'}
            >
              {language === 'zh' ? '测试' : 'Test'}
            </button>
          )}

          <button
            onClick={handleToggleReminder}
            className={`p-2 rounded-full transition-colors ${
              isWaterReminderActive
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
            title={t.waterReminder}
          >
            {isWaterReminderActive ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
