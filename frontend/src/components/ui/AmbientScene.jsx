import { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ParticleField from './ParticleField';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export default function AmbientScene() {
  const { isDarkMode } = useTheme();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    const onMove = (event) => {
      if (reduced) return;
      const x = (event.clientX / window.innerWidth - 0.5) * 24;
      const y = (event.clientY / window.innerHeight - 0.5) * 24;
      root.style.setProperty('--pointer-x', `${x}px`);
      root.style.setProperty('--pointer-y', `${y}px`);
      root.style.setProperty('--pointer-px', `${event.clientX}px`);
      root.style.setProperty('--pointer-py', `${event.clientY}px`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {isDarkMode && <ParticleField />}
      <div className="hero-grid opacity-20 dark:opacity-30" />
      <div className="orb orb-a bg-[#245C68]/10 dark:bg-[#245C68]/15" />
      <div className="orb orb-b bg-[#C86B4A]/8 dark:bg-[#C86B4A]/12" />
      <div className="orb orb-c bg-[#66745A]/8 dark:bg-[#66745A]/10" />
    </div>
  );
}
