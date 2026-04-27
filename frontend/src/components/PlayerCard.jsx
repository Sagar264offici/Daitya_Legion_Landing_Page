import React, { useState, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Trophy, Target, Shield, Crosshair, Activity, Star, Zap, BarChart2, Wind } from 'lucide-react';
import PlayerDetailsModal from './PlayerDetailsModal.jsx';

// ─── Mobile-only Polaroid Flash ───────────────────────────────────────────────
const PolaroidFlash = ({ player, onDone }) => {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center pointer-events-none md:hidden"
      style={{ animation: 'fadeInOut 0.9s ease forwards' }}>
      <div
        className="bg-white shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col items-center"
        style={{ width: 200, padding: '10px 10px 36px 10px', animation: 'slideUp 0.55s ease 0.2s both' }}
        onAnimationEnd={onDone}
      >
        <div className="w-full overflow-hidden" style={{ height: 180 }}>
          <img
            src={player.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=880808&color=fff&size=200`}
            alt={player.name}
            className="w-full h-full object-cover object-top"
            style={{ filter: 'grayscale(100%) contrast(1.2) brightness(0.85)' }}
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="mt-3 text-black font-black uppercase tracking-widest text-[10px] text-center" style={{ fontFamily: 'monospace' }}>
          {player.name}
        </span>
        <span className="text-gray-500 uppercase tracking-widest text-[7px] mt-0.5" style={{ fontFamily: 'monospace' }}>
          DAITYA LEGION
        </span>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, accent }) => (
  <div className={`flex flex-col p-2.5 border transition-colors ${accent
    ? 'bg-primary/8 border-primary/25 hover:border-primary/45'
    : 'bg-white/4 border-white/6 hover:border-white/16'}`}>
    <span className="text-[7px] font-black uppercase tracking-widest text-gray-600 mb-1 leading-none">{label}</span>
    <span className={`text-base font-black italic tracking-tighter leading-none ${accent ? 'text-primary' : 'text-white'}`}>
      {value ?? '—'}
    </span>
  </div>
);

const PlayerCard = ({ player }) => {
  const [showModal, setShowModal] = useState(false);
  const [showPolaroid, setShowPolaroid] = useState(false);

  const hs    = player.batting?.high_score ?? 0;
  const avg   = player.batting?.average ? Number(player.batting.average).toFixed(1) : '0.0';
  const sr    = player.batting?.strike_rate ? Number(player.batting.strike_rate).toFixed(1) : '0.0';
  const econ  = player.bowling?.economy ? Number(player.bowling.economy).toFixed(1) : '—';
  const bb    = player.bowling?.best_bowling || '—';
  const wkts  = player.bowling?.wickets ?? player.wickets ?? 0;
  const runs  = player.batting?.total_runs ?? player.runs ?? 0;
  const mtch  = player.matches ?? 0;
  const motm  = player.man_of_the_match ?? 0;
  const fours = player.batting?.fours ?? 0;
  const sixes = player.batting?.sixes ?? 0;
  const catches  = player.catches ?? 0;
  const runOuts  = player.run_outs ?? 0;
  const fifties  = player.batting?.fifties ?? 0;
  const hundreds = player.batting?.hundreds ?? 0;

  const handleClick = useCallback(() => {
    if (window.innerWidth < 768) {
      setShowPolaroid(true);
    } else {
      setShowModal(true);
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {showPolaroid && (
          <PolaroidFlash
            player={player}
            onDone={() => { setShowPolaroid(false); setShowModal(true); }}
          />
        )}
      </AnimatePresence>

      {/* Card — pure CSS transitions, no framer-motion on hover/scroll */}
      <div
        className="relative w-full max-w-[320px] flex flex-col bg-[#0a0b10] border border-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.7)] group card-hover"
        style={{ transition: 'border-color 0.3s, transform 0.3s' }}
      >
        {/* Top badge row */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-4 pt-3 pointer-events-none">
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase text-primary tracking-[0.3em] leading-none">Daitya</span>
            <span className="text-[7px] font-black uppercase text-gray-600 tracking-widest">Legion</span>
          </div>
          <div className="flex items-center gap-1.5">
            {motm > 0 && (
              <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5">
                <Star className="w-2.5 h-2.5 text-yellow-400" />
                <span className="text-[7px] font-black text-yellow-400">{motm} MOM</span>
              </div>
            )}
            <Shield className="w-3.5 h-3.5 text-white/20" />
          </div>
        </div>

        {/* Photo */}
        <div className="relative w-full flex-shrink-0" style={{ height: 220, overflow: 'hidden', background: 'rgba(0,0,0,0.6)' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-[#0a0b10]/20 to-transparent z-10" />
          <img
            src={player.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=880808&color=fff&size=300`}
            alt={player.name}
            className="w-full h-full object-cover object-top photo-zoom"
            style={{ filter: 'grayscale(1) contrast(1.1) brightness(0.75)', transition: 'filter 0.6s, transform 0.6s' }}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>

        {/* Identity + Titles */}
        <div className="px-4 pt-2 pb-2 -mt-6 relative z-10">
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none truncate">
            {player.name}
          </h2>

          {/* Title badges — always visible below name */}
          {player.titles?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5 mb-1">
              {player.titles.map((t, i) => (
                <div key={i} className="flex items-center gap-1 px-2 py-1 border border-yellow-500/40 bg-yellow-500/8">
                  <Trophy className="w-2.5 h-2.5 text-yellow-400 flex-shrink-0" />
                  <span className="text-[7px] font-black uppercase tracking-widest text-yellow-400 leading-none">{t}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/15 border border-primary/25 text-[8px] font-black text-primary uppercase tracking-widest">
              <Crosshair className="w-2 h-2" />{player.role || 'Player'}
            </span>
            <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest">{mtch} Matches</span>
          </div>
        </div>

        {/* Primary 3x2 stats */}
        <div className="px-4 pb-2 grid grid-cols-3 gap-1.5">
          <StatBox label="Runs" value={runs} />
          <StatBox label="High Score" value={hs} accent />
          <StatBox label="Wickets" value={wkts} />
          <StatBox label="Bat Avg" value={avg} />
          <StatBox label="Strike Rate" value={sr} />
          <StatBox label="Economy" value={econ} />
        </div>

        {/* Boundary bar */}
        <div className="px-4 pb-2 grid grid-cols-4 gap-1">
          {[['4s', fours, 'text-white'], ['6s', sixes, 'text-yellow-400'], ['50s', fifties, 'text-white'], ['100s', hundreds, 'text-primary']].map(([lbl, val, cls]) => (
            <div key={lbl} className="flex flex-col items-center bg-white/3 border border-white/5 py-1.5">
              <span className="text-[6px] font-black text-gray-700 uppercase tracking-widest">{lbl}</span>
              <span className={`text-sm font-black italic ${cls}`}>{val}</span>
            </div>
          ))}
        </div>

        {/* Bowling + Fielding */}
        <div className="px-4 pb-3 flex gap-1.5">
          <div className="flex-1 flex justify-between items-center bg-red-950/15 border border-red-900/20 px-2 py-1.5">
            <span className="text-[7px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-1">
              <Wind className="w-2 h-2" />Best
            </span>
            <span className="text-sm font-black text-red-400 italic">{bb}</span>
          </div>
          <div className="flex-1 flex justify-between items-center bg-white/3 border border-white/5 px-2 py-1.5">
            <span className="text-[7px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-1">
              <BarChart2 className="w-2 h-2" />Field
            </span>
            <span className="text-sm font-black text-gray-300 italic">{catches}C/{runOuts}RO</span>
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 pb-4">
          <button
            onClick={handleClick}
            className="w-full py-3 bg-transparent border border-white/10 text-gray-500 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-primary hover:text-white hover:border-primary flex items-center justify-center gap-2"
            style={{ transition: 'all 0.25s' }}
          >
            <Activity className="w-3 h-3" />
            Full Career Stats
          </button>
        </div>

        {/* Hover accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary scale-x-0 group-hover:scale-x-100"
          style={{ transition: 'transform 0.4s', transformOrigin: 'left' }} />
      </div>

      <AnimatePresence>
        {showModal && (
          <PlayerDetailsModal player={player} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default PlayerCard;
