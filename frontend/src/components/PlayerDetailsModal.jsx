import React, { useState, useMemo, useEffect } from 'react';
import {
  X, ExternalLink, Trophy, Target, Zap, Activity,
  Shield, Star, BarChart2, Wind, Calendar, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const cleanName = (name = '') =>
  name.replace(/_/g, ' ').replace(/[!._]+$/, '').trim();

/* ── Tiny stat cell ────────────────────────────────────────────────────── */
const Stat = ({ label, value, accent, large, sub }) => (
  <div className={`flex flex-col p-3 border rounded-none ${accent
    ? 'bg-primary/8 border-primary/20'
    : 'bg-white/4 border-white/6'}`}>
    <span className="text-[7px] font-black uppercase tracking-widest text-gray-600 mb-0.5">{label}</span>
    <span className={`font-black italic tracking-tighter leading-none ${
      large ? 'text-2xl' : 'text-base'
    } ${accent ? 'text-primary' : 'text-white'}`}>{value ?? '—'}</span>
    {sub && <span className="text-[6px] text-gray-700 mt-0.5 font-bold">{sub}</span>}
  </div>
);

/* ── Match row ─────────────────────────────────────────────────────────── */
const MatchRow = ({ match, i }) => {
  const bat  = match.performance?.batting;
  const bowl = match.performance?.bowling;
  const hasBat  = bat?.runs > 0 || (bat?.how_out && !bat.how_out.toLowerCase().includes('dnb'));
  const hasBowl = (bowl?.wickets ?? 0) > 0 || (bowl?.overs ?? 0) > 0;

  return (
    <div className={`flex items-center gap-2 px-3 py-2.5 border-b border-white/5 ${match.won ? 'border-l-2 border-l-primary' : 'border-l-2 border-l-white/10'}`}>
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${match.won ? 'bg-primary' : 'bg-gray-700'}`} />

      {/* Opponent */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-black text-[10px] uppercase italic tracking-tight truncate">vs {match.opponent}</p>
        <p className="text-gray-700 text-[7px] font-bold">{match.date}</p>
      </div>

      {/* Score */}
      <div className="text-right hidden sm:block flex-shrink-0 mr-2">
        <p className="text-[9px] font-black text-white italic">{match.my_score || '—'}</p>
        <p className="text-gray-700 text-[7px]">{match.opp_score || '—'}</p>
      </div>

      {/* Performance chips */}
      <div className="flex gap-1 items-center flex-shrink-0">
        {hasBat && (
          <span className="text-[9px] font-black text-white bg-primary/10 border border-primary/20 px-1.5 py-0.5">
            {bat.runs}{bat.how_out?.toLowerCase().includes('not out') ? '*' : ''}
            {bat.balls > 0 ? <span className="text-gray-600 font-normal"> ({bat.balls})</span> : null}
          </span>
        )}
        {hasBowl && (
          <span className="text-[9px] font-black text-red-400 bg-red-900/10 border border-red-900/20 px-1.5 py-0.5">
            {bowl.wickets}/{bowl.runs}
          </span>
        )}
        {!hasBat && !hasBowl && <span className="text-[7px] text-gray-700 font-bold">DNB</span>}
      </div>

      {match.cricheroes_url && (
        <a href={match.cricheroes_url} target="_blank" rel="noopener noreferrer"
          className="w-6 h-6 bg-white/5 hover:bg-primary/20 border border-white/8 flex items-center justify-center flex-shrink-0"
          onClick={e => e.stopPropagation()}>
          <ExternalLink className="w-2.5 h-2.5 text-gray-600" />
        </a>
      )}
    </div>
  );
};

/* ── Section title ──────────────────────────────────────────────────────── */
const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-3">
    <Icon className="w-3.5 h-3.5 text-primary" />
    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">{title}</span>
    <div className="flex-1 h-px bg-white/5" />
  </div>
);

/* ── Main Modal ─────────────────────────────────────────────────────────── */
const PlayerDetailsModal = ({ player, onClose }) => {
  const [tab, setTab] = useState('overview');

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── Computed stats ──
  const runs    = player.batting?.total_runs ?? player.runs ?? 0;
  const mtch    = player.matches ?? 0;
  const wkts    = player.bowling?.wickets ?? player.wickets ?? 0;
  const hs      = player.batting?.high_score ?? 0;
  const avg     = player.batting?.average ? Number(player.batting.average).toFixed(2) : '0.00';
  const sr      = player.batting?.strike_rate ? Number(player.batting.strike_rate).toFixed(2) : '0.00';
  const inn     = player.batting?.innings ?? 0;
  const fours   = player.batting?.fours ?? 0;
  const sixes   = player.batting?.sixes ?? 0;
  const fifties = player.batting?.fifties ?? 0;
  const hunds   = player.batting?.hundreds ?? 0;
  const econ    = player.bowling?.economy ? Number(player.bowling.economy).toFixed(2) : '—';
  const bAvg    = player.bowling?.average ? Number(player.bowling.average).toFixed(2) : '—';
  const bb      = player.bowling?.best_bowling || '—';
  const overs   = player.bowling?.overs ? Number(player.bowling.overs).toFixed(1) : '0';
  const fiveW   = player.bowling?.five_w ?? 0;
  const catches = player.catches ?? 0;
  const runOuts = player.run_outs ?? 0;
  const motm    = player.man_of_the_match ?? 0;
  const tourn   = player.tournaments ?? 0;
  const batStyle  = player.general?.batting_style || '';
  const bowlStyle = player.general?.bowling_style || '';

  const history = player.match_history || [];
  const winRate = useMemo(() => {
    if (!history.length) return 0;
    return Math.round(history.filter(m => m.won).length / history.length * 100);
  }, [history]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'batting',  label: 'Batting',  icon: Zap },
    { id: 'bowling',  label: 'Bowling',  icon: Target },
    { id: 'fielding', label: 'Fielding', icon: Shield },
    { id: 'matches',  label: `Matches`, icon: Calendar },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      {/* ── MAIN SHEET — slides up from bottom on mobile, centered on desktop ── */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="relative mt-auto md:m-auto w-full md:max-w-5xl bg-[#050505] border-t md:border border-white/8 flex flex-col overflow-hidden"
        style={{ maxHeight: '96vh', minHeight: '70vh' }}
      >
        {/* ── HEADER ── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-[#080810] flex-shrink-0">
          <img
            src={player.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=880808&color=fff&size=80`}
            alt={player.name}
            className="w-10 h-10 object-cover object-top border border-white/10 flex-shrink-0"
            referrerPolicy="no-referrer"
            onError={(e) => {
              if (e.target.dataset.failed) return;
              e.target.dataset.failed = 'true';
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=880808&color=fff&size=80`;
            }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none truncate">{player.name}</h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[8px] font-black text-primary uppercase tracking-widest">{player.role || 'Player'}</span>
              <span className="text-[7px] text-gray-600">·</span>
              <span className="text-[8px] text-gray-600 font-bold">{mtch} matches</span>
              {motm > 0 && <>
                <span className="text-[7px] text-gray-600">·</span>
                <span className="text-[8px] text-yellow-400 font-black flex items-center gap-0.5"><Star className="w-2 h-2" />{motm}× MOM</span>
              </>}
            </div>
          </div>

          {/* Key 3 numbers */}
          <div className="hidden sm:flex items-center gap-3 mr-4">
            <div className="text-center">
              <div className="text-lg font-black text-primary italic">{runs}</div>
              <div className="text-[6px] font-black text-gray-600 uppercase tracking-widest">Runs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-white italic">{wkts}</div>
              <div className="text-[6px] font-black text-gray-600 uppercase tracking-widest">Wkts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-white italic">{winRate}%</div>
              <div className="text-[6px] font-black text-gray-600 uppercase tracking-widest">Win</div>
            </div>
          </div>

          <button onClick={onClose}
            className="w-9 h-9 bg-white/5 hover:bg-primary border border-white/10 hover:border-primary flex items-center justify-center flex-shrink-0"
            style={{ transition: 'all 0.2s' }}>
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Mobile key numbers */}
        <div className="flex sm:hidden items-center border-b border-white/5 bg-[#060608] flex-shrink-0">
          {[['Runs', runs, 'text-primary'], ['Wickets', wkts, 'text-red-400'], ['Win%', `${winRate}%`, 'text-white'], ['MOM', motm, 'text-yellow-400']].map(([lbl, val, cls]) => (
            <div key={lbl} className="flex-1 flex flex-col items-center py-2.5 border-r border-white/5 last:border-r-0">
              <span className={`text-base font-black italic ${cls}`}>{val}</span>
              <span className="text-[6px] font-black text-gray-600 uppercase tracking-widest">{lbl}</span>
            </div>
          ))}
        </div>

        {/* ── TAB BAR ── */}
        <div className="flex border-b border-white/5 bg-[#060608] flex-shrink-0 overflow-x-auto scrollbar-none">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-[8px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 flex-shrink-0 ${
                tab === t.id ? 'text-white border-primary bg-primary/5' : 'text-gray-600 border-transparent'
              }`}
              style={{ transition: 'color 0.2s' }}>
              <t.icon className="w-3 h-3" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5" style={{ WebkitOverflowScrolling: 'touch' }}>

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div className="space-y-5">
              {/* Style tags */}
              {(batStyle || bowlStyle) && (
                <div className="flex gap-2 flex-wrap">
                  {batStyle && <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 border border-white/10 bg-white/4 px-3 py-1.5">🏏 {batStyle}</span>}
                  {bowlStyle && <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 border border-white/10 bg-white/4 px-3 py-1.5">⚡ {bowlStyle}</span>}
                  {tourn > 0 && <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 border border-white/10 bg-white/4 px-3 py-1.5">🏆 {tourn} Tournaments</span>}
                </div>
              )}

              <div>
                <SectionTitle icon={Zap} title="Batting Summary" />
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  <Stat label="Runs" value={runs} large accent />
                  <Stat label="HS" value={hs} large accent />
                  <Stat label="Avg" value={avg} />
                  <Stat label="SR" value={sr} />
                  <Stat label="Inn" value={inn} />
                  <Stat label="50s" value={fifties} />
                  <Stat label="100s" value={hunds} />
                  <Stat label="4s / 6s" value={`${fours}/${sixes}`} />
                </div>
              </div>

              <div>
                <SectionTitle icon={Target} title="Bowling Summary" />
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  <Stat label="Wickets" value={wkts} large />
                  <Stat label="Best" value={bb} large accent />
                  <Stat label="Economy" value={econ} />
                  <Stat label="Avg" value={bAvg} />
                  <Stat label="Overs" value={overs} />
                  <Stat label="5W" value={fiveW} />
                </div>
              </div>

              <div>
                <SectionTitle icon={Shield} title="Fielding & Awards" />
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  <Stat label="Catches" value={catches} />
                  <Stat label="Run Outs" value={runOuts} />
                  <Stat label="MOM" value={motm} accent />
                  <Stat label="Tournaments" value={tourn} />
                </div>
              </div>

              {/* Win rate bar */}
              <div className="bg-white/3 border border-white/6 p-3">
                <div className="flex justify-between mb-2">
                  <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Win Rate</span>
                  <span className="text-[8px] font-black text-primary">{winRate}% across {mtch} matches</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${winRate}%`, transition: 'width 1s ease' }} />
                </div>
              </div>
            </div>
          )}

          {/* ── BATTING ── */}
          {tab === 'batting' && (
            <div className="space-y-4">
              <SectionTitle icon={Zap} title="Complete Batting Stats" />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                <Stat label="Matches" value={mtch} />
                <Stat label="Innings" value={inn} />
                <Stat label="Runs" value={runs} large accent />
                <Stat label="High Score" value={hs} large accent />
                <Stat label="Average" value={avg} large />
                <Stat label="Strike Rate" value={sr} large />
                <Stat label="Fours (4s)" value={fours} />
                <Stat label="Sixes (6s)" value={sixes} accent />
                <Stat label="50s" value={fifties} />
                <Stat label="100s" value={hunds} accent />
              </div>

              {(fours + sixes) > 0 && (
                <div className="bg-white/3 border border-white/6 p-3">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2">Boundary Split</p>
                  <div className="flex h-3 overflow-hidden rounded-full bg-white/5">
                    <div className="bg-primary/60 h-full" style={{ width: `${fours / (fours + sixes) * 100}%` }} />
                    <div className="bg-yellow-500/60 h-full" style={{ width: `${sixes / (fours + sixes) * 100}%` }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[7px] font-bold text-primary">{fours} Fours</span>
                    <span className="text-[7px] font-bold text-yellow-400">{sixes} Sixes</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── BOWLING ── */}
          {tab === 'bowling' && (
            <div className="space-y-4">
              <SectionTitle icon={Target} title="Complete Bowling Stats" />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                <Stat label="Wickets" value={wkts} large />
                <Stat label="Best Bowling" value={bb} large accent />
                <Stat label="Overs" value={overs} />
                <Stat label="Economy" value={econ} />
                <Stat label="Bowling Avg" value={bAvg} />
                <Stat label="5 Wicket Hauls" value={fiveW} accent />
              </div>
              {wkts === 0 && (
                <div className="text-center py-10 border border-white/5 bg-white/2">
                  <Wind className="w-8 h-8 text-gray-800 mx-auto mb-3" />
                  <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">No bowling data recorded</p>
                </div>
              )}
              {bowlStyle && (
                <div className="flex items-center gap-2 border border-white/6 bg-white/3 p-3">
                  <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Style</span>
                  <span className="text-[8px] font-bold text-white">{bowlStyle}</span>
                </div>
              )}
            </div>
          )}

          {/* ── FIELDING ── */}
          {tab === 'fielding' && (
            <div className="space-y-4">
              <SectionTitle icon={Shield} title="Fielding & Contributions" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                <Stat label="Catches" value={catches} large />
                <Stat label="Run Outs" value={runOuts} large />
                <Stat label="Man of Match" value={motm} large accent />
                <Stat label="Tournaments" value={tourn} />
                <Stat label="Win Rate" value={`${winRate}%`} sub={`${mtch} matches`} />
                <Stat label="Stumpings" value={player.stumpings ?? 0} />
              </div>
              {catches === 0 && runOuts === 0 && (
                <p className="text-[8px] text-gray-700 font-bold uppercase tracking-widest text-center py-4">
                  Fielding stats will appear after a sync
                </p>
              )}
            </div>
          )}

          {/* ── MATCHES ── */}
          {tab === 'matches' && (
            <div>
              <SectionTitle icon={Calendar} title={`Match History (${history.length})`} />
              {history.length === 0 ? (
                <div className="text-center py-12 border border-white/5 bg-white/2">
                  <Activity className="w-8 h-8 text-gray-800 mx-auto mb-3" />
                  <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">No match records</p>
                  <p className="text-[7px] text-gray-800 mt-1">Run a sync from Admin → Sync Players</p>
                </div>
              ) : (
                <div className="border border-white/5 overflow-hidden">
                  <div className="flex items-center gap-3 px-3 py-2 bg-white/3 border-b border-white/5">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-[7px] font-bold text-gray-600 uppercase">Win</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-700" /><span className="text-[7px] font-bold text-gray-600 uppercase">Loss</span></div>
                    <span className="text-[7px] font-bold text-gray-700 ml-auto">{winRate}% win rate</span>
                  </div>
                  {history.map((m, i) => <MatchRow key={m.match_id || i} match={m} i={i} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PlayerDetailsModal;
