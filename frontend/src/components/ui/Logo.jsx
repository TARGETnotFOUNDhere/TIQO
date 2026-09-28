import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

export default function Logo({ className, size = 40 }) {
  return (
    <motion.div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
        <circle cx="24" cy="24" r="22" fill="url(#sf-mark-fill)" />
        <circle cx="24" cy="24" r="21" stroke="url(#sf-mark-ring)" strokeWidth="1.2" opacity="0.7" />
        <motion.ellipse
          cx="24" cy="24" rx="14" ry="7"
          stroke="currentColor" strokeWidth="1.3" className="text-white/70"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <motion.ellipse
          cx="24" cy="24" rx="7" ry="14"
          stroke="currentColor" strokeWidth="1.3" className="text-orange-200/90"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.circle
          cx="24" cy="24" r="3.4" fill="white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.8 }}
        />
        <motion.circle
          cx="38" cy="18" r="2.2" fill="#C86B4A"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        />
        <motion.circle
          cx="12" cy="30" r="1.6" fill="#d7c9aa"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        />
        <defs>
          <linearGradient id="sf-mark-fill" x1="8" y1="6" x2="42" y2="44">
            <stop stopColor="#245C68" />
            <stop offset="1" stopColor="#C86B4A" />
          </linearGradient>
          <linearGradient id="sf-mark-ring" x1="0" y1="0" x2="48" y2="48">
            <stop stopColor="#245C68" />
            <stop offset="1" stopColor="#C86B4A" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}
