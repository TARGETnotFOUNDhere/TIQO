import AnimatedNumber from './AnimatedNumber';

export default function SupportPulse({ total = 0, open = 0, inProgress = 0, closed = 0 }) {
  const safeTotal = Math.max(total, 1);
  const openPct = (open / safeTotal) * 100;
  const progressPct = (inProgress / safeTotal) * 100;
  const closedPct = (closed / safeTotal) * 100;

  return (
    <div className="relative mx-auto grid h-[280px] w-[280px] place-items-center sm:h-[320px] sm:w-[320px]">
      <div className="pulse-ring absolute inset-6 rounded-full border border-teal-700/15" />
      <div className="pulse-ring absolute inset-0 rounded-full border border-orange-700/10" style={{ animationDelay: '1.4s' }} />
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle cx="80" cy="80" r="58" fill="none" stroke="currentColor" className="text-white/8 light:text-slate-200" strokeWidth="10" />
        <circle
          cx="80"
          cy="80"
          r="58"
          fill="none"
          stroke="#245C68"
          strokeWidth="10"
          strokeDasharray={`${openPct * 3.64} 364`}
          strokeLinecap="round"
        />
        <circle
          cx="80"
          cy="80"
          r="58"
          fill="none"
          stroke="#B4863A"
          strokeWidth="10"
          strokeDasharray={`${progressPct * 3.64} 364`}
          strokeDashoffset={-(openPct * 3.64)}
          strokeLinecap="round"
        />
        <circle
          cx="80"
          cy="80"
          r="58"
          fill="none"
          stroke="#4F7D61"
          strokeWidth="10"
          strokeDasharray={`${closedPct * 3.64} 364`}
          strokeDashoffset={-((openPct + progressPct) * 3.64)}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="section-label mb-1">Live queue</div>
          <div className="font-display text-4xl font-semibold tracking-tight text-white light:text-slate-900">
            <AnimatedNumber value={total} />
          </div>
          <div className="mt-1 text-xs text-slate-400 light:text-slate-500">Tickets</div>
        </div>
      </div>
    </div>
  );
}
