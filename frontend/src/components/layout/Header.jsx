import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Plus, Ticket, Menu, Moon, Sun, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import Logo from '../ui/Logo';
import { cn } from '../../lib/cn';
import { useTheme } from '../../contexts/ThemeContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard#tickets', label: 'Tickets', icon: Ticket, end: false, hash: true },
  { to: '/tickets/new', label: 'New Ticket', icon: Plus, end: false },
];

const NavItem = ({ to, label, icon: Icon, end, onClick, hash }) => {
  if (hash) {
    return (
      <Link
        to="/dashboard#tickets"
        onClick={onClick}
        className="relative flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 hover:bg-stone-200/50 dark:text-stone-400 dark:hover:text-white dark:hover:bg-white/5"
      >
        <Icon className="h-4 w-4 text-stone-500 dark:text-stone-400" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'text-[#245C68] font-semibold dark:text-stone-100'
            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 dark:text-stone-400 dark:hover:text-white dark:hover:bg-white/5'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="nav-glow"
              className="absolute inset-0 rounded-xl bg-[#245C68]/10 border border-[#245C68]/20 dark:bg-white/10 dark:border-white/15"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
          )}
          <Icon className={cn('relative z-10 h-4 w-4', isActive ? 'text-[#245C68] dark:text-white' : 'text-stone-500 dark:text-stone-400')} />
          <span className="relative z-10">{label}</span>
        </>
      )}
    </NavLink>
  );
};

export default function ShellNav() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="glass relative z-30 flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            className="rounded-xl p-2 text-slate-400 md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-3">
            <Logo size={36} />
            <div className="hidden sm:block">
              <p className="font-display text-base font-semibold tracking-tight brand-text">TIQO</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Support, beautifully organized.</p>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-[#4F7D61]/25 bg-[#4F7D61]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#4F7D61] lg:flex dark:border-[#4F7D61]/30 dark:bg-[#4F7D61]/15 dark:text-[#8fc4a2]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4F7D61] dark:bg-[#8fc4a2]" />
            Workspace active
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-stone-100"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <div className="hidden items-center gap-2 rounded-lg border border-white/8 bg-white/5 px-2 py-1.5 light:border-stone-300 light:bg-[#fffdf8] sm:flex" aria-label="TIQO support workspace">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-[#245C68] text-[10px] font-semibold text-white">T</div>
            <div className="pr-1">
              <p className="text-xs font-medium text-white light:text-stone-900">Support team</p>
              <p className="text-[10px] text-slate-500">TIQO workspace</p>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              className="glass h-full w-72 p-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-display font-semibold brand-text">TIQO</span>
                <button onClick={() => setOpen(false)} aria-label="Close navigation">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="section-label mb-3 px-3">Workspace</p>
              {links.map((item) => (
                <NavItem key={item.label} {...item} onClick={() => setOpen(false)} />
              ))}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
