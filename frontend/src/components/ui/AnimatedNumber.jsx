import { useEffect, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export default function AnimatedNumber({ value = 0 }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const spring = useSpring(0, { mass: 0.8, stiffness: 70, damping: 18 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    if (reduced) return;
    if (isInView) spring.set(Number(value) || 0);
  }, [isInView, spring, value, reduced]);

  if (reduced) {
    return <span ref={ref}>{(Number(value) || 0).toLocaleString()}</span>;
  }

  return <motion.span ref={ref}>{display}</motion.span>;
}
