import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ChevronRight,
  ExternalLink,
  Shield,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import { API_BASE_URL } from "../config.js";

const STATUS_CONFIG = {
  ongoing: {
    label: "ONGOING",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
    dot: "bg-green-400",
    animate: true,
  },
  completed: {
    label: "COMPLETED",
    bg: "bg-white/2",
    border: "border-white/10",
    text: "text-gray-500",
    dot: "bg-gray-600",
    animate: false,
  },
  upcoming: {
    label: "UPCOMING",
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    dot: "bg-primary",
    animate: true,
  },
};

const TYPE_ICON = {
  T20: "⚡",
  T10: "🔥",
  ODI: "🏏",
  Test: "🛡️",
  Other: "🏆",
};

const StarPerformerBadge = ({ performer }) => {
  const isBowling = performer.category === "bowling";
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 border rounded-sm ${
        isBowling
          ? "bg-red-950/20 border-red-900/30"
          : "bg-primary/8 border-primary/20"
      }`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          isBowling ? "bg-red-900/30" : "bg-primary/15"
        }`}
      >
        {isBowling ? (
          <Target className="w-3.5 h-3.5 text-red-500" />
        ) : (
          <Zap className="w-3.5 h-3.5 text-primary" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-white font-black text-xs uppercase italic tracking-tight leading-none">
          {performer.player_name}
        </p>
        <p
          className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${
            isBowling ? "text-red-700" : "text-primary/70"
          }`}
        >
          {performer.performance}
        </p>
      </div>
    </div>
  );
};

const MatchCard = ({ match, isLatest }) => {
  const won =
    match.result_status === "won" ||
    match.result?.toLowerCase().includes("won");
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative border rounded-sm overflow-hidden ${
        isLatest
          ? "border-primary/40 bg-gradient-to-br from-primary/5 to-transparent"
          : "border-white/5 bg-[#0a0b10]"
      }`}
    >
      {isLatest && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/60 to-transparent" />
      )}

      <div className="p-5 md:p-7">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            {isLatest && (
              <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Latest Match
              </span>
            )}
            <h4 className="text-lg md:text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
              vs {match.opponent}
            </h4>
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-2">
              {match.date} · {match.ground}, {match.city}
            </p>
          </div>
          <div
            className={`flex-shrink-0 px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-sm ${
              won
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-950/20 border border-red-900/30 text-red-500"
            }`}
          >
            {won ? "WON" : "LOST"}
          </div>
        </div>

        {/* Score row */}
        <div className="flex items-center gap-4 mb-5 p-4 bg-black/30 border border-white/5 rounded-sm">
          <div className="flex-1 text-center">
            <p className="text-[8px] text-gray-700 font-black uppercase tracking-widest mb-1">
              Daitya Legion
            </p>
            <p className="text-2xl font-black text-white italic tracking-tighter">
              {match.our_score}
            </p>
          </div>
          <div className="text-gray-800 font-black text-sm">VS</div>
          <div className="flex-1 text-center">
            <p className="text-[8px] text-gray-700 font-black uppercase tracking-widest mb-1">
              {match.opponent}
            </p>
            <p className="text-2xl font-black text-gray-400 italic tracking-tighter">
              {match.opp_score}
            </p>
          </div>
        </div>

        {/* Player of match */}
        {match.player_of_match && (
          <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-amber-950/20 border border-amber-800/30 rounded-sm">
            <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <div>
              <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest block">
                Player of the Match
              </span>
              <span className="text-sm font-black text-amber-400 italic uppercase tracking-tight">
                {match.player_of_match}
              </span>
            </div>
          </div>
        )}

        {/* Star performers */}
        {match.star_performers?.length > 0 && (
          <div className="mb-5">
            <p className="text-[8px] font-black uppercase tracking-widest text-gray-700 mb-3 flex items-center gap-2">
              <Star className="w-3 h-3" /> Star Performers
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {match.star_performers.map((sp, i) => (
                <StarPerformerBadge key={i} performer={sp} />
              ))}
            </div>
          </div>
        )}

        {/* Highlights */}
        {match.highlights && (
          <p className="text-[10px] text-gray-600 font-bold leading-relaxed border-l-2 border-primary/30 pl-3 italic mb-5">
            {match.highlights}
          </p>
        )}

        {/* CricHeroes Link */}
        {match.cricheroes_url && (
          <a
            href={match.cricheroes_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors group"
          >
            View Scorecard on CricHeroes
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </a>
        )}
      </div>
    </motion.div>
  );
};

const TournamentCard = ({ tournament, index }) => {
  const [expanded, setExpanded] = useState(index === 0);
  const status = STATUS_CONFIG[tournament.status] || STATUS_CONFIG.completed;
  const winRate =
    tournament.matches_played > 0
      ? Math.round((tournament.wins / tournament.matches_played) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="border border-white/5 bg-[#0a0b10] overflow-hidden hover:border-primary/20 transition-all duration-500 group"
    >
      {/* Card Header */}
      <div
        className="p-4 sm:p-6 md:p-10 cursor-pointer select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-5">
            {/* Type badge */}
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-sm bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0 group-hover:border-primary/30 transition-colors text-2xl md:text-3xl">
              {TYPE_ICON[tournament.type] || "🏆"}
            </div>

            <div className="flex-1 min-w-0">
              {/* Status badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest mb-3 border ${status.bg} ${status.border} ${status.text}`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${status.dot} ${
                    status.animate ? "animate-pulse" : ""
                  }`}
                />
                {status.label}
              </div>

              <h3 className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-tight group-hover:text-primary transition-colors">
                {tournament.name}
              </h3>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                  {tournament.type} · {tournament.year}
                </span>
                {tournament.result && tournament.result !== "Ongoing" && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-gray-800" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                      {tournament.result}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 sm:gap-6 md:gap-10 flex-wrap">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-white italic tracking-tighter">
                {tournament.matches_played}
              </p>
              <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mt-1">
                Played
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-green-400 italic tracking-tighter">
                {tournament.wins}
              </p>
              <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mt-1">
                Won
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-red-700 italic tracking-tighter">
                {tournament.losses}
              </p>
              <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mt-1">
                Lost
              </p>
            </div>
            {tournament.matches_played > 0 && (
              <div className="text-center">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-primary italic tracking-tighter">
                  {winRate}%
                </p>
                <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mt-1">
                  Win Rate
                </p>
              </div>
            )}

            <motion.div
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-2"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
            </motion.div>
          </div>
        </div>

        {/* CricHeroes link */}
        {tournament.cricheroes_url && (
          <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-between">
            <a
              href={tournament.cricheroes_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-600 hover:text-primary transition-colors"
            >
              <Activity className="w-3 h-3" />
              View on CricHeroes
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest">
              {expanded ? "Collapse" : "View Matches ↓"}
            </span>
          </div>
        )}
      </div>

      {/* Expandable match list */}
      <AnimatePresence initial={false}>
        {expanded && tournament.matches?.length > 0 && (
          <motion.div
            key="matches"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 p-6 md:p-10 space-y-5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-5 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Tournament Matches
              </h4>
              {[...tournament.matches].reverse().map((match, i) => (
                <MatchCard
                  key={match.match_id || i}
                  match={match}
                  isLatest={i === 0}
                />
              ))}
            </div>
          </motion.div>
        )}
        {expanded &&
          (!tournament.matches || tournament.matches.length === 0) && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border-t border-white/5 p-10 text-center"
            >
              <p className="text-gray-700 font-black uppercase tracking-widest text-[9px]">
                Match data coming soon...
              </p>
            </motion.div>
          )}
      </AnimatePresence>
    </motion.div>
  );
};

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/tournaments`)
      .then((r) => r.json())
      .then((data) => {
        setTournaments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, []);

  const totalMatches = tournaments.reduce(
    (a, t) => a + (t.matches_played || 0),
    0,
  );
  const totalWins = tournaments.reduce((a, t) => a + (t.wins || 0), 0);
  const overallWR =
    totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#050505] pb-0 overflow-x-hidden selection:bg-primary selection:text-white">
      <Navbar />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div
          className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_-10%,#ef233c,transparent_55%)] opacity-[0.07]"
          style={{ transform: "translateZ(0)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_110%,#7f1d1d,transparent_50%)] opacity-[0.06]"
          style={{ transform: "translateZ(0)" }}
        />
      </div>

      {/* Hero Banner */}
      <div className="pt-24 sm:pt-28 md:pt-40 pb-10 sm:pb-16 md:pb-24 px-4 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-5 py-2 bg-primary/10 border border-primary/20 w-fit mb-8"
        >
          <Trophy className="w-3.5 h-3.5 text-primary" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">
            Battle Records
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="text-4xl sm:text-6xl md:text-[8rem] lg:text-[11rem] font-black text-white glow-text-primary tracking-tighter leading-none italic uppercase mb-4 break-words"
        >
          TOURNA
          <span className="text-primary not-italic tracking-[0.05em]">
            MENTS
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-gray-700 font-bold uppercase tracking-[0.5em] text-[10px] mb-16"
        >
          Daitya Legion — Full Tournament Chronicle
        </motion.p>

        {/* Summary counters */}
        {!loading && tournaments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20"
          >
            {[
              {
                label: "Tournaments",
                val: tournaments.length,
                color: "text-white",
                Icon: Trophy,
              },
              {
                label: "Matches Played",
                val: totalMatches,
                color: "text-white",
                Icon: Activity,
              },
              {
                label: "Wins",
                val: totalWins,
                color: "text-green-400",
                Icon: Shield,
              },
              {
                label: "Win Rate",
                val: `${overallWR}%`,
                color: "text-primary",
                Icon: Zap,
              },
            ].map(({ label, val, color, Icon }) => (
              <div
                key={label}
                className="p-6 bg-[#0a0b10] border border-white/5 hover:border-primary/20 transition-all group"
              >
                <Icon className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors mb-3" />
                <p
                  className={`text-3xl md:text-5xl font-black italic tracking-tighter ${color}`}
                >
                  {val}
                </p>
                <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mt-2">
                  {label}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Tournament List */}
      <div className="max-w-[1400px] mx-auto px-4 pb-0">
        {/* Performance + visibility: render only first N tournaments initially */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-1.5 h-12 bg-primary/80" />
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              All <span className="text-primary not-italic">Tournaments</span>
            </h2>
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em]">
              Participated & Ongoing
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-8" />
            <p className="text-gray-700 font-black uppercase tracking-[0.4em] text-[9px] animate-pulse">
              Loading Tournament Data...
            </p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="py-40 text-center border border-white/5 bg-[#0a0b10]">
            <Trophy className="w-16 h-16 text-gray-800 mx-auto mb-6" />
            <p className="text-gray-700 font-black uppercase tracking-widest text-[9px]">
              No tournament data yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tournaments.slice(0, 3).map((t, i) => (
              <TournamentCard key={t._id} tournament={t} index={i} />
            ))}
            {tournaments.length > 3 && (
              <div className="mt-6 py-8 text-center border border-white/5 bg-[#0a0b10]">
                <p className="text-gray-700 font-black uppercase tracking-widest text-[9px]">
                  Showing first 3 tournaments (performance mode)
                </p>
                <p className="text-[9px] text-gray-600 mt-2">
                  Expand “View Matches” inside each card to see match details.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Tournaments;
