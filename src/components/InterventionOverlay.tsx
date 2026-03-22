import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { translations } from '../i18n';
import { Eye, Droplets, Activity } from 'lucide-react';

export function InterventionOverlay() {
  const language = useStore((state) => state.language);
  const t = translations[language];

  const PROMPTS = [
    { type: 'eye', text: t.prompts.eye1, icon: Eye },
    { type: 'eye', text: t.prompts.eye2, icon: Eye },
    { type: 'water', text: t.prompts.water1, icon: Droplets },
    { type: 'water', text: t.prompts.water2, icon: Droplets },
    { type: 'stretch', text: t.prompts.stretch1, icon: Activity },
    { type: 'stretch', text: t.prompts.stretch2, icon: Activity },
  ];

  const interventionStage = useStore((state) => state.interventionStage);
  const setInterventionStage = useStore((state) => state.setInterventionStage);
  const [prompt, setPrompt] = useState(PROMPTS[0]);

  useEffect(() => {
    if (interventionStage === 'text' || interventionStage === 'overlay') {
      setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    }
  }, [interventionStage]);

  const handleDismiss = () => {
    setInterventionStage('idle');
  };

  return (
    <AnimatePresence>
      {interventionStage === 'overlay' && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 text-white p-8"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center max-w-2xl"
          >
            <prompt.icon className="w-24 h-24 mx-auto mb-8 text-indigo-300 opacity-80" />
            <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-6 leading-tight">
              {prompt.text}
            </h2>
            <p className="text-xl text-slate-300 font-light tracking-wide mb-12">
              {t.breathe}
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDismiss}
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-lg font-medium transition-colors"
            >
              {t.imBack}
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {interventionStage === 'text' && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl border border-slate-200 flex items-center gap-4"
        >
          <prompt.icon className="w-6 h-6 text-indigo-500" />
          <p className="text-slate-800 font-medium">{prompt.text}</p>
          <button
            onClick={handleDismiss}
            className="ml-4 text-sm text-slate-500 hover:text-slate-800 underline underline-offset-4"
          >
            {t.dismiss}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
