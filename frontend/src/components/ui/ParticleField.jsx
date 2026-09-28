/**
 * Ambient particle field. Pause for reduced motion and small screens.
 */
import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export default function ParticleField() {
  const canvasRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let particles = [];
    let W = 0;
    let H = 0;
    const count = 36;

    const rand = (min, max) => Math.random() * (max - min) + min;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    const init = () => {
      resize();
      particles = Array.from({ length: count }, () => ({
        x: rand(0, W),
        y: rand(0, H),
        r: rand(0.5, 1.8),
        dx: rand(-0.12, 0.12),
        dy: rand(-0.1, 0.1),
        alpha: rand(0.08, 0.28),
        hue: rand(220, 285),
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 78%, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < -4) p.x = W + 4;
        if (p.x > W + 4) p.x = -4;
        if (p.y < -4) p.y = H + 4;
        if (p.y > H + 4) p.y = -4;
      }
      animId = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener('resize', init);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
    };
  }, [reduced]);

  if (reduced) return null;

  return <canvas ref={canvasRef} id="particle-canvas" aria-hidden="true" />;
}
