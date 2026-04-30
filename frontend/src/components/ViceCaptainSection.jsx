import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, Award, MessageCircle, Eye, Crosshair } from 'lucide-react';

const ViceCaptainSection = ({ vc }) => {
  if (!vc) return null;

  return (
    <section className="relative w-full py-16 md:py-32 overflow-hidden bg-black border-y border-white/5">

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-10 md:gap-20">
          
          {/* Vice-Captain Portrait */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex-shrink-0 group"
          >
            <div className="absolute -inset-4 bg-red-900/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative w-[220px] h-[220px] md:w-[400px] md:h-[400px] rounded-sm overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src={vc.image_url || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=600'} 
                alt={vc.name} 
                className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-6 bottom-6 glass-panel p-5 bg-black/80 border-white/10">
                <div className="flex items-center gap-2 mb-1 text-primary">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Vice Captain</span>
                </div>
                <h3 className="text-3xl font-black text-white glow-text-primary tracking-tighter uppercase italic">{vc.name}</h3>
              </div>
            </div>
          </motion.div>

          {/* Vice-Captain Stats */}
          <div className="flex-1 space-y-6 md:space-y-10 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div>
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-sm bg-white/5 border border-white/10 mb-6">
                <div className="w-2 h-2 bg-red-600 animate-pulse" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Vice Captain</span>
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white leading-none tracking-tighter mb-8 italic uppercase">
                DAITYA LEGION'S <br /><span className="text-primary not-italic tracking-[0.2em] font-black">VICE CAPTAIN</span>
              </h2>
              <p className="text-gray-600 text-xs md:text-lg text-center lg:text-left font-medium max-w-xl leading-relaxed">
                The backbone of Daitya Legion's batting order. Ashraya leads from the front with calm authority —
                a consistent performer who raises his game when the team needs it most.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[
                { label: "Matches", val: vc.matches || 0, icon: Shield },
                { label: "High Score", val: vc.batting?.high_score || 0, icon: Zap },
                { label: "Catches", val: vc.catches || 0, icon: Target },
                { label: "Batting Avg", val: vc.batting?.average || 0, icon: Award },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col border-l border-white/5 pl-5 hover:border-primary transition-colors">
                  <div className="flex items-center gap-2 text-gray-700 mb-1">
                    <stat.icon className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">{stat.label}</span>
                  </div>
                  <span className="text-2xl font-black text-white tracking-tighter italic glow-text-primary uppercase">{stat.val}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ViceCaptainSection;
