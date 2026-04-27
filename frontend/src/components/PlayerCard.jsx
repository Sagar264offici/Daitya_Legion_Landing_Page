import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Shield, Crosshair, Activity, Star, Zap, BarChart2, Wind } from 'lucide-react';
import PlayerDetailsModal from './PlayerDetailsModal.jsx';

const StatBox = ({ label, value, sub, accent }) => (
  <div className={`flex flex-col p-3 rounded-sm border transition-colors ${accent ? 'bg-primary/8 border-primary/20 hover:border-primary/40' : 'bg-white/4 border-white/5 hover:border-white/15'}`}>
    <span className="text-[7px] font-black uppercase tracking-widest text-gray-600 mb-1">{label}</span>
    <span className={`text-lg font-black italic tracking-tighter leading-none ${accent ? 'text-primary' : 'text-white'}`}>{value ?? '—'}</span>
    {sub && <span className="text-[7px] text-gray-700 mt-0.5 font-bold">{sub}</span>}
  </div>
);

const PlayerCard = ({ player }) => {
  const [showModal, setShowModal] = useState(false);

  const hs = player.batting?.high_score ?? player.runs ?? 0;
  const avg = player.batting?.average ? Number(player.batting.average).toFixed(1) : '0.0';
  const sr  = player.batting?.strike_rate ? Number(player.batting.strike_rate).toFixed(1) : '0.0';
  const econ = player.bowling?.economy ? Number(player.bowling.economy).toFixed(2) : '0.00';
  const bb   = player.bowling?.best_bowling || '—';
  const wkts = player.bowling?.wickets ?? player.wickets ?? 0;
  const runs = player.batting?.total_runs ?? player.runs ?? 0;
  const mtch = player.matches ?? 0;
  const motm = player.man_of_the_match ?? 0;
  const fours = player.batting?.fours ?? 0;
  const sixes = player.batting?.sixes ?? 0;
  const catches = player.catches ?? 0;
  const runOuts = player.run_outs ?? 0;
  const fifties = player.batting?.fifties ?? 0;
  const hundreds = player.batting?.hundreds ?? 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        className="relative w-full max-w-[320px] flex flex-col bg-[#0a0b10] border border-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.7)] overflow-hidden group hover:border-primary/30 transition-all duration-500"
      >
        {/* ── Top bar ── */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-4 pt-3 pointer-events-none">
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase text-primary tracking-[0.3em] leading-none">Daitya</span>
            <span className="text-[7px] font-black uppercase text-gray-600 tracking-widest">Legion</span>
          </div>
          <div className="flex items-center gap-1.5">
            {motm > 0 && (
              <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded-sm">
                <Star className="w-2.5 h-2.5 text-yellow-400" />
                <span className="text-[7px] font-black text-yellow-400">{motm} MOM</span>
              </div>
            )}
            <Shield className="w-3.5 h-3.5 text-white/20" />
          </div>
        </div>

        {/* ── Photo ── */}
        <div className="relative w-full h-60 overflow-hidden bg-black/60 flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-[#0a0b10]/30 to-transparent z-10" />
          <img
            src={player.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=880808&color=fff&size=300`}
            alt={player.name}
            className="w-full h-full object-cover object-top grayscale contrast-110 brightness-80 group-hover:grayscale-0 group-hover:brightness-95 transition-all duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          {/* Title badges */}
          {player.titles?.length > 0 && (
            <div className="absolute top-10 right-3 z-20 flex flex-col gap-1.5 items-end">
              {player.titles.slice(0, 2).map((t, i) => (
                <div key={i} className="px-2 py-1 rounded-sm bg-[#1a1500] border border-yellow-600/30 shadow-[0_0_12px_rgba(201,153,31,0.3)]">
                  <span className="text-[9px] font-black uppercase tracking-wider text-yellow-500 flex items-center gap-1">
                    <Trophy className="w-2.5 h-2.5" />{t}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Identity ── */}
        <div className="px-4 pt-1 pb-3 -mt-8 relative z-10">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none truncate drop-shadow-lg">
            {player.name}
          </h2>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/15 border border-primary/25 rounded-sm text-[9px] font-black text-primary uppercase tracking-widest">
              <Crosshair className="w-2.5 h-2.5" />{player.role || 'Player'}
            </span>
            <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{mtch} Matches</span>
          </div>
        </div>

        {/* ── Primary stats grid ── */}
        <div className="px-4 pb-3 grid grid-cols-3 gap-2">
          <StatBox label="Runs" value={runs} />
          <StatBox label="High Score" value={hs} accent />
          <StatBox label="Wickets" value={wkts} />
          <StatBox label="Average" value={avg} sub="bat avg" />
          <StatBox label="Strike Rate" value={sr} />
          <StatBox label="Economy" value={econ} />
        </div>

        {/* ── Secondary stats row ── */}
        <div className="px-4 pb-3 grid grid-cols-4 gap-1.5">
          <div className="flex flex-col items-center bg-white/3 border border-white/5 p-2 rounded-sm">
            <span className="text-[6px] font-black text-gray-700 uppercase tracking-widest">4s</span>
            <span className="text-sm font-black text-white italic">{fours}</span>
          </div>
          <div className="flex flex-col items-center bg-white/3 border border-white/5 p-2 rounded-sm">
            <span className="text-[6px] font-black text-gray-700 uppercase tracking-widest">6s</span>
            <span className="text-sm font-black text-yellow-400 italic">{sixes}</span>
          </div>
          <div className="flex flex-col items-center bg-white/3 border border-white/5 p-2 rounded-sm">
            <span className="text-[6px] font-black text-gray-700 uppercase tracking-widest">50s</span>
            <span className="text-sm font-black text-white italic">{fifties}</span>
          </div>
          <div className="flex flex-col items-center bg-white/3 border border-white/5 p-2 rounded-sm">
            <span className="text-[6px] font-black text-gray-700 uppercase tracking-widest">100s</span>
            <span className="text-sm font-black text-primary italic">{hundreds}</span>
          </div>
        </div>

        {/* ── Best Bowling + Fielding ── */}
        <div className="px-4 pb-3 flex gap-2">
          <div className="flex-1 flex justify-between items-center bg-red-950/20 border border-red-900/20 p-2 rounded-sm">
            <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1">
              <Wind className="w-2.5 h-2.5" />Best Bowl
            </span>
            <span className="text-sm font-black text-red-400 italic">{bb}</span>
          </div>
          <div className="flex-1 flex justify-between items-center bg-white/3 border border-white/5 p-2 rounded-sm">
            <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1">
              <BarChart2 className="w-2.5 h-2.5" />Field
            </span>
            <span className="text-sm font-black text-gray-300 italic">{catches}C / {runOuts}RO</span>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="px-4 pb-4">
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-3 bg-transparent border border-white/10 text-gray-500 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 rounded-sm flex items-center justify-center gap-2"
          >
            <Activity className="w-3 h-3" />
            Full Career Stats
          </button>
        </div>

        {/* Hover accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <PlayerDetailsModal player={player} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default PlayerCard;
