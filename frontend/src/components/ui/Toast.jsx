import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export default function Toast({ message, tone = 'success' }) {
  const reduced = usePrefersReducedMotion();
  const isError = tone === 'error';

  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          role="status"
          initial={reduced ? false : { opacity: 0, y: -10, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, filter: 'blur(4px)' }}
          transition={{ duration: 0.28 }}
          className={`fixed right-4 top-20 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-md transition-all ${
            isError
              ? 'border-[#B94A48]/30 bg-[#FFFDF8] text-[#B94A48] dark:bg-stone-900 dark:border-[#B94A48]/50'
              : 'border-[#4F7D61]/30 bg-[#FFFDF8] text-[#4F7D61] dark:bg-stone-900 dark:border-[#4F7D61]/50'
          }`}
        >
          {isError ? <AlertCircle className="h-4 w-4 shrink-0 text-[#B94A48]" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4F7D61]" />}
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
