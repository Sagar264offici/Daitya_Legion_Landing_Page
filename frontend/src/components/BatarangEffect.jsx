import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';

const BloodSplatter = ({ x, y, id, onComplete }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 1, 0.8, 0], scale: [0.5, 1.2, 1.5, 1.8] }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    onAnimationComplete={() => onComplete(id)}
    className="fixed pointer-events-none z-[10000]"
    style={{ left: x || 0, top: y || 0, transform: 'translate(-50%, -50%)' }}
  >
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
      <path d="M50 50C40 30 20 40 10 50C0 60 20 80 40 90C60 100 80 80 90 60C100 40 80 20 50 50Z" fill="#880808" fillOpacity="0.7" />
      <circle cx="30" cy="30" r="5" fill="#880808" fillOpacity="0.5" />
      <circle cx="70" cy="40" r="3" fill="#880808" fillOpacity="0.5" />
      <circle cx="50" cy="80" r="4" fill="#880808" fillOpacity="0.5" />
    </svg>
  </motion.div>
);

// Generate a grid of starting positions that cover the entire viewport
const generateFloaters = (count = 12) => {
  const floaters = [];
  for (let i = 0; i < count; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const baseX = (col / 3) * 90 + 5;
    const baseY = (row / 3) * 90 + 5;
    floaters.push({
      id: i,
      x: baseX + (Math.random() - 0.5) * 20,
      y: baseY + (Math.random() - 0.5) * 20,
      dx: (Math.random() - 0.5) * 30,
      dy: (Math.random() - 0.5) * 30,
      duration: 15 + Math.random() * 25,
      delay: i * 0.5,
      scale: 0.6 + Math.random() * 0.8,
      clockwise: Math.random() > 0.5,
      opacity: 0.15 + Math.random() * 0.2,
    });
  }
  return floaters;
};

const BatarangEffect = ({ children }) => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [splatters, setSplatters] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [floaters] = useState(() => generateFloaters(12));

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleMouseMove = (e) => {
      if (!isMobile) {
        // Throttling mouse move updates to save CPU
        requestAnimationFrame(() => {
           setMousePos({ x: e.clientX, y: e.clientY });
        });
      }
    };

    const handleClick = (e) => {
      const id = Date.now();
      setSplatters(prev => {
        // Cap splatters at 3 to prevent memory growth
        const next = [...prev, { id, x: e.clientX, y: e.clientY }];
        if (next.length > 3) return next.slice(-3);
        return next;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [isMobile]);

  const removeSplatter = (id) => setSplatters(prev => prev.filter(s => s.id !== id));

  const safeVal = (v) => (isNaN(v) || v == null ? 0 : v);

  return (
    <div className="relative min-h-screen">

      {/* ── MOBILE: 25 batarangs floating across the FULL viewport ── */}
      {isMobile && floaters.map(f => (
        <motion.div
          key={f.id}
          className="fixed pointer-events-none z-[2]"
          style={{
            width: Math.round(32 * safeVal(f.scale)),
            height: Math.round(32 * safeVal(f.scale)),
            filter: `drop-shadow(0 0 8px rgba(239,35,60,${safeVal(f.opacity)}))`,
            // initial position
            left: 0,
            top: 0,
          }}
          initial={{
            x: `${safeVal(f.x)}vw`,
            y: `${safeVal(f.y)}vh`,
            opacity: 0,
            rotate: 0,
          }}
          animate={{
            x: [
              `${safeVal(f.x)}vw`,
              `${((safeVal(f.x) + safeVal(f.dx)) % 100 + 100) % 100}vw`,
              `${safeVal(f.x)}vw`,
            ],
            y: [
              `${safeVal(f.y)}vh`,
              `${((safeVal(f.y) + safeVal(f.dy)) % 100 + 100) % 100}vh`,
              `${safeVal(f.y)}vh`,
            ],
            opacity: [0, safeVal(f.opacity), safeVal(f.opacity) * 0.7, safeVal(f.opacity), 0],
            rotate: f.clockwise ? [0, 360, 720] : [0, -360, -720],
          }}
          transition={{
            duration: safeVal(f.duration),
            repeat: Infinity,
            ease: 'linear',
            delay: safeVal(f.delay),
          }}
        >
          <img
            src="/batarang.png"
            alt="batarang"
            className="w-full h-full object-contain"
          />
        </motion.div>
      ))}

      {children}

      {/* ── CLICK: Blood Splatter ── */}
      <AnimatePresence>
        {splatters.map(s => (
          <BloodSplatter key={s.id} id={s.id} x={s.x} y={s.y} onComplete={removeSplatter} />
        ))}
      </AnimatePresence>

      {/* ── DESKTOP: Spinning Batarang cursor ── */}
      {!isMobile && !isNaN(mousePos.x) && !isNaN(mousePos.y) && (
        <motion.div
          className="fixed pointer-events-none z-[10000] w-14 h-14"
          animate={{
            x: mousePos.x,
            y: mousePos.y,
            rotate: 360,
          }}
          transition={{
            x: { type: "spring", stiffness: 600, damping: 30, mass: 0.2 },
            y: { type: "spring", stiffness: 600, damping: 30, mass: 0.2 },
            rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
          }}
          style={{ left: -28, top: -28 }}
        >
          <img
            src="/batarang.png"
            alt="batarang cursor"
            className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] brightness-[1.2]"
          />
        </motion.div>
      )}

      {/* ── Architect Signature (bottom right) ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end group"
      >
        <a 
          href="https://www.instagram.com/astronomy_with_sagar/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-black/80 backdrop-blur-md border border-white/20 pr-5 pl-2 py-2 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:border-primary/80 group-hover:bg-primary/10 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-primary/40 border-2 border-primary/60 flex items-center justify-center p-2 relative overflow-hidden shadow-[0_0_15px_rgba(255,0,0,0.5)]">
            <div className="absolute inset-0 bg-primary/30 animate-pulse" />
            <Shield className="w-full h-full text-white drop-shadow-md relative z-10" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] leading-none mb-0.5">Developer</span>
            <span className="text-[12px] font-black text-white uppercase tracking-[0.2em] leading-none italic group-hover:text-primary transition-colors drop-shadow-md">Sagar Pathak</span>
          </div>
        </a>
        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[6px] font-bold text-primary uppercase tracking-[0.4em]">Daitya Legion</span>
        </div>
      </motion.div>
    </div>
  );
};

export default BatarangEffect;
