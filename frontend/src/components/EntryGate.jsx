import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Target, Activity } from 'lucide-react';
import TeamLogo from '../assets/Daitya_Legion_LOGO.png';
import GokuuVideo from '../assets/Gokuu.mp4';

const EntryGate = ({ onEnter }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Systems...');
  const [showButton, setShowButton] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const handleEnterClick = () => {
    setIsFlashing(true);
    setTimeout(() => {
      onEnter();
    }, 400); // Wait for flash before unmounting
  };

  useEffect(() => {
    const statuses = [
      'Synchronizing Neural Link...',
      'Bypassing Security Protocols...',
      'Mapping Tactical Grid...',
      'Legion Status: ONLINE',
      'Ready for Decryption.'
    ];

    let currentStatus = 0;
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowButton(true);
          return 100;
        }
        
        // Update status text periodically
        if (prev > (currentStatus + 1) * 20 && currentStatus < statuses.length - 1) {
          currentStatus++;
          setStatusText(statuses[currentStatus]);
        }
        
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center overflow-hidden selection:bg-primary selection:text-white">
      {/* Background Video Ambience */}
      <video
        src={GokuuVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>

      {/* Flash Effect */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-white z-[2000] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-48 h-48 md:w-64 md:h-64 mb-12 relative group">
          <motion.div
            animate={{ 
              boxShadow: ["0 0 20px rgba(136,8,8,0.2)", "0 0 60px rgba(136,8,8,0.5)", "0 0 20px rgba(136,8,8,0.2)"] 
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-primary/5 border border-primary/20"
          ></motion.div>
          <img src={TeamLogo} alt="Daitya Legion" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(136,8,8,0.6)]" />
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-4 glow-text-primary">
            DAITYA <span className="text-primary not-italic tracking-[0.2em] ml-2">LEGION</span>
          </h1>
          <div className="flex items-center justify-center gap-4 text-gray-500 uppercase tracking-[0.5em] text-[8px] font-black">
            <Activity className="w-3 h-3 text-primary animate-pulse" />
            Neural Combat Unit // Operational Interface
          </div>
        </div>

        <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mb-4 relative">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-primary"
            style={{ width: `${loadingProgress}%` }}
          ></motion.div>
        </div>
        
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 mb-12 h-4">
          {statusText}
        </p>

        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flex flex-col items-center gap-4"
            >
              {/* Hint text above button */}
              <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-gray-500 animate-pulse">
                ⚡ System Ready — Awaiting Command ⚡
              </p>

              {/* Main CTA Button */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleEnterClick}
                className="relative group px-14 py-5 bg-primary/10 border-2 border-primary text-white font-black uppercase tracking-[0.35em] text-sm transition-all duration-300 shadow-[0_0_40px_rgba(136,8,8,0.3)] hover:shadow-[0_0_80px_rgba(136,8,8,0.6)] hover:bg-primary overflow-hidden"
                style={{ clipPath: 'polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)' }}
              >
                {/* Animated shimmer sweep */}
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                {/* Pulse ring */}
                <motion.span
                  className="absolute inset-0 border-2 border-primary/40"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ clipPath: 'polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)' }}
                />

                <span className="relative z-10 flex items-center gap-3">
                  <span>Tap to Enter</span>
                  <span className="text-primary group-hover:text-white transition-colors font-black">DAITYA LEGION</span>
                  <svg className="w-4 h-4 text-primary group-hover:text-white transition-colors group-hover:translate-x-1 duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </motion.button>

              {/* Sub-hint below button */}
              <p className="text-[8px] uppercase tracking-[0.4em] text-gray-600 font-semibold">
                Click to unlock the tactical interface
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Decorative Corners */}
      <div className="absolute top-10 left-10 w-20 h-20 border-l-2 border-t-2 border-primary/20 opacity-50"></div>
      <div className="absolute top-10 right-10 w-20 h-20 border-r-2 border-t-2 border-primary/20 opacity-50"></div>
      <div className="absolute bottom-10 left-10 w-20 h-20 border-l-2 border-b-2 border-primary/20 opacity-50"></div>
      <div className="absolute bottom-10 right-10 w-20 h-20 border-r-2 border-b-2 border-primary/20 opacity-50"></div>
    </div>
  );
};

export default EntryGate;
