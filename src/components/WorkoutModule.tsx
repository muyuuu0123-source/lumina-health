import { useState } from 'react';
import { useStore } from '../store';
import { translations } from '../i18n';
import { CheckCircle2, Activity } from 'lucide-react';
import ReactPlayer from 'react-player';

export function WorkoutModule() {
  const language = useStore((state) => state.language);
  const t = translations[language];
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);

  const WORKOUTS = [
    {
      id: 'office-stretch',
      title: t.officeStretch,
      desc: t.officeStretchDesc,
      videos: [
        'https://www.youtube.com/watch?v=kGHLpF7OmHk',
        'https://www.youtube.com/watch?v=fCwhwPMumlY'
      ],
    },
    {
      id: 'eye-care',
      title: t.eyeCare,
      desc: t.eyeCareDesc,
      videos: [
        'https://www.youtube.com/watch?v=38wM4im_WuU',
        'https://www.youtube.com/watch?v=UdvRgKnOXnY'
      ],
    },
  ];

  const [isCompleted, setIsCompleted] = useState(false);
  const checkIn = useStore((state) => state.checkIn);

  const handleEnded = () => {
    setIsCompleted(true);
    checkIn(); // Trigger achievement check-in
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/20">
      <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-rose-500" />
        {t.microWorkouts}
      </h3>

      {!activeWorkout ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {WORKOUTS.map((workout) => (
            <button
              key={workout.id}
              onClick={() => {
                setActiveWorkout(workout.id);
                setIsCompleted(false);
              }}
              className="p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 transition-all text-left group"
            >
              <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {workout.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1">{workout.desc}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-800">
              {WORKOUTS.find((w) => w.id === activeWorkout)?.title}
            </h4>
            <button
              onClick={() => {
                setActiveWorkout(null);
              }}
              className="text-sm text-slate-500 hover:text-slate-800"
            >
              {t.backToList}
            </button>
          </div>

          <div className="space-y-6">
            {WORKOUTS.find((w) => w.id === activeWorkout)?.videos.map((videoUrl, index) => (
              <div key={index} className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-sm">
                <ReactPlayer
                  src={videoUrl}
                  width="100%"
                  height="100%"
                  controls={true}
                  onEnded={handleEnded}
                  className="absolute top-0 left-0"
                />
              </div>
            ))}
          </div>

          {isCompleted && (
            <div className="mt-4 p-4 bg-emerald-50 rounded-xl flex items-center gap-3 text-emerald-700 animate-in fade-in duration-500">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-semibold">{t.workoutComplete}</h3>
                <p className="text-sm opacity-90">{t.streakUpdated}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
