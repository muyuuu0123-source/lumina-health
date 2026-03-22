import { useStore } from '../store';
import { translations } from '../i18n';
import { usePostureDetection } from '../hooks/usePostureDetection';
import { Camera, CameraOff, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

export function PostureMonitor() {
  const language = useStore((state) => state.language);
  const t = translations[language];
  const isPostureEnabled = useStore((state) => state.isPostureEnabled);
  const togglePosture = useStore((state) => state.togglePosture);
  const setBadPosture = useStore((state) => state.setBadPosture);
  const incrementBadPostureDuration = useStore((state) => state.incrementBadPostureDuration);
  const resetBadPostureDuration = useStore((state) => state.resetBadPostureDuration);
  const badPostureDuration = useStore((state) => state.badPostureDuration);

  const { videoRef, isBadPosture, postureFeedback } = usePostureDetection(isPostureEnabled);

  useEffect(() => {
    setBadPosture(isBadPosture);
    if (isBadPosture) {
      const timer = setInterval(() => {
        incrementBadPostureDuration();
      }, 1000);
      return () => clearInterval(timer);
    } else {
      resetBadPostureDuration();
    }
  }, [isBadPosture, setBadPosture, incrementBadPostureDuration, resetBadPostureDuration]);

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
          {isPostureEnabled ? <Camera className="w-5 h-5 text-emerald-500" /> : <CameraOff className="w-5 h-5 text-slate-400" />}
          {t.aiPosture}
        </h3>
        <button
          onClick={togglePosture}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            isPostureEnabled ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isPostureEnabled ? t.enabled : t.enable}
        </button>
      </div>

      <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
        {isPostureEnabled ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover transform scale-x-[-1]"
              autoPlay
              playsInline
              muted
            />
            {isBadPosture && badPostureDuration > 30 && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="font-semibold text-slate-800">{t.postureAlert}</p>
                    <p className="text-sm text-slate-600">{postureFeedback || t.sitUpStraight}</p>
                  </div>
                </div>
              </div>
            )}
            {isBadPosture && badPostureDuration <= 30 && (
              <div className="absolute top-4 right-4 bg-orange-500/90 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                {postureFeedback} ({30 - badPostureDuration}s)
              </div>
            )}
          </>
        ) : (
          <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
            <CameraOff className="w-8 h-8 opacity-50" />
            <p>{t.cameraOff}</p>
          </div>
        )}
      </div>
    </div>
  );
}
