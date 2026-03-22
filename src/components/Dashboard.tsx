import { useEffect } from 'react';
import { useStore } from '../store';
import { translations } from '../i18n';
import { AudioMixer } from './AudioMixer';
import { PostureMonitor } from './PostureMonitor';
import { WorkoutModule } from './WorkoutModule';
import { HydrationModule } from './HydrationModule';
import { useWaterReminder } from '../hooks/useWaterReminder';
import { Timer, Bell, Award, Flame, Languages } from 'lucide-react';

export function Dashboard() {
  useWaterReminder();
  
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);
  const t = translations[language];

  const isTimerActive = useStore((state) => state.isTimerActive);
  const toggleTimer = useStore((state) => state.toggleTimer);
  const timeRemaining = useStore((state) => state.timeRemaining);
  const setTimeRemaining = useStore((state) => state.setTimeRemaining);
  const setInterventionStage = useStore((state) => state.setInterventionStage);
  const streakDays = useStore((state) => state.streakDays);
  const badges = useStore((state) => state.badges);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else if (isTimerActive && timeRemaining === 0) {
      // Trigger intervention stages
      setInterventionStage('sound');
      
      // Play a soft chime
      const audio = document.createElement('audio');
      
      const sourceOgg = document.createElement('source');
      sourceOgg.src = 'https://cdn.jsdelivr.net/gh/petrovicstefanrs/chillnsound@master/app/sounds/windchimes.ogg';
      sourceOgg.type = 'audio/ogg';
      
      const sourceMp3 = document.createElement('source');
      sourceMp3.src = 'https://cdn.jsdelivr.net/gh/petrovicstefanrs/chillnsound@master/app/sounds/windchimes.mp3';
      sourceMp3.type = 'audio/mpeg';
      
      audio.appendChild(sourceOgg);
      audio.appendChild(sourceMp3);
      
      audio.play().catch(e => console.error('Audio play failed:', e));
      
      setTimeout(() => {
        setInterventionStage('text');
        
        setTimeout(() => {
          setInterventionStage('overlay');
          setTimeRemaining(20 * 60); // Reset timer
        }, 10000); // 10s text -> overlay
        
      }, 5000); // 5s sound -> text
      
      // Send push notification if supported
      if ('serviceWorker' in navigator && 'PushManager' in window && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(t.appTitle, {
            body: t.prompts.eye1,
            icon: '/icon.png',
            vibrate: [200, 100, 200],
          } as any);
        });
      } else if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(t.appTitle, {
          body: t.prompts.eye1,
          icon: '/icon.png',
        });
      }
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining, setTimeRemaining, setInterventionStage]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const requestNotificationPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          window.dispatchEvent(new CustomEvent('show-toast', { 
            detail: { 
              title: language === 'zh' ? '已开启桌面提醒' : 'Desktop Notifications Enabled', 
              message: language === 'zh' ? '您现在可以接收桌面通知了。' : 'You can now receive desktop notifications.' 
            } 
          }));
        } else {
          window.dispatchEvent(new CustomEvent('show-toast', { 
            detail: { 
              title: language === 'zh' ? '需要通知权限' : 'Notification Permission Required', 
              message: language === 'zh' ? '请在新标签页中打开应用以允许桌面通知。' : 'Please open the app in a new tab to allow desktop notifications.' 
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
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm sm:text-lg leading-none">L</span>
            </div>
            <h1 className="text-base sm:text-xl font-semibold tracking-tight text-slate-800 whitespace-nowrap">{t.appTitle}</h1>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-6">
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-orange-500 bg-orange-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap">
              <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{streakDays} {t.dayStreak}</span>
              <span className="sm:hidden">{streakDays}{language === 'zh' ? '天' : 'd'}</span>
            </div>
            <button
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap"
            >
              <Languages className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{language === 'en' ? '中文' : 'EN'}</span>
              <span className="sm:hidden">{language === 'en' ? '中' : 'EN'}</span>
            </button>
            <button
              onClick={requestNotificationPermission}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors"
              title={t.enableNotifications}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <HydrationModule />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Left Column: Core Focus */}
          <div className="lg:col-span-8 space-y-8">
            {/* 20-20-20 Timer Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h2 className="text-3xl font-light tracking-tight mb-2">{t.ruleTitle}</h2>
                  <p className="text-indigo-100 max-w-md">
                    {t.ruleDesc}
                  </p>
                </div>
                
                <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <div className="text-5xl font-mono font-light tracking-tighter">
                    {formatTime(timeRemaining)}
                  </div>
                  <button
                    onClick={toggleTimer}
                    className={`px-8 py-3 rounded-full font-medium transition-all shadow-sm flex items-center gap-2 ${
                      isTimerActive 
                        ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30' 
                        : 'bg-white text-indigo-600 hover:bg-indigo-50 hover:scale-105'
                    }`}
                  >
                    <Timer className="w-5 h-5" />
                    {isTimerActive ? t.pauseFocus : t.startFocus}
                  </button>
                </div>
              </div>
            </div>

            {/* Posture Monitor */}
            <PostureMonitor />
            
            {/* Workout Module */}
            <WorkoutModule />
          </div>

          {/* Right Column: Environment & Stats */}
          <div className="lg:col-span-4 space-y-8">
            {/* Audio Mixer */}
            <AudioMixer />

            {/* Achievements */}
            <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/20">
              <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                {t.achievements}
              </h3>
              
              <div className="space-y-4">
                {badges.length === 0 ? (
                  <p className="text-sm text-slate-500 italic text-center py-4">
                    {t.noBadges}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {badges.map((badge, i) => (
                      <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex flex-col items-center text-center gap-2">
                        <Award className="w-8 h-8 text-amber-500" />
                        <span className="text-xs font-medium text-amber-800">{badge}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
