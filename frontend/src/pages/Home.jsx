import { animate, motion } from "framer-motion";
import {
  Activity,
  ChevronRight,
  Crosshair,
  ExternalLink,
  Medal,
  Monitor,
  Shield,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import CaptainSection from "../components/CaptainSection.jsx";
import Footer from "../components/Footer.jsx";
import Hero from "../components/Hero.jsx";
import Navbar from "../components/Navbar.jsx";
import PlayerCard from "../components/PlayerCard.jsx";
import ViceCaptainSection from "../components/ViceCaptainSection.jsx";
import { API_BASE_URL } from "../config.js";

const Counter = ({ value, title, icon: Icon, color }) => {
  const countRef = useRef(null);
  useEffect(() => {
    const node = countRef.current;
    if (!node) return;
    const controls = animate(0, value, {
      duration: 2,
      ease: "easeOut",
      onUpdate(value) {
        node.textContent = Math.round(value);
      },
    });
    return () => controls.stop();
  }, [value]);

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 glass-panel border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden bg-[#0a0b10]">
      <div
        className={`absolute -right-4 -top-4 w-20 h-20 rounded-full blur-3xl opacity-5 bg-primary/20`}
      ></div>
      <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
      </div>
      <span
        ref={countRef}
        className="text-3xl md:text-5xl font-black text-white glow-text-primary tracking-tighter italic"
      >
        0
      </span>
      <div className="flex items-center gap-2 mt-4">
        <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">
          {title}
        </span>
      </div>
    </div>
  );
};

const Home = () => {
  const [players, setPlayers] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [latestTournament, setLatestTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, teamRes, tournamentRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/players`),
          fetch(`${API_BASE_URL}/api/team`),
          fetch(`${API_BASE_URL}/api/tournaments`),
        ]);

        const playersRaw = await playersRes.json();
        const playersData = Array.isArray(playersRaw) ? playersRaw : [];
        const teamData = await teamRes.json();
        const tournamentData = Array.isArray(await tournamentRes.json()) ? await tournamentRes.json() : [];

        const topScorer = [...playersData].sort(
          (a, b) => (b.runs || 0) - (a.runs || 0),
        )[0];
        const topWicketer = [...playersData].sort(
          (a, b) => (b.wickets || 0) - (a.wickets || 0),
        )[0];

        setPlayers(playersData);
        setTeamStats({ ...teamData, topScorer, topWicketer });
        if (Array.isArray(tournamentData) && tournamentData.length > 0) {
          setLatestTournament(tournamentData[0]);
        }
      } catch (error) {
        console.error("Backend connection failure:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const mainPlayerNames = [
    "bruce wayne",
    "maithani ashraya",
    "ansh!",
    "sagar pathak",
    "deepak kothiyal",
    "akshit bisht",
  ];

  const mainPlayersListSorted = mainPlayerNames
    .map((name) => players.find((p) => p.name?.toLowerCase() === name))
    .filter(Boolean);

  const teamMembersList = players.filter(
    (p) => !mainPlayerNames.includes(p.name?.toLowerCase()),
  );

  return (
    <div className="relative pb-0 overflow-x-hidden bg-[#050505] selection:bg-primary selection:text-white">
      <Navbar />

      {/* Cinematic Background Layering */}
      <div className="fixed inset-0 -z-50">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#ef233c,transparent_60%)] opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_120%,#ff0000,transparent_50%)] opacity-10"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      </div>

      <Hero />

      {/* Stats Header */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 mb-12 md:mb-20 relative z-10">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-1.5 h-12 bg-primary/80" />
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none mb-1">
              Team <span className="text-primary not-italic">Overview</span>
            </h2>
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em]">
              Live Performance Dashboard
            </span>
          </div>
        </div>

        {/* Live Link Tactical Bridge */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <a
            href="https://cricheroes.com/team-profile/11183415/daitya-legion"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block"
          >
            <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="glass-panel p-6 md:p-8 border-red-500/20 bg-[#0a0b10] flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 relative overflow-hidden text-center lg:text-left group-hover:border-primary/60">
              <div className="absolute top-0 right-0 p-4">
                <Monitor className="w-4 h-4 text-gray-800" />
              </div>

              <div className="flex items-center gap-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-10"></div>
                  <div className="w-16 h-16 rounded-full border-2 border-primary/40 flex items-center justify-center bg-black relative z-10">
                    <Activity className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-sm">
                      Live
                    </span>
                    <span className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">
                      Updated Match Stats
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-white italic tracking-tighter uppercase">
                    CRICHEROES{" "}
                    <span className="text-primary not-italic tracking-[0.1em]">
                      LIVE FEED
                    </span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-6 px-10 py-5 bg-primary text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-black hover:text-primary border border-primary transition-all shadow-[0_0_40px_rgba(239,35,60,0.3)]">
                View on CricHeroes
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </a>
        </motion.div>

        {/* Command Center Stats Hub */}
        {teamStats && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-40 relative"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3 md:gap-5">
                <div className="w-1 h-3 md:h-5 bg-primary" />
                <h3 className="text-xl md:text-3xl font-black text-white italic tracking-tighter uppercase transition-colors cursor-default">
                  Season Stats
                </h3>
              </div>
              {teamStats.best_win && (
                teamStats.best_win_url ? (
                  <a
                    href={teamStats.best_win_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden lg:flex items-center gap-5 glass-panel px-6 py-3 border-primary/20 bg-primary/5 hover:border-primary/60 hover:bg-primary/10 transition-all cursor-pointer group"
                  >
                    <Trophy className="w-5 h-5 text-primary" />
                    <div>
                      <span className="text-[7px] font-black uppercase text-gray-600 tracking-widest block mb-1">
                        Best Win
                      </span>
                      <span className="text-sm font-black text-white tracking-tighter italic uppercase">
                        "{teamStats.best_win}"
                      </span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-primary/60 group-hover:text-primary transition-colors" />
                  </a>
                ) : (
                  <div className="hidden lg:flex items-center gap-5 glass-panel px-6 py-3 border-primary/20 bg-primary/5">
                    <Trophy className="w-5 h-5 text-primary" />
                    <div>
                      <span className="text-[7px] font-black uppercase text-gray-600 tracking-widest block mb-1">
                        Best Win
                      </span>
                      <span className="text-sm font-black text-white tracking-tighter italic uppercase">
                        "{teamStats.best_win}"
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
              <Counter
                value={teamStats.total_matches}
                title="Matches"
                icon={Activity}
              />
              <Counter
                value={teamStats.total_runs}
                title="Total Runs"
                icon={Zap}
              />
              <Counter
                value={teamStats.total_wickets}
                title="Wickets"
                icon={Target}
              />
              <Counter
                value={teamStats.win_percentage?.replace("%", "") || 50}
                title="Win Rate %"
                icon={Shield}
              />
              <Counter
                value={teamStats.total_tournaments || 5}
                title="Tournaments"
                icon={Monitor}
              />
              <Counter
                value={players.length}
                title="Players"
                icon={Crosshair}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="glass-panel p-6 md:p-10 flex flex-col md:flex-row items-center gap-4 md:gap-8 bg-[#0a0b10] text-center md:text-left border-white/5 group hover:border-primary/40">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-sm bg-primary/5 flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform duration-500 shrink-0">
                  <Zap className="text-primary w-10 h-10 glow-text-primary" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] mb-2">
                    🏏 Top Scorer
                  </h4>
                  <p className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-primary transition-colors block">
                    {teamStats.topScorer?.name || "---"}
                  </p>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mt-2">
                    {teamStats.topScorer?.runs || 0} Runs
                  </span>
                </div>
              </div>
              <div className="glass-panel p-6 md:p-10 flex flex-col md:flex-row items-center gap-4 md:gap-8 bg-[#0a0b10] text-center md:text-left border-white/5 group hover:border-red-900/40">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-sm bg-red-950/20 flex items-center justify-center border border-red-900/40 group-hover:scale-105 transition-transform duration-500 shrink-0">
                  <Target className="text-red-700 w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] mb-2">
                    🎯 Top Wicket-Taker
                  </h4>
                  <p className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-red-700 transition-colors block">
                    {teamStats.topWicketer?.name || "---"}
                  </p>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mt-2">
                    {teamStats.topWicketer?.wickets || 0} Wickets
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TOURNAMENT TEASER ─────────────────────────────────────────────── */}
        {latestTournament && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-40 relative"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3 md:gap-5">
                <div className="w-1 h-3 md:h-5 bg-primary" />
                <h3 className="text-xl md:text-3xl font-black text-white italic tracking-tighter uppercase">
                  Tournament <span className="text-primary not-italic">Arena</span>
                </h3>
              </div>
              <Link
                to="/tournaments"
                className="hidden md:flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-600 hover:text-primary transition-colors group"
              >
                View All Tournaments
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Featured Tournament Card */}
            <div className="relative border border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-transparent overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/50 to-transparent" />
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

              <div className="p-6 md:p-10 lg:p-14 relative z-10">
                {/* Status + Tournament name */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-[8px] font-black uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    {latestTournament.status === 'ongoing' ? 'Ongoing Tournament' : 'Recent Tournament'}
                  </span>
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                    {latestTournament.name} · {latestTournament.type} · {latestTournament.year}
                  </span>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
                  {/* Match info */}
                  {latestTournament.matches?.length > 0 ? (
                    (() => {
                      const match = latestTournament.matches[latestTournament.matches.length - 1]; // Get latest match
                      return (
                        <div>
                          <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">
                             LATEST BATTLE · {match.date}
                          </p>
                          <h4 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">
                            vs {match.opponent}
                          </h4>
                          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-8">
                            {match.ground}, {match.city}
                          </p>

                          {/* Score */}
                          <div className="flex items-center gap-6 p-5 bg-black/40 border border-white/5 mb-6">
                            <div>
                              <p className="text-[8px] text-gray-700 font-black uppercase tracking-widest mb-1">Daitya Legion</p>
                              <p className="text-3xl font-black text-white italic tracking-tighter">{match.our_score || match.my_score}</p>
                              <p className="text-[8px] text-gray-700 font-black mt-0.5">({match.our_overs || match.my_overs} Ov)</p>
                            </div>
                            <div className="text-gray-800 font-black">VS</div>
                            <div>
                              <p className="text-[8px] text-gray-700 font-black uppercase tracking-widest mb-1">{match.opponent}</p>
                              <p className="text-3xl font-black text-gray-400 italic tracking-tighter">{match.opp_score}</p>
                              <p className="text-[8px] text-gray-700 font-black mt-0.5">({match.opp_overs} Ov)</p>
                            </div>
                            <div className="ml-auto">
                              <span className={`px-4 py-2 border text-[9px] font-black uppercase tracking-widest ${
                                match.result?.toLowerCase().includes('won') ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-500'
                              }`}>
                                {match.result?.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Highlights */}
                          {match.highlights && (
                            <p className="text-[10px] text-gray-400 font-bold leading-relaxed border-l-2 border-primary/30 pl-3 italic mb-8 max-w-md">
                              "{match.highlights}"
                            </p>
                          )}

                          <div className="flex flex-wrap gap-3">
                            {match.cricheroes_url && (
                              <a
                                href={match.cricheroes_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-5 py-3 border border-primary/30 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                              >
                                Full Scorecard <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <Link
                              to="/tournaments"
                              className="flex items-center gap-2 px-5 py-3 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                            >
                              Tournament History <Medal className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex flex-col items-center justify-center p-10 border border-white/5 bg-black/20">
                      <Trophy className="w-12 h-12 text-gray-800 mb-4" />
                      <p className="text-gray-600 font-black uppercase tracking-widest text-[9px]">
                        No match records found for this tournament
                      </p>
                    </div>
                  )}

                  {/* Star Performers Grid */}
                  <div>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-5 flex items-center gap-2">
                       Stats & Performances
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-white/2 border border-white/5">
                        <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mb-1">Matches</p>
                        <p className="text-2xl font-black text-white italic">{latestTournament.matches_played}</p>
                      </div>
                      <div className="p-5 bg-green-500/5 border border-green-500/10">
                        <p className="text-[8px] font-black text-green-900 uppercase tracking-widest mb-1">Wins</p>
                        <p className="text-2xl font-black text-green-400 italic">{latestTournament.wins}</p>
                      </div>
                      <div className="p-5 bg-red-500/5 border border-red-500/10">
                        <p className="text-[8px] font-black text-red-900 uppercase tracking-widest mb-1">Losses</p>
                        <p className="text-2xl font-black text-red-700 italic">{latestTournament.losses}</p>
                      </div>
                      <div className="p-5 bg-primary/5 border border-primary/10">
                        <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest mb-1">Rank/Result</p>
                        <p className="text-xl font-black text-primary italic uppercase truncate">{latestTournament.result || 'TBD'}</p>
                      </div>
                    </div>

                    {latestTournament.cricheroes_url && (
                      <a
                        href={latestTournament.cricheroes_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 flex items-center gap-3 p-4 bg-black/40 border border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest hover:text-primary hover:border-primary/20 transition-all group"
                      >
                         View Full Tournament on CricHeroes
                        <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Squad Grid */}
        <div className="flex flex-col items-center mb-12 md:mb-24 text-center px-4">
          <div className="h-px w-32 bg-primary/20 mb-8" />
          <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[12rem] font-black mb-6 text-white glow-text-primary tracking-tighter leading-none italic uppercase">
            SQUAD{" "}
            <span className="text-primary not-italic tracking-[0.2em]">
              PROFILES
            </span>
          </h2>
          <p className="text-gray-700 font-bold uppercase tracking-[0.5em] text-xs">
            Daitya Legion — Full Player Roster
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-20 h-20 border-4 border-primary/5 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-10 text-gray-800 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
              Establishing Scrambled Neural Link...
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-10 text-center w-full mt-4">
              <h3 className="text-xl sm:text-3xl font-black mb-2 text-white glow-text-primary tracking-tighter italic uppercase">
                Main Players of the Team
              </h3>
              <div className="h-px w-24 bg-primary/40 mb-8" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12 justify-items-center mb-24">
              {mainPlayersListSorted.map((player, idx) => (
                <PlayerCard key={player.external_id || player._id || `main-${idx}`} player={player} />
              ))}
            </div>

            <div className="flex flex-col items-center mb-10 text-center w-full pt-16 border-t border-white/5">
              <h3 className="text-xl sm:text-3xl font-black mb-2 text-white glow-text-primary tracking-tighter italic uppercase">
                Team Members
              </h3>
              <div className="h-px w-24 bg-primary/40 mb-8" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12 justify-items-center mb-40">
              {teamMembersList.map((player, idx) => (
                <PlayerCard key={player.external_id || player._id || `member-${idx}`} player={player} />
              ))}
            </div>
          </>
        )}
      </div>

      {!loading && (
        <>
          <CaptainSection
            captain={
              players.find((p) => p.name?.toLowerCase().includes("bruce")) ||
              players[0]
            }
          />
          <ViceCaptainSection
            vc={
              players.find((p) => p.name?.toLowerCase().includes("ashraya")) ||
              players[1] ||
              players[0]
            }
          />
        </>
      )}

      <Footer />
    </div>
  );
};

export default Home;
