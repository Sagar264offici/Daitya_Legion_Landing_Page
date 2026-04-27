import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ExternalLink, Trophy, Target, Zap, Activity,
  Shield, Award, Star, BarChart2, Wind, TrendingUp, Calendar, Hash
} from 'lucide-react';

// ── Stat pill component ──────────────────────────────────────────────────────
const Stat = ({ label, value, accent, large, sub }) => (
  <div className={`flex flex-col p-3 md:p-4 border rounded-sm transition-all ${accent ? 'bg-primary/8 border-primary/20' : 'bg-white/4 border-white/5'}`}>
    <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-gray-600 mb-1 leading-none">{label}</span>
    <span className={`font-black italic tracking-tighter leading-none ${large ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'} ${accent ? 'text-primary' : 'text-white'}`}>
      {value ?? '—'}
    </span>
    {sub && <span className="text-[7px] text-gray-700 mt-1 font-bold">{sub}</span>}
  </div>
);

// ── Match row ─────────────────────────────────────────────────────────────────
const MatchRow = ({ match, index }) => {
  const p = match.performance;
  const bat = p?.batting;
  const bowl = p?.bowling;
  const showBat = bat?.runs > 0 || (bat?.how_out && bat.how_out !== 'DNB');
  const showBowl = (bowl?.overs > 0) || (bowl?.wickets > 0);

  const formatHowOut = (s) => {
    if (!s) return '';
    const l = s.toLowerCase();
    if (l.includes('not out')) return '*';
    if (l.includes('run out')) return '†';
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.015 }}
      className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-all group/row relative overflow-hidden ${match.won ? 'border-l-2 border-l-primary' : 'border-l-2 border-l-gray-800'}`}
    >
      {/* Result dot */}
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${match.won ? 'bg-primary' : 'bg-gray-700'}`} />

      {/* Opponent + date */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-black text-xs uppercase italic tracking-tight truncate">
          vs {match.opponent}
        </p>
        <p className="text-gray-700 text-[8px] font-bold tracking-widest">{match.date}</p>
      </div>

      {/* Score summary */}
      <div className="text-right hidden sm:block flex-shrink-0">
        <p className="text-[10px] font-black text-white italic">{match.my_score || '—'}</p>
        <p className="text-gray-700 text-[8px]">vs {match.opp_score || '—'}</p>
      </div>

      {/* Performance chips */}
      <div className="flex gap-1.5 items-center flex-shrink-0">
        {showBat && (
          <span className="text-[9px] font-black text-white bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-sm">
            {bat.runs}{formatHowOut(bat.how_out)}
            {bat.balls > 0 && <span className="text-gray-600 not-italic"> ({bat.balls})</span>}
          </span>
        )}
        {showBowl && (
          <span className="text-[9px] font-black text-red-400 bg-red-900/10 border border-red-900/20 px-2 py-0.5 rounded-sm">
            {bowl.wickets}/{bowl.runs}
            {bowl.overs > 0 && <span className="text-gray-700 not-italic"> ({bowl.overs}ov)</span>}
          </span>
        )}
        {!showBat && !showBowl && (
          <span className="text-[8px] text-gray-700 font-bold">DNB</span>
        )}
      </div>

      {/* CricHeroes link */}
      {match.cricheroes_url && (
        <a
          href={match.cricheroes_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-7 h-7 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/30 flex items-center justify-center transition-all flex-shrink-0"
          onClick={e => e.stopPropagation()}
        >
          <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-primary" />
        </a>
      )}
    </motion.div>
  );
};

// ── Section header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, accent }) => (
  <div className={`flex items-center gap-3 mb-4 ${accent ? '' : ''}`}>
    <div className={`w-6 h-6 rounded-sm flex items-center justify-center ${accent ? 'bg-primary/15 border border-primary/20' : 'bg-white/5 border border-white/10'}`}>
      <Icon className={`w-3 h-3 ${accent ? 'text-primary' : 'text-gray-500'}`} />
    </div>
    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">{title}</h4>
    <div className="flex-1 h-px bg-white/5" />
  </div>
);

// ── Main Modal ────────────────────────────────────────────────────────────────
const PlayerDetailsModal = ({ player, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const runs   = player.batting?.total_runs ?? player.runs ?? 0;
  const mtch   = player.matches ?? 0;
  const wkts   = player.bowling?.wickets ?? player.wickets ?? 0;
  const hs     = player.batting?.high_score ?? 0;
  const avg    = player.batting?.average ? Number(player.batting.average).toFixed(2) : '0.00';
  const sr     = player.batting?.strike_rate ? Number(player.batting.strike_rate).toFixed(2) : '0.00';
  const inn    = player.batting?.innings ?? 0;
  const fours  = player.batting?.fours ?? 0;
  const sixes  = player.batting?.sixes ?? 0;
  const fifties = player.batting?.fifties ?? 0;
  const hundreds = player.batting?.hundreds ?? 0;
  const econ   = player.bowling?.economy ? Number(player.bowling.economy).toFixed(2) : '—';
  const bAvg   = player.bowling?.average ? Number(player.bowling.average).toFixed(2) : '—';
  const bb     = player.bowling?.best_bowling || '—';
  const overs  = player.bowling?.overs ? Number(player.bowling.overs).toFixed(1) : '0.0';
  const fiveW  = player.bowling?.five_w ?? 0;
  const catches = player.catches ?? 0;
  const runOuts = player.run_outs ?? 0;
  const motm   = player.man_of_the_match ?? 0;
  const tourn  = player.tournaments ?? 0;

  const recentMatches = useMemo(() => (player.match_history || []).slice(0, 20), [player.match_history]);
  const winRate = useMemo(() => {
    if (!player.match_history?.length) return 0;
    return Math.round((player.match_history.filter(m => m.won).length / player.match_history.length) * 100);
  }, [player.match_history]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'batting',  label: 'Batting',  icon: Zap },
    { id: 'bowling',  label: 'Bowling',  icon: Target },
    { id: 'matches',  label: `Matches (${recentMatches.length})`, icon: Calendar },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/95 backdrop-blur-xl overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_0%,rgba(239,35,60,0.08),transparent_50%)]" />
      </div>

      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="relative w-full max-w-[1200px] max-h-[95vh] md:max-h-[92vh] bg-[#050505] border border-white/8 shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col lg:flex-row overflow-hidden"
      >
        {/* ── LEFT PANEL ── */}
        <div className="lg:w-[340px] flex-shrink-0 flex flex-col bg-[#080810] border-b lg:border-b-0 lg:border-r border-white/5">
          {/* Photo */}
          <div className="relative h-52 lg:h-72 overflow-hidden bg-black">
            <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-transparent to-transparent z-10" />
            <img
              src={player.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=880808&color=fff&size=400`}
              alt={player.name}
              className="w-full h-full object-cover object-top"
              referrerPolicy="no-referrer"
            />
            {/* Close btn */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 w-9 h-9 bg-black/60 hover:bg-primary/80 border border-white/10 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            {/* Titles */}
            {player.titles?.length > 0 && (
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
                {player.titles.map((t, i) => (
                  <div key={i} className="px-2 py-1 bg-[#1a1500] border border-yellow-600/30 rounded-sm">
                    <span className="text-[8px] font-black text-yellow-500 uppercase tracking-wider flex items-center gap-1">
                      <Trophy className="w-2 h-2" />{t}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Identity */}
          <div className="px-5 py-4 flex-1">
            <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">
              {player.name}
            </h2>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest border border-primary/30 px-2 py-0.5 rounded-sm bg-primary/10">
                {player.role || 'Player'}
              </span>
              {motm > 0 && (
                <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest border border-yellow-500/20 px-2 py-0.5 rounded-sm bg-yellow-500/5 flex items-center gap-1">
                  <Star className="w-2.5 h-2.5" />{motm}× MOM
                </span>
              )}
            </div>

            {/* Key numbers */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="flex flex-col items-center bg-white/4 border border-white/5 p-3 rounded-sm">
                <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Matches</span>
                <span className="text-xl font-black text-white italic">{mtch}</span>
              </div>
              <div className="flex flex-col items-center bg-primary/8 border border-primary/15 p-3 rounded-sm">
                <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Runs</span>
                <span className="text-xl font-black text-primary italic">{runs}</span>
              </div>
              <div className="flex flex-col items-center bg-white/4 border border-white/5 p-3 rounded-sm">
                <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Wickets</span>
                <span className="text-xl font-black text-red-400 italic">{wkts}</span>
              </div>
            </div>

            {/* Win rate + tournaments */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 bg-white/4 border border-white/5 p-3 rounded-sm">
                <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest mb-1">Win Rate</p>
                <p className="text-lg font-black text-white italic">{winRate}%</p>
                <div className="w-full h-1 bg-white/5 rounded-full mt-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${winRate}%` }} />
                </div>
              </div>
              <div className="flex-1 bg-white/4 border border-white/5 p-3 rounded-sm">
                <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest mb-1">Tournaments</p>
                <p className="text-lg font-black text-white italic">{tourn}</p>
                <p className="text-[7px] text-gray-700">{catches}C / {runOuts} RO</p>
              </div>
            </div>

            {/* General */}
            {player.general?.batting_style && (
              <div className="space-y-1.5 border-t border-white/5 pt-3">
                {player.general.batting_style && (
                  <div className="flex justify-between">
                    <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Bat</span>
                    <span className="text-[8px] text-gray-300 font-bold">{player.general.batting_style}</span>
                  </div>
                )}
                {player.general.bowling_style && (
                  <div className="flex justify-between">
                    <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Bowl</span>
                    <span className="text-[8px] text-gray-300 font-bold">{player.general.bowling_style}</span>
                  </div>
                )}
                {player.general.dob && (
                  <div className="flex justify-between">
                    <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">DOB</span>
                    <span className="text-[8px] text-gray-300 font-bold">{new Date(player.general.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-white/5 bg-[#060608] flex-shrink-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-white border-primary bg-primary/5'
                    : 'text-gray-600 border-transparent hover:text-gray-400'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <SectionHeader icon={Zap} title="Batting Highlights" accent />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Stat label="High Score" value={hs} accent large />
                  <Stat label="Total Runs" value={runs} large />
                  <Stat label="Innings" value={inn} />
                  <Stat label="Average" value={avg} />
                  <Stat label="Strike Rate" value={sr} />
                  <Stat label="50s / 100s" value={`${fifties} / ${hundreds}`} />
                  <Stat label="Fours (4s)" value={fours} />
                  <Stat label="Sixes (6s)" value={sixes} accent />
                </div>

                <SectionHeader icon={Target} title="Bowling Highlights" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Stat label="Wickets" value={wkts} large />
                  <Stat label="Best Bowling" value={bb} accent />
                  <Stat label="Overs" value={overs} />
                  <Stat label="Economy" value={econ} />
                  <Stat label="Bowling Avg" value={bAvg} />
                  <Stat label="5 Wicket Hauls" value={fiveW} />
                </div>

                <SectionHeader icon={Shield} title="Fielding & Awards" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat label="Catches" value={catches} />
                  <Stat label="Run Outs" value={runOuts} />
                  <Stat label="Man of Match" value={motm} accent />
                  <Stat label="Tournaments" value={tourn} />
                </div>
              </div>
            )}

            {/* ── BATTING TAB ── */}
            {activeTab === 'batting' && (
              <div className="space-y-4">
                <SectionHeader icon={Zap} title="Complete Batting Stats" accent />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Stat label="Matches" value={mtch} />
                  <Stat label="Innings" value={inn} />
                  <Stat label="Total Runs" value={runs} large accent />
                  <Stat label="High Score" value={hs} large accent />
                  <Stat label="Average" value={avg} large />
                  <Stat label="Strike Rate" value={sr} large />
                  <Stat label="Fours (4s)" value={fours} />
                  <Stat label="Sixes (6s)" value={sixes} accent />
                  <Stat label="50s" value={fifties} />
                  <Stat label="100s" value={hundreds} accent />
                  <Stat label="Win Contribution" value={`${winRate}%`} sub={`across ${mtch} matches`} />
                </div>

                {/* Sixes progress */}
                {sixes > 0 && (
                  <div className="bg-white/3 border border-white/5 p-4 rounded-sm">
                    <div className="flex justify-between mb-2">
                      <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Boundary Split</span>
                      <span className="text-[8px] text-gray-500">{fours} fours · {sixes} sixes</span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-white/5">
                      <div className="bg-primary/60 h-full" style={{ width: `${fours / (fours + sixes) * 100}%` }} />
                      <div className="bg-yellow-500/60 h-full" style={{ width: `${sixes / (fours + sixes) * 100}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[7px] text-primary font-bold">4s ({Math.round(fours / (fours + sixes || 1) * 100)}%)</span>
                      <span className="text-[7px] text-yellow-400 font-bold">6s ({Math.round(sixes / (fours + sixes || 1) * 100)}%)</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── BOWLING TAB ── */}
            {activeTab === 'bowling' && (
              <div className="space-y-4">
                <SectionHeader icon={Target} title="Complete Bowling Stats" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Stat label="Wickets" value={wkts} large />
                  <Stat label="Best Bowling" value={bb} large accent />
                  <Stat label="Overs Bowled" value={overs} />
                  <Stat label="Economy Rate" value={econ} />
                  <Stat label="Bowling Average" value={bAvg} />
                  <Stat label="5 Wicket Hauls" value={fiveW} accent />
                </div>

                {wkts === 0 && (
                  <div className="text-center py-10 border border-white/5 bg-white/2 rounded-sm">
                    <Wind className="w-8 h-8 text-gray-800 mx-auto mb-3" />
                    <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">No bowling records</p>
                  </div>
                )}
              </div>
            )}

            {/* ── MATCHES TAB ── */}
            {activeTab === 'matches' && (
              <div>
                <SectionHeader icon={Calendar} title={`Match History (${recentMatches.length} recent)`} />
                {recentMatches.length === 0 ? (
                  <div className="text-center py-16 border border-white/5 bg-white/2">
                    <Activity className="w-10 h-10 text-gray-800 mx-auto mb-4" />
                    <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">No match records</p>
                    <p className="text-[8px] text-gray-800 mt-2">Run a sync to load match history</p>
                  </div>
                ) : (
                  <div className="border border-white/5 rounded-sm overflow-hidden">
                    {/* Legend */}
                    <div className="flex items-center gap-4 px-4 py-2 bg-white/3 border-b border-white/5">
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-[7px] font-bold text-gray-600 uppercase tracking-widest">Win</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-700" /><span className="text-[7px] font-bold text-gray-600 uppercase tracking-widest">Loss</span></div>
                      <span className="text-[7px] font-bold text-gray-700 ml-auto">{winRate}% win rate</span>
                    </div>
                    {recentMatches.map((m, i) => <MatchRow key={m.match_id || i} match={m} index={i} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PlayerDetailsModal;
