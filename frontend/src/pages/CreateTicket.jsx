import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, LoaderCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { createTicket } from '../api/tickets';
import { cn } from '../lib/cn';

const priorities = ['High', 'Medium', 'Low'];

const CreateTicket = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'Medium',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError('');
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await createTicket(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/tickets/${response.ticket_id}`, { state: { toast: `Ticket ${response.ticket_id} created successfully.` } });
      }, 600);
    } catch {
      setError('Something went wrong. Unable to create ticket.');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl pb-12">
      <Link
        to="/dashboard"
        className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-stone-500 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Dashboard
      </Link>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="overflow-hidden rounded-2xl border border-stone-200/90 bg-[#FFFDF8] shadow-sm dark:border-white/10 dark:bg-stone-900/80"
      >
        <div className="border-b border-stone-200/70 px-6 py-5 dark:border-white/10">
          <p className="text-xs font-bold uppercase tracking-wider text-[#245C68] dark:text-[#91b1b3]">
            New Support Request
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            Create a ticket
          </h1>
          <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
            Capture customer details and issue context to route to the team.
          </p>
        </div>

        {success ? (
          <div className="grid place-items-center px-6 py-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#4F7D61]/15 text-[#4F7D61] dark:bg-[#4F7D61]/25 dark:text-[#8fc4a2]">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <p className="mt-4 font-display text-xl font-bold text-stone-900 dark:text-stone-100">
              Ticket created successfully
            </p>
            <p className="mt-1 text-xs text-stone-500">Redirecting to ticket details…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-7">
            {error && (
              <div className="flex gap-2.5 rounded-xl border border-[#B94A48]/30 bg-[#B94A48]/10 p-3.5 text-xs font-medium text-[#B94A48]">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
                <span>Customer Name *</span>
                <input
                  required
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className="input-field w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm font-normal text-stone-900 placeholder:text-stone-400 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                  placeholder="e.g. Alex Carter"
                />
              </label>

              <label className="space-y-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
                <span>Customer Email *</span>
                <input
                  required
                  type="email"
                  pattern=".+@.+[.].+"
                  title="Enter an email address with a dotted domain, such as name@example.com."
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  className="input-field w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm font-normal text-stone-900 placeholder:text-stone-400 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                  placeholder="alex@example.com"
                />
              </label>
            </div>

            <label className="block space-y-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
              <span>Subject *</span>
              <input
                required
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="input-field w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm font-normal text-stone-900 placeholder:text-stone-400 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                placeholder="e.g. Payment failed on checkout step 2"
              />
            </label>

            <label className="block space-y-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
              <span>Description *</span>
              <textarea
                required
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className="input-field w-full resize-y rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm font-normal text-stone-900 placeholder:text-stone-400 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                placeholder="Provide details about the customer request..."
              />
            </label>

            <div>
              <p className="mb-2 text-xs font-semibold text-stone-700 dark:text-stone-300">Priority</p>
              <div className="flex flex-wrap gap-2">
                {priorities.map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormData((previous) => ({ ...previous, priority }))}
                    className={cn(
                      'rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition active:scale-[0.98]',
                      formData.priority === priority
                        ? 'border-[#245C68] bg-[#245C68] text-white shadow-sm'
                        : 'border-stone-300 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                    )}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-stone-200/70 pt-5 dark:border-white/10">
              <Link
                to="/dashboard"
                className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 active:scale-[0.98] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary inline-flex items-center gap-2 rounded-xl bg-[#245C68] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4c56] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {loading ? 'Creating…' : 'Create Ticket'}
              </button>
            </div>
          </form>
        )}
      </motion.section>
    </div>
  );
};

export default CreateTicket;
