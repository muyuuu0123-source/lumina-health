import { useStore } from '../store';
import { translations } from '../i18n';
import { Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef } from 'react';

const AUDIO_SOURCES: Record<string, { ogg: string; mp3: string }> = {
  rain: {
    ogg: 'https://cdn.jsdelivr.net/gh/petrovicstefanrs/chillnsound@master/app/sounds/rain.ogg',
    mp3: 'https://cdn.jsdelivr.net/gh/petrovicstefanrs/chillnsound@master/app/sounds/rain.mp3',
  },
  whiteNoise: {
    ogg: 'https://cdn.jsdelivr.net/gh/petrovicstefanrs/chillnsound@master/app/sounds/pinknoise.ogg',
    mp3: 'https://cdn.jsdelivr.net/gh/petrovicstefanrs/chillnsound@master/app/sounds/pinknoise.mp3',
  },
  forest: {
    ogg: 'https://cdn.jsdelivr.net/gh/petrovicstefanrs/chillnsound@master/app/sounds/forest.ogg',
    mp3: 'https://cdn.jsdelivr.net/gh/petrovicstefanrs/chillnsound@master/app/sounds/forest.mp3',
  },
};

export function AudioMixer() {
  const language = useStore((state) => state.language);
  const t = translations[language];
  const audioVolumes = useStore((state) => state.audioVolumes);
  const setAudioVolume = useStore((state) => state.setAudioVolume);

  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Initialize audio elements
    Object.keys(AUDIO_SOURCES).forEach((id) => {
      if (!audioRefs.current[id]) {
        const audio = document.createElement('audio');
        audio.loop = true;
        
        const sourceOgg = document.createElement('source');
        sourceOgg.src = AUDIO_SOURCES[id].ogg;
        sourceOgg.type = 'audio/ogg';
        
        const sourceMp3 = document.createElement('source');
        sourceMp3.src = AUDIO_SOURCES[id].mp3;
        sourceMp3.type = 'audio/mpeg';
        
        audio.appendChild(sourceOgg);
        audio.appendChild(sourceMp3);
        
        // Set initial volume
        audio.volume = (audioVolumes[id] || 0) / 100;
        audioRefs.current[id] = audio;
      }
    });

    return () => {
      // Cleanup on unmount
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
      });
      audioRefs.current = {};
    };
  }, []); // Run once on mount

  useEffect(() => {
    // Update volumes and play/pause state when audioVolumes change
    Object.keys(AUDIO_SOURCES).forEach((id) => {
      const audio = audioRefs.current[id];
      const volume = audioVolumes[id] || 0;
      
      if (audio) {
        audio.volume = volume / 100;
        
        if (volume > 0 && audio.paused) {
          audio.play().catch(e => console.error(`Failed to play ${id}:`, e));
        } else if (volume === 0 && !audio.paused) {
          audio.pause();
        }
      }
    });
  }, [audioVolumes]);

  const tracks = [
    { id: 'rain', label: t.rain },
    { id: 'whiteNoise', label: t.whiteNoise },
    { id: 'forest', label: t.forest },
  ];

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/20">
      <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-indigo-500" />
        {t.audioSpace}
      </h3>
      <div className="space-y-4">
        {tracks.map((track) => (
          <div key={track.id} className="flex items-center gap-4">
            <span className="w-24 text-sm text-slate-600">{track.label}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={audioVolumes[track.id] || 0}
              onChange={(e) => setAudioVolume(track.id, parseInt(e.target.value))}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="w-8 text-xs text-right text-slate-400">
              {audioVolumes[track.id] || 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
