import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock3, RotateCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import StatusBadge from '../ui/StatusBadge';
import PriorityBadge from '../ui/PriorityBadge';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export default function TicketCard({ ticket, index = 0 }) {
  const reduced = usePrefersReducedMotion();

  const createdTimeAgo = ticket.created_at
    ? formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })
    : 'Recently';

  const updatedTimeAgo = ticket.updated_at && ticket.updated_at !== ticket.created_at
    ? formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })
    : null;

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.03, 0.24) }}
    >
      <Link
        to={`/tickets/${ticket.ticket_id}`}
        className="ticket-card group relative block overflow-hidden rounded-2xl border border-stone-200/90 bg-[#FFFDF8] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#245C68]/40 hover:shadow-[0_12px_28px_-16px_rgba(28,28,26,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245C68]/60 focus-visible:ring-offset-2 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-[#245C68]/50"
      >
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[11px] font-bold tracking-wider text-[#245C68] dark:text-[#91b1b3]">
              {ticket.ticket_id}
            </span>
            <span className="text-stone-300 dark:text-stone-600">·</span>
            <span className="truncate text-xs font-semibold text-stone-900 dark:text-stone-100">
              {ticket.customer_name}
            </span>
          </div>
          <PriorityBadge priority={ticket.priority} />
        </div>

        <div className="mb-4">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-stone-900 transition-colors group-hover:text-[#245C68] dark:text-stone-100 dark:group-hover:text-[#91b1b3]">
            {ticket.subject}
          </h3>
          {ticket.customer_email && (
            <p className="mt-1 truncate text-xs text-stone-500 dark:text-stone-400">
              {ticket.customer_email}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-stone-200/70 pt-3 text-xs text-stone-500 dark:border-white/8 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <StatusBadge status={ticket.status} />
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1" title={`Created ${ticket.created_at || ''}`}>
              <Clock3 className="h-3 w-3 text-stone-400" />
              {createdTimeAgo}
            </span>
            {updatedTimeAgo && (
              <span className="inline-flex items-center gap-1 text-stone-400" title={`Updated ${ticket.updated_at || ''}`}>
                <RotateCw className="h-2.5 w-2.5" />
                Updated {updatedTimeAgo}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between border-t border-stone-100 pt-2.5 dark:border-white/5">
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500">
            View full conversation
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#245C68] transition-transform group-hover:translate-x-0.5 dark:text-[#91b1b3]">
            Open <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
