import { cn } from '../../lib/cn';

const styles = {
  Open: 'border-[#245C68]/25 bg-[#245C68]/10 text-[#245C68] dark:border-[#245C68]/40 dark:bg-[#245C68]/20 dark:text-[#91b1b3]',
  'In Progress': 'border-[#B4863A]/25 bg-[#B4863A]/10 text-[#B4863A] dark:border-[#B4863A]/40 dark:bg-[#B4863A]/20 dark:text-[#f3cc7a]',
  Closed: 'border-[#4F7D61]/25 bg-[#4F7D61]/10 text-[#4F7D61] dark:border-[#4F7D61]/40 dark:bg-[#4F7D61]/20 dark:text-[#8fc4a2]',
  Resolved: 'border-[#4F7D61]/25 bg-[#4F7D61]/10 text-[#4F7D61] dark:border-[#4F7D61]/40 dark:bg-[#4F7D61]/20 dark:text-[#8fc4a2]',
};

const dots = {
  Open: 'bg-[#245C68] dark:bg-[#91b1b3]',
  'In Progress': 'bg-[#B4863A] status-pulse-amber',
  Closed: 'bg-[#4F7D61] dark:bg-[#8fc4a2]',
  Resolved: 'bg-[#4F7D61] dark:bg-[#8fc4a2]',
};

export default function StatusBadge({ status, className }) {
  const value = status || 'Open';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        styles[value] || styles.Open,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dots[value] || dots.Open)} />
      {value}
    </span>
  );
}
