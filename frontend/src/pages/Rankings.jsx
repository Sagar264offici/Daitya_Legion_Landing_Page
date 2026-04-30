import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Shield, Target, Waves, Zap } from "lucide-react";
import { API_BASE_URL } from "../config.js";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";

// ── Strip CricHeroes special chars from names (e.g. "Ansh!" → "Ansh")
const cleanName = (name = '') =>
  name.replace(/_/g, ' ').replace(/[!._]+$/, '').replace(/\.$/, '').trim();

const RankingCard = ({ player, rank, value, label, color }) => {
  const playerNameClean = cleanName(player.name).toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className="p-3 md:p-5 flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-0 group hover:border-primary/60 transition-colors border border-white/5 bg-[#0a0b10]"
    >
      <div className="flex items-center gap-6">
        <div
          className={`w-12 h-12 rounded-sm flex items-center justify-center font-black ${rank === 0 ? "bg-primary text-white shadow-[0_0_25px_rgba(239,35,60,0.5)] rotate-45" : "bg-white/5 text-gray-500 border border-white/10"}`}
        >
          <span className={rank === 0 ? "-rotate-45" : ""}>{rank + 1}</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-sm overflow-hidden border border-white/10 relative flex-shrink-0">
            <img
              src={player.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName(player.name))}&background=880808&color=fff&size=100`}
              alt=""
              className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={(e) => { if (e.target.dataset.failed) return; e.target.dataset.failed = 'true'; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName(player.name))}&background=880808&color=fff&size=100`; }}
            />
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div>
            <h4 className="text-xl font-black text-white group-hover:text-primary transition-colors tracking-tighter uppercase italic">
              {player.name}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                {player.role}
              </span>
              <div className="w-1 h-1 rounded-full bg-gray-800"></div>
              <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest animate-pulse">
                Synced
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center sm:text-right w-full sm:w-auto">
        <div className="flex flex-col items-center sm:items-end">
          <span
            className={`text-4xl font-black ${color} tracking-tighter glow-text-primary`}
          >
            {value}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <Crosshair className="w-2.5 h-2.5 text-gray-700" />
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">
              {label}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Rankings = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("batting");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/players`)
      .then((res) => {
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setPlayers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Rankings fetch failed:", err);
        setError("Failed to load rankings. Backend data rich but UI blocked.");
        setLoading(false);
      });
  }, []);

  const rankedData = useMemo(() => {
    const list = [...players];

    const batting = list
      .map((p) => ({
        p,
        score: Math.round(
          (p.runs || 0) +
            (p.batting?.average || 0) * 10 +
            (p.batting?.strike_rate || 0) / 10,
        ),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const bowling = list
      .map((p) => ({
        p,
        score: Math.round(
          (p.wickets || 0) * 20 +
            Math.max(0, 100 - (p.bowling?.economy || 10) * 10),
        ),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const allrounder = list
      .map((p) => {
        const batScore =
          (p.runs || 0) +
          (p.batting?.average || 0) * 10 +
          (p.batting?.strike_rate || 0) / 10;
        const bowlScore =
          (p.wickets || 0) * 20 +
          Math.max(0, 100 - (p.bowling?.economy || 10) * 10);
        return { p, score: Math.round(batScore + bowlScore) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const catches = [...list]
      .sort((a, b) => (b.catches || 0) - (a.catches || 0))
      .slice(0, 8);
    const runouts = [...list]
      .sort((a, b) => (b.run_outs || 0) - (a.run_outs || 0))
      .slice(0, 8);

    return { batting, bowling, allrounder, catches, runouts };
  }, [players]);

  const tabs = [
    { id: "batting", label: "BATTING", icon: Zap, color: "text-primary" },
    { id: "bowling", label: "BOWLING", icon: Target, color: "text-red-700" },
    {
      id: "allrounder",
      label: "ALL-ROUNDERS",
      icon: Shield,
      color: "text-gray-400",
    },
    { id: "fielding", label: "FIELDING", icon: Waves, color: "text-red-900" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] pb-32 overflow-x-hidden selection:bg-primary selection:text-white">
      <Navbar />

      {/* Background — lightweight, no heavy blurs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/4 rounded-full blur-[120px]" style={{ transform: 'translateZ(0)' }}></div>
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-red-900/4 rounded-full blur-[100px]" style={{ transform: 'translateZ(0)' }}></div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-24 md:pt-32">
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            className="flex items-center gap-4 px-6 py-2 rounded-sm bg-primary/10 border border-primary/20 mb-8 font-black uppercase text-[10px] text-primary tracking-[0.4em]"
          >
            <Shield className="w-3.5 h-3.5" />
            Player Rankings — {players.length} Players
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-[10rem] font-black text-white glow-text-primary tracking-tighter leading-none italic uppercase"
          >
            PLAYER{" "}
            <span className="text-primary not-italic tracking-[0.1em] sm:tracking-[0.15em] ml-2 sm:ml-4 font-black">
              RANKINGS
            </span>
          </motion.h1>
          <p className="text-gray-700 font-bold uppercase tracking-[0.6em] text-[10px] mt-4">
            Season Performance Leaderboard
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10 md:mb-20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-4 py-3 md:px-10 md:py-5 rounded-sm text-[8px] md:text-[10px] whitespace-nowrap flex-1 md:flex-none justify-center font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden group ${activeTab === tab.id ? "bg-primary text-white shadow-[0_0_40px_rgba(239,35,60,0.4)]" : "bg-[#0a0b10] text-gray-600 border border-white/5 hover:border-primary/30 active:scale-95"}`}
            >
              <tab.icon
                className={`w-4 h-4 relative z-10 ${activeTab === tab.id ? "text-white" : tab.color}`}
              />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="w-full max-w-4xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 border border-white/5 bg-[#0a0b10]/40 rounded-sm">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <div className="mt-12 text-center">
                <p className="text-white font-black uppercase tracking-[0.5em] text-xs mb-3 italic">
                  Loading Rankings
                </p>
                <p className="text-gray-700 text-[9px] font-bold uppercase tracking-[0.3em]">
                  Fetching player statistics...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-40 border border-red-900/20 bg-red-950/5 rounded-sm">
              <Zap className="w-16 h-16 text-red-900 mb-8 animate-pulse" />
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">
                Encryption Error // 404
              </h3>
              <p className="text-red-900/60 font-bold uppercase tracking-widest text-[9px]">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-8 px-8 py-3 bg-red-950/20 border border-red-900/40 text-white text-[9px] font-black uppercase tracking-[0.3em] hover:bg-red-900/40 transition-all"
              >
                Re-establish Link
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === "batting" && (
                <motion.div
                  key="batting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {rankedData.batting.map((item, i) => (
                    <RankingCard
                      key={item.p.external_id}
                      rank={i}
                      player={item.p}
                      value={item.score}
                      label="Batting Rating"
                      color="text-primary"
                    />
                  ))}
                </motion.div>
              )}
              {activeTab === "bowling" && (
                <motion.div
                  key="bowling"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {rankedData.bowling.map((item, i) => (
                    <RankingCard
                      key={item.p.external_id}
                      rank={i}
                      player={item.p}
                      value={item.score}
                      label="Bowling Rating"
                      color="text-red-700"
                    />
                  ))}
                </motion.div>
              )}
              {activeTab === "allrounder" && (
                <motion.div
                  key="allrounder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {rankedData.allrounder.map((item, i) => (
                    <RankingCard
                      key={item.p.external_id}
                      rank={i}
                      player={item.p}
                      value={item.score}
                      label="All-Round Rating"
                      color="text-gray-400"
                    />
                  ))}
                </motion.div>
              )}
              {activeTab === "fielding" && (
                <motion.div
                  key="fielding"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-12"
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-8 border-l-4 border-primary pl-6">
                      <h3 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter text-center md:text-left">
                        Catches <br />
                        <span className="text-[10px] tracking-[0.4em] not-italic text-gray-700 font-black">
                          Best Fielders
                        </span>
                      </h3>
                    </div>
                    {rankedData.catches.map((p, i) => (
                      <RankingCard
                        key={p.external_id}
                        rank={i}
                        player={p}
                        value={p.catches || 0}
                        label="Catches"
                        color="text-primary"
                      />
                    ))}
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-8 border-l-4 border-red-950 pl-6 text-center sm:text-right w-full sm:w-auto justify-end md:text-left md:justify-start">
                      <h3 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter text-center md:text-left">
                        Run Outs <br />
                        <span className="text-[10px] tracking-[0.4em] not-italic text-gray-700 font-black">
                          Run Out Specialists
                        </span>
                      </h3>
                    </div>
                    {rankedData.runouts.map((p, i) => (
                      <RankingCard
                        key={p.external_id}
                        rank={i}
                        player={p}
                        value={p.run_outs || 0}
                        label="Run Outs"
                        color="text-red-900"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rankings;
