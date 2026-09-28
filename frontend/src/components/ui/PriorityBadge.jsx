import { cn } from '../../lib/cn';

const styles = {
  High: 'border-[#B94A48]/30 bg-[#B94A48]/10 text-[#B94A48] dark:border-[#B94A48]/40 dark:bg-[#B94A48]/20 dark:text-[#ea7d7a]',
  Medium: 'border-[#B4863A]/30 bg-[#B4863A]/10 text-[#B4863A] dark:border-[#B4863A]/40 dark:bg-[#B4863A]/20 dark:text-[#e4be75]',
  Low: 'border-[#66745A]/30 bg-[#66745A]/10 text-[#66745A] dark:border-[#66745A]/40 dark:bg-[#66745A]/20 dark:text-[#9fb091]',
};

export default function PriorityBadge({ priority, className }) {
  if (!priority) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]',
        styles[priority] || styles.Medium,
        className
      )}
    >
      {priority}
    </span>
  );
}
