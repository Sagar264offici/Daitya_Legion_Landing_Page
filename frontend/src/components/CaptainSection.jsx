import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, Award, MessageCircle, MoreVertical, Crosshair } from 'lucide-react';

const CaptainSection = ({ captain }) => {
  if (!captain) return null;

  const whatsappUrl = `https://wa.me/919058937803?text=Hi%20Captain%20Bruce!%20Checking%20in%20from%20Daitya%20Legion.`;

  return (
    <section className="relative w-full py-20 md:py-40 overflow-hidden bg-[#0a0b10] border-y border-white/5">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-primary/20 blur-[120px]" style={{ transform: 'translateZ(0)' }}></div>
        <div className="absolute bottom-0 left-0 w-[40%] h-full bg-red-900/10 blur-[120px]" style={{ transform: 'translateZ(0)' }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-20">
          
          {/* Commander Portrait */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex-shrink-0 group"
          >
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="relative w-[240px] h-[240px] md:w-[450px] md:h-[450px] rounded-sm overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(239,35,60,0.2)]">
              <img 
                src={captain.image_url || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800'} 
                alt={captain.name} 
                className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
              
              <div className="absolute bottom-10 left-10 right-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-px bg-primary"></div>
                  <span className="text-[10px] font-black uppercase text-primary tracking-[0.5em]">Captain</span>
                </div>
                <h3 className="text-4xl font-black text-white glow-text-primary tracking-tighter uppercase italic leading-none">{captain.name}</h3>
              </div>
            </div>
          </motion.div>

          {/* Commander Intelligence */}
          <div className="flex-1 space-y-8 md:space-y-12 flex flex-col items-center lg:items-start">
            <div>
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-sm bg-white/5 border border-white/10 mb-8">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">🏏 Team Captain</span>
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-8xl font-black text-white leading-[0.8] tracking-tighter mb-8 italic uppercase">
                DAITYA LEGION'S <br /><span className="text-primary not-italic tracking-[0.1em] font-black">CAPTAIN</span>
              </h2>
              <p className="text-gray-500 text-sm md:text-lg text-center lg:text-left font-medium max-w-2xl leading-relaxed">
                Leading Daitya Legion with passion and precision. Bruce captains the side with tactical clarity — setting the tone with bat and ball, and inspiring the whole team every single match.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 border-t border-white/5 pt-12">
              {[
                { label: "Strike Rate", val: captain.batting?.strike_rate || '---', icon: Zap },
                { label: "Wickets", val: captain.wickets || 0, icon: Target },
                { label: "Batting Avg", val: captain.batting?.average || '---', icon: Shield },
                { label: "Matches", val: captain.matches || 0, icon: Crosshair },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col group">
                  <div className="flex items-center gap-2 text-gray-700 mb-2 group-hover:text-primary transition-colors">
                    <stat.icon className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">{stat.label}</span>
                  </div>
                  <span className="text-3xl font-black text-white tracking-tighter italic glow-text-primary">{stat.val}</span>
                </div>
              ))}
            </div>

            <div className="pt-8">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-premium px-6 py-3 md:px-12 md:py-5 inline-flex items-center gap-4 group"
              >
                <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 -z-10"></div>
                <MessageCircle className="w-5 h-5" />
                <span>Message Captain</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CaptainSection;
