import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language } from './i18n';

export type InterventionStage = 'idle' | 'sound' | 'text' | 'overlay';

interface AppState {
  // Global Settings
  language: Language;
  setLanguage: (lang: Language) => void;

  // 20-20-20 Settings
  isTimerActive: boolean;
  interventionStage: InterventionStage;
  timeRemaining: number;
  
  // Posture Settings
  isPostureEnabled: boolean;
  isBadPosture: boolean;
  badPostureDuration: number;
  
  // Audio Settings
  audioVolumes: Record<string, number>;
  
  // Hydration Settings
  waterIntake: number;
  waterGoal: number;
  isWaterReminderActive: boolean;
  lastWaterResetDate: string | null;
  
  // Achievements
  streakDays: number;
  badges: string[];
  lastCheckIn: string | null;
  
  // Actions
  toggleTimer: () => void;
  setInterventionStage: (stage: InterventionStage) => void;
  setTimeRemaining: (time: number) => void;
  togglePosture: () => void;
  setBadPosture: (isBad: boolean) => void;
  incrementBadPostureDuration: () => void;
  resetBadPostureDuration: () => void;
  setAudioVolume: (id: string, volume: number) => void;
  checkIn: () => void;
  addWater: (amount: number) => void;
  toggleWaterReminder: () => void;
  checkWaterReset: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),

      isTimerActive: false,
      interventionStage: 'idle',
      timeRemaining: 20 * 60, // 20 minutes
      
      isPostureEnabled: false,
      isBadPosture: false,
      badPostureDuration: 0,
      
      audioVolumes: {
        rain: 0,
        whiteNoise: 0,
        forest: 0,
      },
      
      waterIntake: 0,
      waterGoal: 2000,
      isWaterReminderActive: false,
      lastWaterResetDate: null,
      
      streakDays: 0,
      badges: [],
      lastCheckIn: null,
      
      toggleTimer: () => set((state) => ({ isTimerActive: !state.isTimerActive })),
      setInterventionStage: (stage) => set({ interventionStage: stage }),
      setTimeRemaining: (time) => set({ timeRemaining: time }),
      
      togglePosture: () => set((state) => ({ isPostureEnabled: !state.isPostureEnabled })),
      setBadPosture: (isBad) => set({ isBadPosture: isBad }),
      incrementBadPostureDuration: () => set((state) => ({ badPostureDuration: state.badPostureDuration + 1 })),
      resetBadPostureDuration: () => set({ badPostureDuration: 0 }),
      
      setAudioVolume: (id, volume) => set((state) => ({
        audioVolumes: { ...state.audioVolumes, [id]: volume }
      })),
      
      checkIn: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        if (state.lastCheckIn !== today) {
          const isConsecutive = state.lastCheckIn === new Date(Date.now() - 86400000).toISOString().split('T')[0];
          const newStreak = isConsecutive ? state.streakDays + 1 : 1;
          const newBadges = [...state.badges];
          if (newStreak === 7 && !newBadges.includes('7-Day Warrior')) newBadges.push('7-Day Warrior');
          if (newStreak === 30 && !newBadges.includes('30-Day Master')) newBadges.push('30-Day Master');
          
          set({ streakDays: newStreak, lastCheckIn: today, badges: newBadges });
        }
      },
      
      addWater: (amount) => set((state) => ({ 
        waterIntake: Math.min(state.waterIntake + amount, state.waterGoal * 2) 
      })),
      
      toggleWaterReminder: () => set((state) => ({ 
        isWaterReminderActive: !state.isWaterReminderActive 
      })),
      
      checkWaterReset: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        if (state.lastWaterResetDate !== today) {
          set({ waterIntake: 0, lastWaterResetDate: today });
        }
      },
    }),
    {
      name: 'lumina-health-storage',
      partialize: (state) => ({
        language: state.language,
        audioVolumes: state.audioVolumes,
        streakDays: state.streakDays,
        badges: state.badges,
        lastCheckIn: state.lastCheckIn,
        waterIntake: state.waterIntake,
        isWaterReminderActive: state.isWaterReminderActive,
        lastWaterResetDate: state.lastWaterResetDate,
      }),
    }
  )
);
