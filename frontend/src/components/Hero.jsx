import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Shield, ChevronDown, Activity, Eye, Crosshair } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative w-full min-h-[95vh] flex flex-col items-center justify-center pt-24 pb-32 overflow-hidden bg-[#050505]">
      {/* Gritty Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/15 rounded-full blur-[100px]" style={{ transform: 'translateZ(0)' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-red-900/8 rounded-full blur-[100px]" style={{ transform: 'translateZ(0)' }}></div>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 text-center relative z-10 w-full">
        <motion.div 
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="relative inline-block">
             {/* Bat-Signal Glow */}
            <div className="absolute inset-0 bg-red-600/30 blur-[80px] rounded-full scale-150" style={{ transform: 'translateZ(0)' }}></div>
            <motion.img 
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 10 }}
              src="/logo.png" 
              alt="Daitya Legion Cricket Club" 
              className="w-40 md:w-80 relative z-10 hover:scale-105 transition-transform duration-700 cursor-crosshair drop-shadow-[0_0_50px_rgba(239,35,60,0.8)]"
              onError={(e) => { e.target.src = 'https://cricheroes.com/assets/images/team-placeholder.png'; }}
            />
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.3, duration: 0.8 }}
        >
           <h1 className="text-5xl sm:text-7xl md:text-[14rem] font-black leading-none tracking-tighter mb-6 italic text-white flex flex-col group w-full">
             <span className="glow-text-primary group-hover:tracking-[0.1em] transition-all duration-1000">DAITYA</span>
             <span className="text-primary not-italic tracking-[0.2em] sm:tracking-[0.25em] -mt-2 sm:-mt-6 md:-mt-14 drop-shadow-[0_0_30px_rgba(239,35,60,0.4)]">LEGION</span>
           </h1>
           <div className="flex items-center justify-center gap-4 mb-12">
              <div className="h-px w-12 bg-primary/40"></div>
              <p className="text-gray-400 font-black uppercase tracking-[0.4em] md:tracking-[0.8em] text-[10px] md:text-sm">
                DAITYA LEGION // CRICKET CLUB
              </p>
              <div className="h-px w-12 bg-primary/40"></div>
           </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto"
        >
          <div className="flex flex-wrap justify-center gap-4 w-full">
             <a
               href="https://wa.me/918755903705?text=Hello%20Captain%2C%20I%20want%20to%20book%20a%20paid%20match%20with%20Daitya%20Legion."
               target="_blank"
               rel="noopener noreferrer"
               className="btn-premium px-8 sm:px-12 py-5 sm:py-6 group relative overflow-hidden flex-1 min-w-[150px] sm:min-w-[200px] flex items-center justify-center"
             >
               <span className="relative z-10 text-[11px]">Book Match (Paid)</span>
               <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
             </a>
             <a
               href="https://wa.me/918755903705?text=Hello%20Captain%2C%20I%20want%20to%20book%20a%20friendly%20match%20with%20Daitya%20Legion."
               target="_blank"
               rel="noopener noreferrer"
               className="px-8 sm:px-12 py-5 sm:py-6 rounded-sm bg-white/5 border border-white/10 hover:border-primary/50 transition-all text-white font-black uppercase text-[11px] tracking-[0.3em] flex-1 min-w-[150px] sm:min-w-[200px] flex items-center justify-center group"
             >
               Book Friendly Match
             </a>
          </div>
          <p className="text-gray-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] italic mt-4 text-center max-w-lg">
            "You either die a hero or live long enough to see yourself become the villain"
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-32 max-w-5xl mx-auto border-t border-white/5 pt-16">
           {[
             { label: "Batting", val: "LETHAL", icon: Zap, color: "text-primary" },
             { label: "Bowling", val: "PRECISE", icon: Target, color: "text-red-700" },
             { label: "Fielding", val: "SHARP", icon: Eye, color: "text-gray-500" },
           ].map((item, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ delay: 0.8 + (i * 0.1) }}
               className="flex flex-col items-center group cursor-pointer"
             >
                <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mb-4 group-hover:border-primary/40 transition-all">
                  <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-125 transition-transform`} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700 mb-2 group-hover:text-primary transition-colors">{item.label}</span>
                <span className="text-2xl font-black text-white italic tracking-tighter">{item.val}</span>
             </motion.div>
           ))}
        </div>
      </div>

      <motion.div 
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-800"
      >
        <ChevronDown className="w-10 h-10" />
      </motion.div>
    </section>
  );
};

export default Hero;
