import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Ticket,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getTickets } from '../api/tickets';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const flowCards = [
  { id: 'TKT-001', subject: 'Payment not working', customer: 'Ava Brooks', status: 'Open', tint: 'blue' },
  { id: 'TKT-002', subject: 'Refund request', customer: 'Milo Chen', status: 'In Progress', tint: 'teal' },
  { id: 'TKT-003', subject: 'Login issue', customer: 'Jade Turner', status: 'Resolved', tint: 'violet' },
];

const features = [
  {
    title: 'Create',
    description: 'Create support tickets in seconds with the customer context your team needs.',
    icon: Ticket,
    accent: 'blue',
  },
  {
    title: 'Search',
    description: 'Find relevant tickets quickly with targeted search across customer and issue details.',
    icon: Search,
    accent: 'teal',
  },
  {
    title: 'Track',
    description: 'Keep every issue moving with clear statuses, priority signals, and visible updates.',
    icon: SlidersHorizontal,
    accent: 'violet',
  },
  {
    title: 'Resolve',
    description: 'Move support requests from triage to resolution with a clean activity trail.',
    icon: CheckCircle2,
    accent: 'green',
  },
];

const workflowSteps = [
  { number: '01', title: 'Customer requests help', caption: 'A new ticket arrives with context attached.' },
  { number: '02', title: 'Team takes action', caption: 'Support reviews, prioritizes, and assigns next steps.' },
  { number: '03', title: 'Progress is tracked', caption: 'Updates and notes keep the team aligned in one place.' },
  { number: '04', title: 'Issue is resolved', caption: 'The customer gets a clear outcome and a complete record.' },
];

const journeyStages = [
  { label: 'Open', copy: 'New request created', tone: 'blue' },
  { label: 'Assigned', copy: 'Support team reviewing', tone: 'amber' },
  { label: 'In Progress', copy: 'Investigation underway', tone: 'violet' },
  { label: 'Resolved', copy: 'Customer issue closed', tone: 'green' },
];

const statusClass = {
  Open: 'border-[#245C68]/25 bg-[#245C68]/10 text-[#245C68]',
  'In Progress': 'border-[#B4863A]/25 bg-[#B4863A]/10 text-[#B4863A]',
  Resolved: 'border-[#4F7D61]/25 bg-[#4F7D61]/10 text-[#4F7D61]',
};

export default function LandingPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const journeyProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    let isMounted = true;

    getTickets()
      .then((data) => {
        if (isMounted) setTickets(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (isMounted) setTickets([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === 'Open').length,
      inProgress: tickets.filter((ticket) => ticket.status === 'In Progress').length,
      closed: tickets.filter((ticket) => ticket.status === 'Closed').length,
    }),
    [tickets]
  );

  return (
    <div className="landing-page">
      <section className="hero-shell">
        <div className="grid-glow" />
        <div className="orb orb-blue" />
        <div className="orb orb-teal" />
        <div className="soft-dot" />

        <div className="hero-image-panel" style={{
          position: 'absolute',
          inset: '18px 18px auto auto',
          width: '180px',
          height: '180px',
          borderRadius: '28px',
          overflow: 'hidden',
          border: '1px solid rgba(140,112,84,0.16)',
          boxShadow: '0 24px 48px -30px rgba(122,76,46,0.5)',
          zIndex: 2,
          background: '#f5efe8'
        }}>
          <img
            src="/images/support-team-scene.svg"
            alt="Support team reviewing requests"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        <div className="hero-inner">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hero-copy"
          >
            <p className="eyebrow">CUSTOMER SUPPORT PLATFORM</p>
            <h1 className="hero-heading">
              Turn every support request
              <span className="headline-accent"> into a clear next step.</span>
            </h1>
            <p className="hero-subhead">
              Create, track, and resolve customer tickets from one beautifully organized workspace.
            </p>

            <div className="cta-row">
              <Link to="/dashboard" className="primary-button">
                Open Dashboard <ArrowRight size={16} />
              </Link>
              <a href="#how-it-works" className="secondary-button">
                Explore how it works
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="hero-visual"
          >
            <div className="ticket-flow-path" />

            {flowCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={reduced ? false : { opacity: 0, rotateX: -60, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 150, damping: 15, delay: index * 0.18 + 0.2 }}
                style={{ transformPerspective: 1000, transformOrigin: 'top' }}
                className={`floating-ticket ticket-${index + 1} ${card.tint} shadow-xl`}
              >
                <div className="ticket-topline">
                  <span className="ticket-id">{card.id}</span>
                  <span className={`status-pill ${statusClass[card.status] || statusClass.Open}`}>{card.status}</span>
                </div>
                <h3>{card.subject}</h3>
                <p>{card.customer}</p>
              </motion.div>
            ))}

            <div className="workflow-legend">
              <span>Customer Request</span>
              <span className="arrow">↓</span>
              <span>Support Team</span>
              <span className="arrow">↓</span>
              <span>In Progress</span>
              <span className="arrow">↓</span>
              <span>Resolved</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section ref={sectionRef} className="journey-section">
        <div className="section-head narrow">
          <p className="eyebrow alt">Ticket lifecycle</p>
          <h2>Every ticket has a journey.</h2>
        </div>

        <div className="journey-layout">
          <div className="journey-timeline">
            {journeyStages.map((stage, index) => (
              <motion.div
                key={stage.label}
                initial={reduced ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.45, delay: index * 0.12 }}
                className="journey-step"
              >
                <div className={`step-dot ${stage.tone}`} />
                <div>
                  <span className="step-name">{stage.label}</span>
                  <p>{stage.copy}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="journey-visual">
            <div className="journey-track" />
            <motion.div style={{ scaleY: journeyProgress }} className="journey-progress" />

            <motion.article
              initial={reduced ? false : { opacity: 0, rotateX: -80, y: 60, scale: 0.9 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ type: 'spring', stiffness: 120, damping: 15, mass: 1.2 }}
              style={{ transformPerspective: 1500, transformOrigin: 'top center' }}
              className="main-ticket-card shadow-2xl"
            >
              <div className="ticket-topline">
                <span className="ticket-id">TKT-1042</span>
                  <span className="status-pill border-[#245C68]/25 bg-[#245C68]/10 text-[#245C68]">Open</span>
              </div>
              <h3>Unable to access account</h3>
              <div className="meta-grid">
                <div>
                  <span>Customer</span>
                  <strong>Rina Patel</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>rina@northlane.io</strong>
                </div>
                <div>
                  <span>Priority</span>
                  <strong>High</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>Open</strong>
                </div>
              </div>
              <div className="ticket-footer">
                <span>Created 2h ago</span>
                <span>Customer story — review needed</span>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      <section className="metrics-section">
        <div className="section-head">
          <p className="eyebrow alt">Support overview</p>
          <h2>Everything your support team needs.</h2>
          <p className="section-copy">One workspace. Every conversation. Clearer resolutions.</p>
        </div>

        <div className="metrics-wrap">
          <div className="metric panel-large">
            <span className="metric-label">Total tickets</span>
            <strong><AnimatedNumber value={loading ? 0 : stats.total} /></strong>
            <small>Live queue</small>
          </div>

          <div className="metric panel-small">
            <span className="metric-label">Open</span>
            <strong><AnimatedNumber value={loading ? 0 : stats.open} /></strong>
            <div className="mini-ring ring-blue" />
          </div>

          <div className="metric panel-small">
            <span className="metric-label">In progress</span>
            <strong><AnimatedNumber value={loading ? 0 : stats.inProgress} /></strong>
            <div className="mini-ring ring-amber" />
          </div>

          <div className="metric panel-small">
            <span className="metric-label">Closed</span>
            <strong><AnimatedNumber value={loading ? 0 : stats.closed} /></strong>
            <div className="mini-ring ring-green" />
          </div>
        </div>
      </section>

      <section className="feature-section">
        <div className="section-head center">
          <p className="eyebrow alt">Built for support teams</p>
          <h2>Built around the way support teams actually work.</h2>
        </div>

        <div className="feature-grid">
          {features.map(({ title, description, icon: Icon, accent }, index) => (
            <motion.article
              key={title}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="feature-card"
            >
              <div className={`feature-icon ${accent}`}>
                <Icon size={18} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>

              <div className="mini-visual mini-visual--blue">
                <span className="mini-line" />
                <span className="mini-line short" />
                <span className="mini-line tiny" />
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="showcase-section" id="product-showcase">
        <div className="section-head narrow">
          <p className="eyebrow alt">Product showcase</p>
          <h2>A workspace that keeps everything moving.</h2>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="dashboard-preview"
        >
          <aside className="preview-sidebar">
            <div className="brand-lockup">
              <div className="logo-mark">TQ</div>
              <span>TIQO</span>
            </div>
            <nav>
              <span className="sidebar-item active">Overview</span>
              <span className="sidebar-item">Tickets</span>
              <span className="sidebar-item">Customers</span>
            </nav>
          </aside>

          <div className="preview-main">
            <header className="preview-header">
              <div className="search-pill">
                <Search size={14} />
                <span>Search tickets...</span>
              </div>
              <div className="header-badges">
                <span className="tiny-badge">Live</span>
                <span className="tiny-avatar">SP</span>
              </div>
            </header>

            <div className="preview-metrics">
              <div className="mini-stat">
                <span>Total</span>
                <strong>{stats.total || 0}</strong>
              </div>
              <div className="mini-stat">
                <span>Open</span>
                <strong>{stats.open || 0}</strong>
              </div>
              <div className="mini-stat">
                <span>In Progress</span>
                <strong>{stats.inProgress || 0}</strong>
              </div>
            </div>

            <div className="preview-list">
              <div className="list-row active-row">
                <span className="row-id">TKT-001</span>
                <span>Payment not working</span>
                <span className="row-status blue">Open</span>
              </div>
              <div className="list-row">
                <span className="row-id">TKT-015</span>
                <span>Refund request</span>
                <span className="row-status amber">In Progress</span>
              </div>
              <div className="list-row">
                <span className="row-id">TKT-026</span>
                <span>Login issue</span>
                <span className="row-status green">Resolved</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="steps-section" id="how-it-works">
        <div className="section-head narrow">
          <p className="eyebrow alt">How it works</p>
          <h2>From request to resolution.</h2>
        </div>

        <div className="steps-grid">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="step-card"
            >
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.caption}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="resolution-section">
        <div className="resolution-visual">
          <div className="resolution-card">
            <div className="ticket-topline">
              <span className="ticket-id">TKT-1042</span>
              <span className="status-pill border-[#4F7D61]/25 bg-[#4F7D61]/10 text-[#4F7D61]">Resolved</span>
            </div>
            <h3>Unable to access account</h3>
            <div className="meta-grid meta-grid--compact">
              <div>
                <span>Customer</span>
                <strong>Rina Patel</strong>
              </div>
              <div>
                <span>Priority</span>
                <strong>High</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>Resolved</strong>
              </div>
              <div>
                <span>Created</span>
                <strong>Today</strong>
              </div>
            </div>
          </div>

          <div className="resolution-track">
            <span>Open</span>
            <ChevronRight size={14} />
            <span>Assigned</span>
            <ChevronRight size={14} />
            <span>In Progress</span>
            <ChevronRight size={14} />
            <span>Resolved</span>
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5 }}
            className="resolved-check"
          >
            <CheckCircle2 size={22} />
          </motion.div>

          <div className="resolution-copy">
            <p className="eyebrow alt">Better support starts with visibility</p>
            <h2>Issue resolved.</h2>
            <p>Clear progress. Better support.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-panel">
          <div>
            <p className="eyebrow alt">Ready for a clearer workflow?</p>
            <h2>Ready to bring clarity to your support workflow?</h2>
            <p>Create, track, and resolve tickets from one simple workspace.</p>
          </div>

          <div className="cta-actions">
            <Link to="/dashboard" className="primary-button">
              Open TIQO <ArrowRight size={16} />
            </Link>
            <a href="https://github.com" className="secondary-button">
              View GitHub
            </a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <div className="logo-mark">TQ</div>
          <div>
            <span>TIQO</span>
            <small>Support that moves with your team.</small>
          </div>
        </div>

        <div className="footer-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/dashboard">Tickets</Link>
          <Link to="/tickets/new">New Ticket</Link>
          <a href="https://github.com">GitHub</a>
        </div>

        <p>Built by Lakshya Purohit · 2026</p>
      </footer>
    </div>
  );
}
