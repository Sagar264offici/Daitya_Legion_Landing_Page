import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const BatarangEffect = ({ children }) => {
  return (
    <div className="relative min-h-screen">
      {children}

      {/* ── Dev signature ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2 }}
        className="fixed bottom-6 right-6 z-[9999] group"
      >
        <a
          href="https://www.instagram.com/multiverse.sagar/"
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
