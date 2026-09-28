import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Command,
  Plus,
  RefreshCw,
  Search,
  Ticket,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getTickets } from '../api/tickets';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { cn } from '../lib/cn';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import SupportPulse from '../components/ui/SupportPulse';
import TicketCard from '../components/tickets/TicketCard';
import Toast from '../components/ui/Toast';

const statusOptions = ['All', 'Open', 'In Progress', 'Closed'];
const priorityOptions = ['All', 'High', 'Medium', 'Low'];

const Dashboard = () => {
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [overview, setOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchFocused, setSearchFocused] = useState(false);
  const [toast, setToast] = useState(location.state?.toast || '');
  const [toastTone, setToastTone] = useState(location.state?.tone || 'success');
  const searchInputRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const debouncedSearch = useDebouncedValue(searchTerm, 240);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(timeout);
  }, [toast]);

  const loadOverview = async () => {
    const data = await getTickets();
    const list = Array.isArray(data) ? data : [];
    setOverview(list);
    return list;
  };

  const loadWorkspace = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [all, filtered] = await Promise.all([
        loadOverview(),
        getTickets(statusFilter, debouncedSearch || null, priorityFilter),
      ]);
      const validFiltered = Array.isArray(filtered) ? filtered : [];
      setTickets(validFiltered);
      if (!all) setOverview(validFiltered);
      if (isManualRefresh) {
        setToast('Tickets refreshed');
        setToastTone('success');
      }
    } catch {
      setError('Unable to load workspace');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [statusFilter, priorityFilter, debouncedSearch]);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const stats = useMemo(
    () => ({
      total: overview.length,
      open: overview.filter((ticket) => ticket.status === 'Open').length,
      inProgress: overview.filter((ticket) => ticket.status === 'In Progress').length,
      closed: overview.filter((ticket) => ticket.status === 'Closed' || ticket.status === 'Resolved').length,
    }),
    [overview]
  );

  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return overview
      .filter(
        (ticket) =>
          ticket.ticket_id.toLowerCase().includes(term) ||
          ticket.customer_name.toLowerCase().includes(term) ||
          (ticket.customer_email && ticket.customer_email.toLowerCase().includes(term)) ||
          ticket.subject.toLowerCase().includes(term) ||
          (ticket.description && ticket.description.toLowerCase().includes(term))
      )
      .slice(0, 5);
  }, [overview, searchTerm]);

  return (
    <div className="page-shell space-y-8 pb-8">
      <Toast message={toast} tone={toastTone} />

      {/* Hero Workspace Overview */}
      <section className="hero-panel relative overflow-hidden rounded-3xl border border-stone-200/90 bg-[#FFFDF8] p-6 sm:p-8 lg:p-9 shadow-sm dark:border-white/10 dark:bg-stone-900/80">
        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4F7D61]/30 bg-[#4F7D61]/10 px-3 py-1 text-[11px] font-semibold text-[#4F7D61] dark:border-[#4F7D61]/40 dark:bg-[#4F7D61]/20 dark:text-[#8fc4a2]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4F7D61]" />
                Support Workspace Live
              </span>
            </div>

            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl dark:text-stone-50">
                Support that moves
                <br />
                <span className="text-[#245C68] dark:text-[#91b1b3]">work forward.</span>
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-stone-600 sm:text-base dark:text-stone-300">
                Keep every customer conversation moving with clean visibility into what requires attention and what is resolved.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/tickets/new"
                className="btn-primary inline-flex items-center gap-2 rounded-xl bg-[#245C68] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4c56] active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                New Ticket
              </Link>

              <button
                type="button"
                onClick={() => loadWorkspace(true)}
                disabled={refreshing || loading}
                title="Refresh tickets"
                aria-label="Refresh tickets"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50 active:scale-[0.98] disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
              >
                <RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin text-[#245C68]')} />
                <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
              </button>

              <div className="hidden rounded-xl border border-stone-200 bg-stone-100/70 px-3.5 py-2 text-xs font-medium text-stone-600 sm:flex dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
                {stats.open} open · {stats.inProgress} in progress · {stats.closed} closed
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center py-2 lg:pl-4">
            <div className="hero-visual rounded-2xl border border-stone-200/80 bg-[#F4F1EA] p-4 shadow-inner dark:border-white/10 dark:bg-stone-800/50">
              <SupportPulse total={stats.total} open={stats.open} inProgress={stats.inProgress} closed={stats.closed} />
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <p className="section-label text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Realtime Overview
          </p>
          <span className="text-xs text-stone-400">
            {overview.length} total recorded {overview.length === 1 ? 'ticket' : 'tickets'}
          </span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Total tickets',
              value: stats.total,
              hint: 'All customer requests',
              icon: Ticket,
              accent: 'text-[#245C68] dark:text-[#91b1b3]',
            },
            {
              label: 'Open',
              value: stats.open,
              hint: 'Awaiting first response',
              icon: AlertCircle,
              accent: 'text-[#245C68] dark:text-[#91b1b3]',
            },
            {
              label: 'In progress',
              value: stats.inProgress,
              hint: 'Currently being handled',
              icon: Clock,
              accent: 'text-[#B4863A] dark:text-[#f3cc7a]',
            },
            {
              label: 'Closed',
              value: stats.closed,
              hint: 'Successfully resolved',
              icon: CheckCircle2,
              accent: 'text-[#4F7D61] dark:text-[#8fc4a2]',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: index * 0.04 }}
              className="stat-card relative overflow-hidden rounded-2xl border border-stone-200/90 bg-[#FFFDF8] p-5 shadow-sm dark:border-white/10 dark:bg-stone-900/60"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                  {stat.label}
                </span>
                <stat.icon className={cn('h-4 w-4', stat.accent)} />
              </div>
              <p className="mt-3 font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                <AnimatedNumber value={stat.value} />
              </p>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{stat.hint}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Ticket List & Queue Section */}
      <section id="tickets" className="scroll-mt-24 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              The Queue
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              Tickets requiring action
            </h2>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Search by customer, subject, or ID, and filter instantly.
            </p>
          </div>
          <Link
            to="/tickets/new"
            className="btn-primary inline-flex w-fit items-center gap-2 rounded-xl bg-[#245C68] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4c56] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Link>
        </div>

        {/* Search Bar */}
        <div className="search-shell relative rounded-2xl border border-stone-300 bg-[#FFFDF8] p-1 shadow-sm transition-all focus-within:border-[#245C68] focus-within:ring-2 focus-within:ring-[#245C68]/20 dark:border-white/10 dark:bg-stone-900/90">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Search by ticket ID, customer name, email, or subject..."
              className="input-field w-full rounded-xl py-3 pl-10 pr-20 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none dark:text-stone-100"
              aria-label="Search tickets"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                title="Clear search"
                aria-label="Clear search"
                className="absolute right-10 top-1/2 -translate-y-1/2 rounded-md p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
            <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-stone-200 bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
              <Command className="h-3 w-3" /> K
            </span>
          </div>

          {/* Quick search suggestions popup */}
          <AnimatePresence>
            {searchFocused && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-stone-200 bg-[#FFFDF8] shadow-xl dark:border-stone-700 dark:bg-stone-900"
              >
                <div className="border-b border-stone-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:border-stone-800">
                  Matching Tickets
                </div>
                {suggestions.map((ticket) => (
                  <Link
                    key={ticket.ticket_id}
                    to={`/tickets/${ticket.ticket_id}`}
                    className="flex items-center justify-between px-3.5 py-2.5 text-sm text-stone-800 transition hover:bg-stone-100/70 dark:text-stone-200 dark:hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#245C68] dark:text-[#91b1b3]">
                        {ticket.ticket_id}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="font-medium text-stone-900 dark:text-stone-100">{ticket.customer_name}</span>
                      <span className="truncate text-xs text-stone-500 dark:text-stone-400 max-w-[260px]">
                        — {ticket.subject}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-stone-400">{ticket.status}</span>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-stone-200/70 py-3 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">
              Status:
            </span>
            {statusOptions.map((status) => (
              <motion.button
                key={status}
                type="button"
                whileTap={reduced ? undefined : { scale: 0.97 }}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'rounded-lg border px-3 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245C68]/40',
                  statusFilter === status
                    ? 'border-[#245C68] bg-[#245C68] text-white shadow-sm dark:border-[#91b1b3] dark:bg-[#245C68]'
                    : 'border-stone-300 bg-[#FFFDF8] text-stone-600 hover:border-stone-400 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                )}
                aria-pressed={statusFilter === status}
              >
                {status}
              </motion.button>
            ))}

            <span className="mx-2 hidden h-4 w-px bg-stone-300 sm:inline-block dark:bg-stone-700" />

            <span className="mr-1 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">
              Priority:
            </span>
            {priorityOptions.map((priority) => (
              <motion.button
                key={priority}
                type="button"
                whileTap={reduced ? undefined : { scale: 0.97 }}
                onClick={() => setPriorityFilter(priority)}
                className={cn(
                  'rounded-lg border px-3 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245C68]/40',
                  priorityFilter === priority
                    ? 'border-stone-800 bg-stone-800 text-white shadow-sm dark:border-white dark:bg-white dark:text-stone-900'
                    : 'border-stone-300 bg-[#FFFDF8] text-stone-600 hover:border-stone-400 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                )}
                aria-pressed={priorityFilter === priority}
              >
                {priority}
              </motion.button>
            ))}
          </div>

          {(searchTerm || statusFilter !== 'All' || priorityFilter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setPriorityFilter('All');
              }}
              className="text-xs font-semibold text-[#245C68] hover:underline dark:text-[#91b1b3]"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Ticket List View States */}
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-[#FFFDF8] p-8 text-center dark:border-rose-900/50 dark:bg-stone-900">
            <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">Unable to load workspace</h3>
            <p className="mt-1.5 text-sm text-stone-600 dark:text-stone-400">Something went wrong while retrieving your tickets.</p>
            <button
              type="button"
              onClick={() => loadWorkspace(true)}
              className="btn-primary mt-4 rounded-xl bg-[#245C68] px-4 py-2 text-sm font-semibold text-white shadow-sm"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-40 rounded-2xl shimmer" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-[#FFFDF8] px-6 py-16 text-center shadow-sm dark:border-white/10 dark:bg-stone-900/60">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500">
              <Ticket className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-stone-900 dark:text-stone-100">
              {searchTerm || statusFilter !== 'All' || priorityFilter !== 'All'
                ? 'No tickets found'
                : 'No tickets yet'}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-stone-600 dark:text-stone-400">
              {searchTerm || statusFilter !== 'All' || priorityFilter !== 'All'
                ? 'Try another search term or clear the active status and priority filters.'
                : 'Create your first ticket and start organizing customer requests.'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {searchTerm || statusFilter !== 'All' || priorityFilter !== 'All' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('All');
                    setPriorityFilter('All');
                  }}
                  className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                >
                  Clear filters
                </button>
              ) : (
                <Link
                  to="/tickets/new"
                  className="btn-primary inline-flex items-center gap-2 rounded-xl bg-[#245C68] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  + New Ticket
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span>
                Showing {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
              </span>
              <span>Sorted by most recent</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {tickets.map((ticket, index) => (
                <TicketCard key={ticket.id || ticket.ticket_id} ticket={ticket} index={index} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
