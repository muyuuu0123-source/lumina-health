import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, X } from 'lucide-react';

export function Toast() {
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    const handleShowToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      setToast(customEvent.detail);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setToast(null);
      }, 5000);
    };

    window.addEventListener('show-toast', handleShowToast);
    return () => window.removeEventListener('show-toast', handleShowToast);
  }, []);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-8 left-1/2 z-50 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl border border-slate-200 flex items-start gap-4 min-w-[300px]"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 shrink-0 mt-1">
            <Droplets className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-slate-800 font-semibold">{toast.title}</h4>
            <p className="text-slate-500 text-sm mt-1">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
