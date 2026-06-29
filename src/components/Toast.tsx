import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export function Toast({ message, visible }: { message: string | null; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, y: 24, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
            className="fixed bottom-24 left-1/2 bg-stone-900 text-white pl-4 pr-5 py-3.5 rounded-2xl shadow-xl shadow-stone-900/30 ring-1 ring-white/10 flex items-center gap-3.5 z-55 pointer-events-none overflow-hidden"
        >
          {/* Subtle spinning checkmark on entry */}
          <motion.div
            initial={{ scale: 0.5, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.05 }}
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
          </motion.div>
          
          <span className="font-extrabold text-xs whitespace-nowrap tracking-wide text-stone-50">
            {message}
          </span>

          {/* Premium auto-shrinking timeout progress bar */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 3, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
