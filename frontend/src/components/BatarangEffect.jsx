import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const BloodSplatter = ({ x, y, id, onComplete }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 1.8] }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    onAnimationComplete={() => onComplete(id)}
    className="fixed pointer-events-none z-[10000]"
    style={{ left: x || 0, top: y || 0, transform: 'translate(-50%, -50%)' }}
  >
    <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
      <path d="M50 50C40 30 20 40 10 50C0 60 20 80 40 90C60 100 80 80 90 60C100 40 80 20 50 50Z" fill="#880808" fillOpacity="0.7" />
    </svg>
  </motion.div>
);

const BatarangEffect = ({ children }) => {
  const [splatters, setSplatters] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  // Use a ref for cursor position to avoid React re-renders on every mousemove
  const cursorRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });

    // CSS-based cursor tracking — no framer-motion spring, no re-renders
    let rafId;
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (cursorRef.current) {
            cursorRef.current.style.transform = `translate(${e.clientX - 28}px, ${e.clientY - 28}px)`;
          }
        });
      }
    };

    const handleClick = (e) => {
      const id = Date.now();
      setSplatters(prev => {
        const next = [...prev, { id, x: e.clientX, y: e.clientY }];
        return next.length > 3 ? next.slice(-3) : next;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const removeSplatter = (id) => setSplatters(prev => prev.filter(s => s.id !== id));

  return (
    <div className="relative min-h-screen">
      {children}

      {/* Click: Blood Splatter */}
      <AnimatePresence>
        {splatters.map(s => (
          <BloodSplatter key={s.id} id={s.id} x={s.x} y={s.y} onComplete={removeSplatter} />
        ))}
      </AnimatePresence>

      {/* Desktop: CSS-transformed batarang cursor (no spring, no re-renders) */}
      {!isMobile && (
        <div
          ref={cursorRef}
          className="fixed pointer-events-none z-[10000] w-10 h-10"
          style={{
            top: 0,
            left: 0,
            willChange: 'transform',
            animation: 'spin 1.5s linear infinite',
          }}
        >
          <img
            src="/batarang.png"
            alt=""
            className="w-full h-full object-contain"
            style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.7))' }}
          />
        </div>
      )}

      {/* Mobile: 6 slow batarangs with CSS animations (NOT framer-motion) */}
      {isMobile && (
        <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-8 h-8 opacity-20"
              style={{
                left: `${10 + i * 15}%`,
                top: `${10 + (i % 3) * 30}%`,
                animation: `floatBat ${18 + i * 4}s linear ${i * 2}s infinite`,
                willChange: 'transform',
              }}
            >
              <img src="/batarang.png" alt="" className="w-full h-full object-contain" />
            </div>
          ))}
        </div>
      )}

      {/* Architect Signature */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end group"
      >
        <a
          href="https://www.instagram.com/astronomy_with_sagar/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-black/80 backdrop-blur-md border border-white/20 pr-5 pl-2 py-2 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:border-primary/80 group-hover:bg-primary/10 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-primary/40 border-2 border-primary/60 flex items-center justify-center p-2 relative overflow-hidden">
            <Shield className="w-full h-full text-white relative z-10" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] leading-none mb-0.5">Developer</span>
            <span className="text-[12px] font-black text-white uppercase tracking-[0.2em] leading-none italic group-hover:text-primary transition-colors">Sagar Pathak</span>
          </div>
        </a>
      </motion.div>
    </div>
  );
};

export default BatarangEffect;
