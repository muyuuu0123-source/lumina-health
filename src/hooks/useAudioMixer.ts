import { useEffect, useRef } from 'react';
import { useStore } from '../store';

const AUDIO_SOURCES = {
  rain: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Rain_on_roof.ogg',
  whiteNoise: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/White_noise.ogg',
  forest: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Forest_birds_in_spring.ogg',
};

export function useAudioMixer() {
  const audioVolumes = useStore((state) => state.audioVolumes);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Initialize audio elements
    Object.entries(AUDIO_SOURCES).forEach(([key, src]) => {
      if (!audioRefs.current[key]) {
        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = 0;
        audioRefs.current[key] = audio;
      }
    });

    return () => {
      Object.values(audioRefs.current).forEach((audio: HTMLAudioElement) => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  useEffect(() => {
    // Update volumes based on state
    Object.entries(audioVolumes).forEach(([key, volume]) => {
      const audio = audioRefs.current[key];
      if (audio) {
        audio.volume = volume / 100;
        if (volume > 0 && audio.paused) {
          audio.play().catch(e => console.error('Audio play failed:', e));
        } else if (volume === 0 && !audio.paused) {
          audio.pause();
        }
      }
    });
  }, [audioVolumes]);

  return audioRefs.current;
}
