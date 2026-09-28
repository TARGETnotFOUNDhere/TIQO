import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, LoaderCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { deleteTicket, getTicket, getTickets, updateTicket } from '../api/tickets';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import Toast from '../components/ui/Toast';

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'C';

const TicketDetailsPage = () => {
  const { ticketId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [relatedCount, setRelatedCount] = useState(null);
  const [customerSince, setCustomerSince] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [toast, setToast] = useState(location.state?.toast || '');
  const [toastTone, setToastTone] = useState('success');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(timeout);
  }, [toast]);

  const fetchTicket = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError('');
    }
    try {
      const data = await getTicket(ticketId);
      setTicket(data);
      try {
        const all = await getTickets();
        const related = all.filter((item) => item.customer_email === data.customer_email);
        setRelatedCount(related.length);
        const dates = related.map((item) => new Date(item.created_at)).sort((a, b) => a - b);
        setCustomerSince(dates[0] || new Date(data.created_at));
      } catch {
        setRelatedCount(null);
        setCustomerSince(data.created_at ? new Date(data.created_at) : null);
      }
    } catch {
      setError('Unable to load ticket details.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === ticket.status) return;
    setUpdateLoading(true);
    try {
      await updateTicket(ticket.ticket_id, { status: newStatus });
      setTicket((previous) => ({ ...previous, status: newStatus, updated_at: new Date().toISOString() }));
      setToastTone('success');
      setToast('Status updated');
    } catch {
      setToastTone('error');
      setToast('Something went wrong updating the ticket');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    setDeleteLoading(true);
    try {
      await deleteTicket(ticket.ticket_id);
      navigate('/dashboard', { state: { toast: `Ticket ${ticket.ticket_id} deleted.` } });
    } catch (err) {
      console.error('[Delete ticket error]', err?.response?.status, err?.response?.data, err?.message);
      const serverMsg = err?.response?.data?.detail;
      setToastTone('error');
      setToast(serverMsg ? `Delete failed: ${serverMsg}` : 'Failed to delete ticket. Please try again.');
      setDeleteOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddNote = async (event) => {
    event.preventDefault();
    if (!newNote.trim()) return;
    setUpdateLoading(true);
    try {
      await updateTicket(ticket.ticket_id, { notes: newNote });
      setNewNote('');
      await fetchTicket(true);
      setToastTone('success');
      setToast('Note added');
    } catch {
      setToastTone('error');
      setToast('Something went wrong adding the note');
    } finally {
      setUpdateLoading(false);
    }
  };

  const timeline = useMemo(() => {
    if (!ticket) return [];
    const events = [{ label: 'Ticket created', time: ticket.created_at }];
    if (ticket.notes?.length) {
      ticket.notes.forEach((note) => {
        events.push({ label: 'Internal note added', time: note.created_at });
      });
    }
    return events.sort((a, b) => new Date(a.time) - new Date(b.time));
  }, [ticket]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 rounded-lg shimmer" />
        <div className="h-64 rounded-3xl shimmer" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-48 rounded-3xl shimmer lg:col-span-2" />
          <div className="h-48 rounded-3xl shimmer" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="py-16 text-center">
        <h2 className="font-display text-2xl text-white light:text-slate-900">Unable to load workspace</h2>
        <p className="mt-2 text-sm text-slate-400">{error || "The ticket you're looking for doesn't exist."}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={fetchTicket} className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold text-white">
            Retry
          </button>
          <Link to="/" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <Toast message={toast} tone={toastTone} />

      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200/80 pb-5 dark:border-white/10">
        <div className="flex items-start gap-3">
          <Link
            to="/dashboard"
            className="mt-1 rounded-xl border border-stone-300 bg-[#FFFDF8] p-2 text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 active:scale-[0.98] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:text-white"
            title="Back to dashboard"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold tracking-wider text-[#245C68] dark:text-[#91b1b3]">
                {ticket.ticket_id}
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Created {format(new Date(ticket.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-50">
              {ticket.subject}
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex items-center gap-2 rounded-xl border border-stone-300 bg-[#FFFDF8] px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
            <span className="text-stone-500 dark:text-stone-400">Status:</span>
            <select
              className="bg-transparent font-semibold text-stone-900 focus:outline-none dark:text-stone-100"
              value={ticket.status}
              onChange={(event) => handleStatusChange(event.target.value)}
              disabled={updateLoading}
              aria-label="Update ticket status"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            title="Delete ticket"
            aria-label="Delete ticket"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#B94A48]/30 bg-[#FFFDF8] px-3.5 py-2 text-xs font-semibold text-[#B94A48] shadow-sm transition hover:bg-[#B94A48]/10 active:scale-[0.98] dark:bg-stone-800 dark:border-[#B94A48]/50 dark:hover:bg-[#B94A48]/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Ticket
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Description & Notes */}
        <div className="space-y-6 lg:col-span-2">
          {/* Issue Description */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-stone-200/90 bg-[#FFFDF8] p-6 shadow-sm dark:border-white/10 dark:bg-stone-900/60"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Description
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-800 dark:text-stone-200">
              {ticket.description}
            </p>
          </motion.section>

          {/* Internal Notes */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="overflow-hidden rounded-2xl border border-stone-200/90 bg-[#FFFDF8] shadow-sm dark:border-white/10 dark:bg-stone-900/60"
          >
            <div className="border-b border-stone-200/70 px-6 py-4 dark:border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Internal Notes
                </p>
                <span className="text-xs text-stone-400">
                  {ticket.notes?.length || 0} {ticket.notes?.length === 1 ? 'note' : 'notes'}
                </span>
              </div>
            </div>

            <div className="max-h-[360px] space-y-3.5 overflow-y-auto p-6">
              {!ticket.notes?.length ? (
                <p className="text-sm text-stone-500 italic">No internal notes added yet. Use the field below to document updates.</p>
              ) : (
                ticket.notes.map((note) => (
                  <motion.article
                    key={note.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#245C68]/15 text-xs font-bold text-[#245C68] dark:bg-[#245C68]/30 dark:text-[#91b1b3]">
                      AG
                    </div>
                    <div className="flex-1 rounded-xl rounded-tl-sm border border-stone-200 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-800/60">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100">Support Agent</span>
                        <span className="text-[11px] text-stone-400">
                          {format(new Date(note.created_at), 'MMM d, yyyy · h:mm a')}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-stone-800 dark:text-stone-200">
                        {note.note_text}
                      </p>
                    </div>
                  </motion.article>
                ))
              )}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2.5 border-t border-stone-200/70 p-4 dark:border-white/10">
              <input
                value={newNote}
                onChange={(event) => setNewNote(event.target.value)}
                placeholder="Add an internal note or update for your team..."
                disabled={updateLoading}
                className="input-field flex-1 rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
              <button
                type="submit"
                disabled={!newNote.trim() || updateLoading}
                className="btn-primary inline-flex items-center gap-1.5 rounded-xl bg-[#245C68] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4c56] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateLoading && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
                Add Note
              </button>
            </form>
          </motion.section>
        </div>

        {/* Right Column: Customer Info & Metadata */}
        <div className="space-y-6">
          {/* Customer Details */}
          <section className="rounded-2xl border border-stone-200/90 bg-[#FFFDF8] p-6 shadow-sm dark:border-white/10 dark:bg-stone-900/60">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Customer Information
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#245C68] text-sm font-bold text-white shadow-sm">
                {initials(ticket.customer_name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-stone-900 dark:text-stone-100">
                  {ticket.customer_name}
                </p>
                <a
                  href={`mailto:${ticket.customer_email}`}
                  className="truncate text-xs text-[#245C68] hover:underline dark:text-[#91b1b3]"
                >
                  {ticket.customer_email}
                </a>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 border-t border-stone-200/70 pt-4 text-xs text-stone-600 dark:border-white/10 dark:text-stone-400">
              {customerSince && (
                <div className="flex justify-between">
                  <span>First active</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-200">
                    {format(customerSince, 'MMM d, yyyy')}
                  </span>
                </div>
              )}
              {relatedCount != null && (
                <div className="flex justify-between">
                  <span>Customer ticket history</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-200">
                    {relatedCount} {relatedCount === 1 ? 'ticket' : 'tickets'}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1">
                <span>Current state</span>
                <StatusBadge status={ticket.status} />
              </div>
            </div>
          </section>

          {/* Ticket Metadata */}
          <section className="rounded-2xl border border-stone-200/90 bg-[#FFFDF8] p-6 shadow-sm dark:border-white/10 dark:bg-stone-900/60">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Ticket Details
            </p>
            <div className="mt-3.5 space-y-3 text-xs text-stone-600 dark:text-stone-400">
              <div className="flex justify-between">
                <span>Priority</span>
                <PriorityBadge priority={ticket.priority} />
              </div>
              <div className="flex justify-between">
                <span>Created</span>
                <span className="text-right font-medium text-stone-900 dark:text-stone-200">
                  {format(new Date(ticket.created_at), 'MMM d, yyyy · h:mm a')}
                </span>
              </div>
              {ticket.updated_at && (
                <div className="flex justify-between">
                  <span>Last updated</span>
                  <span className="text-right font-medium text-stone-900 dark:text-stone-200">
                    {format(new Date(ticket.updated_at), 'MMM d, yyyy · h:mm a')}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Activity Timeline */}
          <section className="rounded-2xl border border-stone-200/90 bg-[#FFFDF8] p-6 shadow-sm dark:border-white/10 dark:bg-stone-900/60">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Activity Trail
              </p>
              <span className="text-[10px] uppercase font-bold text-stone-400">Events</span>
            </div>
            <div className="mt-4 space-y-3.5">
              {timeline.map((item, index) => (
                <div key={`${item.label}-${item.time}-${index}`} className="flex gap-2.5">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#245C68] dark:bg-[#91b1b3]" />
                    {index < timeline.length - 1 && <span className="mt-1 w-px flex-1 bg-stone-200 dark:bg-stone-700" />}
                  </div>
                  <div className="pb-2">
                    <p className="text-xs font-medium text-stone-900 dark:text-stone-100">{item.label}</p>
                    <p className="text-[10px] text-stone-400">{format(new Date(item.time), 'MMM d, yyyy · h:mm a')}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteOpen && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-stone-950/40 p-4 backdrop-blur-xs"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleteLoading) setDeleteOpen(false);
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-ticket-title"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            className="w-full max-w-md rounded-2xl border border-stone-300 bg-[#FFFDF8] p-6 shadow-2xl dark:border-stone-700 dark:bg-stone-900"
          >
            <div className="flex items-start gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#B94A48]/10 text-[#B94A48]">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 id="delete-ticket-title" className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Delete ticket?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  Are you sure you want to permanently delete <strong className="font-mono text-stone-900 dark:text-stone-100">{ticket.ticket_id}</strong>?
                  This action cannot be undone and will remove associated notes.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                disabled={deleteLoading}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 active:scale-[0.98] disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTicket}
                disabled={deleteLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#B94A48] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a53e3c] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {deleteLoading ? 'Deleting…' : 'Delete Ticket'}
              </button>
            </div>
          </motion.section>
        </div>
      )}
    </div>
  );
};

export default TicketDetailsPage;
