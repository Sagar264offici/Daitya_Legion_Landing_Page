import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';

// ── Tiny blood splatter on click ─────────────────────────────────────────────
const Splatter = ({ x, y, id, onDone }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 1, 0], scale: [0.3, 1.2, 1.8] }}
    transition={{ duration: 0.45, ease: 'easeOut' }}
    onAnimationComplete={() => onDone(id)}
    className="fixed pointer-events-none z-[10000]"
    style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
  >
    <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
      <path d="M50 50C40 30 20 40 10 50C0 60 20 80 40 90C60 100 80 80 90 60C100 40 80 20 50 50Z"
        fill="#880808" fillOpacity="0.75" />
    </svg>
  </motion.div>
);

const BatarangEffect = ({ children }) => {
  const cursorRef = useRef(null);
  const [splatters, setSplatters] = useState([]);

  useEffect(() => {
    let rafId;

    const onMove = (e) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate(${e.clientX - 22}px, ${e.clientY - 22}px)`;
        }
      });
    };

    const onClick = (e) => {
      const id = Date.now();
      setSplatters(prev => {
        const next = [...prev, { id, x: e.clientX, y: e.clientY }];
        return next.length > 4 ? next.slice(-4) : next;
      });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const removeSplatter = (id) => setSplatters(p => p.filter(s => s.id !== id));

  return (
    <div className="relative min-h-screen">
      {children}

      {/* ── Custom circular cursor ── */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-[10001] pointer-events-none select-none"
        style={{ willChange: 'transform' }}
      >
        {/* Outer ring */}
        <div className="w-11 h-11 rounded-full border-2 border-primary flex items-center justify-center relative"
          style={{ boxShadow: '0 0 14px rgba(239,35,60,0.6), inset 0 0 8px rgba(239,35,60,0.1)' }}>
          {/* Inner dot */}
          <div className="absolute w-1.5 h-1.5 rounded-full bg-primary"
            style={{ boxShadow: '0 0 6px rgba(239,35,60,0.9)' }} />
          {/* "DO" text */}
          <span
            className="text-[7px] font-black text-primary uppercase tracking-[0.15em] leading-none select-none"
            style={{ marginTop: '1px', letterSpacing: '0.12em' }}
          >
            DO
          </span>
        </div>
      </div>

      {/* ── Blood splatters on click ── */}
      <AnimatePresence>
        {splatters.map(s => (
          <Splatter key={s.id} id={s.id} x={s.x} y={s.y} onDone={removeSplatter} />
        ))}
      </AnimatePresence>

      {/* ── Dev signature ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2 }}
        className="fixed bottom-6 right-6 z-[9999] group"
      >
        <a
          href="https://www.instagram.com/astronomy_with_sagar/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-black/80 backdrop-blur-md border border-white/15 pr-5 pl-2 py-2 rounded-full hover:border-primary/60 hover:bg-primary/8 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-primary/30 border-2 border-primary/50 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.4em]">Developer</span>
            <span className="text-[11px] font-black text-white uppercase italic tracking-wide group-hover:text-primary transition-colors">Sagar Pathak</span>
          </div>
        </a>
      </motion.div>
    </div>
  );
};

export default BatarangEffect;
