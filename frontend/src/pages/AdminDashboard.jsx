import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crop,
  Edit3,
  ExternalLink,
  Lightbulb,
  LogOut,
  MapPin,
  Minus,
  Plus,
  RefreshCcw,
  Shield,
  Star,
  Trash2,
  Trophy,
  Upload,
  Users,
  X,
  Zap
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import PlayerCard from "../components/PlayerCard.jsx";

/* ─────────────────────────────────────────────
   IMAGE CROPPER MODAL
───────────────────────────────────────────── */
const ImageCropperModal = ({ imageSrc, onCancel, onCrop }) => {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const CROP_SIZE = 320;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    
    // Create a circular clipping path or just a clean square for now
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, CROP_SIZE, CROP_SIZE);
    
    const iw = img.naturalWidth * zoom;
    const ih = img.naturalHeight * zoom;
    ctx.drawImage(img, offset.x, offset.y, iw, ih);
    
    // Optional: Add a subtle vignette or scanlines on top of the preview
  }, [zoom, offset]);

  useEffect(() => { draw(); }, [draw]);

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const handleMouseUp = () => setDragging(false);
  
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { x: t.clientX - offset.x, y: t.clientY - offset.y };
  };
  const handleTouchMove = (e) => {
    if (!dragging || !e.touches[0]) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.current.x, y: t.clientY - dragStart.current.y });
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const file = new File([blob], 'cropped_player.jpg', { type: 'image/jpeg' });
      onCrop(file, URL.createObjectURL(blob));
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/98 backdrop-blur-2xl p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#0a0b10] border border-white/5 p-8 flex flex-col items-center gap-8 max-w-lg w-full relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        
        <div className="flex items-center gap-4 self-start">
          <div className="w-1 h-12 bg-primary shadow-[0_0_15px_rgba(239,35,60,0.5)]" />
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">
              Tactical <span className="text-primary not-italic">Crop</span>
            </h3>
            <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em] mt-1 italic">
              Positioning System Active
            </p>
          </div>
        </div>

        {/* Viewport Container */}
        <div className="relative p-1 bg-white/5 border border-white/10 group">
          <div
            className="relative overflow-hidden cursor-grab active:cursor-grabbing bg-black select-none"
            style={{ width: CROP_SIZE, height: CROP_SIZE }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            onWheel={(e) => {
              e.preventDefault();
              setZoom(z => Math.max(0.2, Math.min(5, z - e.deltaY * 0.001)));
            }}
          >
            <canvas ref={canvasRef} width={CROP_SIZE} height={CROP_SIZE} className="block" />
            
            {/* Visual Overlays */}
            <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-full h-[1px] bg-primary/10" />
              <div className="h-full w-[1px] bg-primary/10 absolute" />
            </div>
            
            {/* Corner Brackets */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary/40" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary/40" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary/40" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary/40" />
            
            {/* Instructions Overlay */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/10 pointer-events-none">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">
                {Math.round(zoom * 100)}% MAGNIFICATION
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full space-y-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setZoom(z => Math.max(0.2, z - 0.2))}
              className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/40 transition-all text-gray-400 hover:text-white"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 space-y-2">
              <input
                type="range" min="0.2" max="5" step="0.01"
                value={zoom}
                onChange={e => setZoom(parseFloat(e.target.value))}
                className="w-full accent-primary h-1 bg-white/10 rounded-full cursor-pointer appearance-none"
              />
            </div>
            <button 
              onClick={() => setZoom(z => Math.min(5, z + 0.2))}
              className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/40 transition-all text-gray-400 hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={onCancel}
              className="py-4 border border-white/5 bg-black hover:bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] transition-all"
            >
              ABORT
            </button>
            <button 
              onClick={handleReset}
              className="py-4 border border-white/5 bg-black hover:bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] transition-all"
            >
              RESET
            </button>
            <button 
              onClick={handleApply}
              className="py-4 bg-primary/10 border border-primary/40 text-primary hover:bg-primary hover:text-white text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(239,35,60,0.1)]"
            >
              <Crop className="w-4 h-4" /> COMMIT
            </button>
          </div>
        </div>

        {/* Hidden img for drawing */}
        <img 
          ref={imgRef} 
          src={imageSrc} 
          className="hidden" 
          onLoad={draw} 
          alt="crop source" 
          crossOrigin="anonymous" 
        />
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MATCH LOG TAB
───────────────────────────────────────────── */
const MatchLogTab = ({ players, API_BASE_URL, token }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [expandedMatch, setExpandedMatch] = useState(null);

  const defaultPerf = (p) => ({
    player_id: p._id,
    player_name: p.name,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    how_out: "DNB",
    wickets: 0,
    overs_bowled: "0",
    runs_conceded: 0,
    economy: 0,
    catches: 0,
    run_outs: 0,
    mvp_points: 0,
  });

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    opponent: "",
    ground: "",
    city: "",
    match_type: "T20",
    our_score: "",
    opp_score: "",
    our_overs: "20",
    opp_overs: "20",
    toss: "",
    result: "won",
    insights: "",
    highlights: "",
    cricheroes_url: "",
    player_performances: players.map(defaultPerf),
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  // Re-seed performances when players list loads
  useEffect(() => {
    setForm((f) => ({
      ...f,
      player_performances: players.map((p) => {
        const existing = f.player_performances.find(
          (x) => x.player_id === p._id,
        );
        return existing || defaultPerf(p);
      }),
    }));
  }, [players]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/matches`);
      const data = await res.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePerfChange = (playerId, field, value) => {
    setForm((f) => ({
      ...f,
      player_performances: f.player_performances.map((p) =>
        p.player_id === playerId ? { ...p, [field]: value } : p,
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSyncStatus("syncing");
    try {
      const res = await fetch(`${API_BASE_URL}/api/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const saved = await res.json();
        setMatches((prev) => [saved, ...prev]);
        setSyncStatus("success");
        setIsFormOpen(false);
      } else {
        setSyncStatus("error");
      }
    } catch {
      setSyncStatus("error");
    } finally {
      setTimeout(() => setSyncStatus("idle"), 2000);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this match record? This won't revert player stats.",
      )
    )
      return;
    try {
      await fetch(`${API_BASE_URL}/api/matches/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatches((prev) => prev.filter((m) => m._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
            Match <span className="text-primary not-italic">Log</span>
          </h2>
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em] mt-1">
            Record match performances & insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {syncStatus !== "idle" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm border text-[9px] font-black uppercase tracking-widest ${
                  syncStatus === "syncing"
                    ? "border-primary/20 bg-primary/5 text-primary"
                    : syncStatus === "success"
                      ? "border-green-500/20 bg-green-500/5 text-green-500"
                      : "border-red-500/20 bg-red-500/5 text-red-500"
                }`}
              >
                {syncStatus === "syncing" && (
                  <RefreshCcw className="w-3 h-3 animate-spin" />
                )}
                {syncStatus === "success" && (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                {syncStatus === "error" && <AlertCircle className="w-3 h-3" />}
                {syncStatus}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-3 px-6 py-4 bg-primary text-white text-xs font-black uppercase tracking-[0.4em] hover:bg-black hover:text-primary border border-primary transition-all shadow-[0_0_30px_rgba(239,35,60,0.3)]"
          >
            Log Match <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Match List */}
      {loading ? (
        <div className="flex items-center justify-center py-32 opacity-30">
          <RefreshCcw className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-20">
          <Trophy className="w-20 h-20 text-primary mb-6" />
          <p className="text-sm font-black uppercase tracking-widest">
            No matches logged yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((m) => (
            <div
              key={m._id}
              className="border border-white/5 bg-[#0a0b10] overflow-hidden"
            >
              {/* Match Header Row */}
              <div
                className="flex items-center gap-4 p-5 cursor-pointer group"
                onClick={() =>
                  setExpandedMatch(expandedMatch === m._id ? null : m._id)
                }
              >
                <div
                  className={`w-2 h-12 flex-shrink-0 ${m.result === "won" ? "bg-green-500" : m.result === "lost" ? "bg-primary" : "bg-gray-700"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black italic uppercase tracking-tighter text-lg leading-none">
                    vs {m.opponent}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {m.date}
                    </span>
                    {m.ground && (
                      <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {m.ground}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-sm ${m.result === "won" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-primary/10 text-primary border border-primary/20"}`}
                    >
                      {m.result === "won"
                        ? "🏏 WON"
                        : m.result === "lost"
                          ? "LOST"
                          : "NO RESULT"}
                    </span>
                  </div>
                </div>
                <div className="hidden md:flex flex-col items-end mx-4">
                  <p className="text-white font-black italic text-xl">
                    {m.our_score}
                  </p>
                  <p className="text-gray-700 text-xs font-bold">
                    vs {m.opp_score}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(m._id);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-primary transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expandedMatch === m._id ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedMatch === m._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-6 space-y-6 border-t border-white/5">
                      {/* Insights */}
                      {m.insights && (
                        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-primary" />
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                              Post-Match Insights
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {m.insights}
                          </p>
                        </div>
                      )}
                      {m.highlights && (
                        <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-green-500" />
                            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">
                              Highlights
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {m.highlights}
                          </p>
                        </div>
                      )}
                      {/* Player Performances Table */}
                      {m.player_performances?.length > 0 && (
                        <div>
                          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3">
                            Player Performances
                          </p>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-white/5 text-gray-600 font-black uppercase tracking-widest text-[8px]">
                                  <th className="text-left py-2 pr-4">
                                    Player
                                  </th>
                                  <th className="text-center px-2">Runs</th>
                                  <th className="text-center px-2">Balls</th>
                                  <th className="text-center px-2">4s</th>
                                  <th className="text-center px-2">6s</th>
                                  <th className="text-center px-2">
                                    Dismissal
                                  </th>
                                  <th className="text-center px-2">Wkts</th>
                                  <th className="text-center px-2">Ovrs</th>
                                  <th className="text-center px-2">Runs Gvn</th>
                                  <th className="text-center px-2">Ctch</th>
                                  <th className="text-center px-2 text-yellow-500">
                                    MVP
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {m.player_performances.map((p, i) => (
                                  <tr
                                    key={i}
                                    className="border-b border-white/5 hover:bg-white/2 transition-colors"
                                  >
                                    <td className="py-2 pr-4 font-black text-white uppercase tracking-tight whitespace-nowrap">
                                      {p.player_name}
                                    </td>
                                    <td className="text-center px-2 text-white font-bold">
                                      {p.runs}
                                    </td>
                                    <td className="text-center px-2 text-gray-600">
                                      {p.balls}
                                    </td>
                                    <td className="text-center px-2 text-blue-400">
                                      {p.fours}
                                    </td>
                                    <td className="text-center px-2 text-purple-400">
                                      {p.sixes}
                                    </td>
                                    <td className="text-center px-2 text-gray-500 text-[9px]">
                                      {p.how_out}
                                    </td>
                                    <td className="text-center px-2 text-primary font-bold">
                                      {p.wickets}
                                    </td>
                                    <td className="text-center px-2 text-gray-500">
                                      {p.overs_bowled}
                                    </td>
                                    <td className="text-center px-2 text-gray-500">
                                      {p.runs_conceded}
                                    </td>
                                    <td className="text-center px-2 text-gray-500">
                                      {p.catches}
                                    </td>
                                    <td className="text-center px-2 text-yellow-400 font-black">
                                      {p.mvp_points}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Match Entry Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 overflow-y-auto bg-black/95 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="w-full max-w-5xl bg-[#08090d] border border-white/5 my-8 relative"
            >
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/5 hover:bg-primary flex items-center justify-center rounded-sm transition-all"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>

              <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
                {/* Title */}
                <div className="flex items-center gap-4">
                  <div className="w-1 h-10 bg-primary" />
                  <div>
                    <h3 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase">
                      Log{" "}
                      <span className="text-primary not-italic">
                        Today's Match
                      </span>
                    </h3>
                    <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.5em] mt-1">
                      Enter match details and player performances
                    </p>
                  </div>
                </div>

                {/* Match Details */}
                <div className="space-y-4">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em] border-b border-white/5 pb-2">
                    Match Details
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: "Date", name: "date", type: "date" },
                      {
                        label: "Opponent",
                        name: "opponent",
                        type: "text",
                        ph: "e.g. Thunder XI",
                      },
                      {
                        label: "Ground / Venue",
                        name: "ground",
                        type: "text",
                        ph: "e.g. DY Patil Ground",
                      },
                      {
                        label: "City",
                        name: "city",
                        type: "text",
                        ph: "e.g. Mumbai",
                      },
                      {
                        label: "Match Type",
                        name: "match_type",
                        type: "select",
                        opts: ["T20", "ODI", "T10", "100-Ball"],
                      },
                      {
                        label: "Toss",
                        name: "toss",
                        type: "text",
                        ph: "e.g. Daitya Legion won toss, elected to bat",
                      },
                    ].map((f) => (
                      <div key={f.name} className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">
                          {f.label}
                        </label>
                        {f.type === "select" ? (
                          <select
                            name={f.name}
                            value={form[f.name]}
                            onChange={(e) =>
                              setForm({ ...form, [f.name]: e.target.value })
                            }
                            className="w-full bg-black border border-white/10 py-3 px-4 text-white text-xs font-bold uppercase focus:border-primary/50 outline-none appearance-none"
                          >
                            {f.opts.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={f.type}
                            name={f.name}
                            value={form[f.name]}
                            placeholder={f.ph}
                            onChange={(e) =>
                              setForm({ ...form, [f.name]: e.target.value })
                            }
                            className="w-full bg-black border border-white/10 py-3 px-4 text-white text-xs font-bold focus:border-primary/50 outline-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Our Score",
                        name: "our_score",
                        ph: "e.g. 153/6",
                      },
                      {
                        label: "Their Score",
                        name: "opp_score",
                        ph: "e.g. 138/9",
                      },
                      { label: "Our Overs", name: "our_overs", ph: "e.g. 20" },
                      {
                        label: "Their Overs",
                        name: "opp_overs",
                        ph: "e.g. 18.4",
                      },
                    ].map((f) => (
                      <div key={f.name} className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">
                          {f.label}
                        </label>
                        <input
                          name={f.name}
                          value={form[f.name]}
                          placeholder={f.ph}
                          onChange={(e) =>
                            setForm({ ...form, [f.name]: e.target.value })
                          }
                          className="w-full bg-black border border-white/10 py-3 px-4 text-white text-xs font-bold focus:border-primary/50 outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    {["won", "lost", "no_result"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm({ ...form, result: r })}
                        className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${
                          form.result === r
                            ? r === "won"
                              ? "bg-green-500/20 border-green-500 text-green-400"
                              : r === "lost"
                                ? "bg-primary/20 border-primary text-primary"
                                : "bg-gray-700/20 border-gray-600 text-gray-400"
                            : "border-white/10 text-gray-600 hover:border-white/30"
                        }`}
                      >
                        {r === "won"
                          ? "🏏 Won"
                          : r === "lost"
                            ? "Lost"
                            : "No Result"}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">
                      CricHeroes Match URL (optional)
                    </label>
                    <input
                      name="cricheroes_url"
                      value={form.cricheroes_url}
                      placeholder="https://cricheroes.com/..."
                      onChange={(e) =>
                        setForm({ ...form, cricheroes_url: e.target.value })
                      }
                      className="w-full bg-black border border-white/10 py-3 px-4 text-white text-xs font-bold focus:border-primary/50 outline-none"
                    />
                  </div>
                </div>

                {/* Insights */}
                <div className="space-y-4">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em] border-b border-white/5 pb-2">
                    Post-Match Analysis
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Lightbulb className="w-3 h-3 text-primary" /> What We
                        Should've Done Differently
                      </label>
                      <textarea
                        name="insights"
                        value={form.insights}
                        rows={4}
                        placeholder="Areas of improvement, missed opportunities, tactical mistakes..."
                        onChange={(e) =>
                          setForm({ ...form, insights: e.target.value })
                        }
                        className="w-full bg-black border border-white/10 py-3 px-4 text-white text-xs font-medium focus:border-primary/50 outline-none resize-none leading-relaxed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Star className="w-3 h-3 text-green-500" /> Highlights /
                        What Went Well
                      </label>
                      <textarea
                        name="highlights"
                        value={form.highlights}
                        rows={4}
                        placeholder="Key contributions, winning moments, great performances..."
                        onChange={(e) =>
                          setForm({ ...form, highlights: e.target.value })
                        }
                        className="w-full bg-black border border-white/10 py-3 px-4 text-white text-xs font-medium focus:border-primary/50 outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* Player Performances */}
                <div className="space-y-4">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em] border-b border-white/5 pb-2">
                    Player Performances
                  </p>
                  <p className="text-[9px] text-gray-700">
                    Fill in each player's stats. Leave 0 / DNB if they didn't
                    bat/bowl.
                  </p>
                  <div className="space-y-3">
                    {form.player_performances.map((perf) => {
                      const player = players.find(
                        (p) => p._id === perf.player_id,
                      );
                      return (
                        <div
                          key={perf.player_id}
                          className="bg-black/40 border border-white/5 p-4 rounded-sm"
                        >
                          <p className="text-xs font-black text-white uppercase italic tracking-tight mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            {perf.player_name}
                            {player?.role && (
                              <span className="text-[8px] text-gray-700 not-italic font-bold tracking-widest normal-case">
                                ({player.role})
                              </span>
                            )}
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-11 gap-2">
                            {[
                              { label: "Runs", field: "runs", type: "number" },
                              {
                                label: "Balls",
                                field: "balls",
                                type: "number",
                              },
                              { label: "4s", field: "fours", type: "number" },
                              { label: "6s", field: "sixes", type: "number" },
                              {
                                label: "Dismissal",
                                field: "how_out",
                                type: "text",
                                ph: "Caught/Bowled/Not Out/DNB",
                              },
                              {
                                label: "Wickets",
                                field: "wickets",
                                type: "number",
                              },
                              {
                                label: "Overs",
                                field: "overs_bowled",
                                type: "text",
                                ph: "0",
                              },
                              {
                                label: "Runs Given",
                                field: "runs_conceded",
                                type: "number",
                              },
                              {
                                label: "Catches",
                                field: "catches",
                                type: "number",
                              },
                              {
                                label: "Run Outs",
                                field: "run_outs",
                                type: "number",
                              },
                              {
                                label: "MVP (0-10)",
                                field: "mvp_points",
                                type: "number",
                              },
                            ].map((f) => (
                              <div key={f.field} className="space-y-1">
                                <label className="text-[7px] font-black text-gray-700 uppercase tracking-widest block">
                                  {f.label}
                                </label>
                                <input
                                  type={f.type}
                                  value={perf[f.field]}
                                  placeholder={f.ph || "0"}
                                  min={f.type === "number" ? 0 : undefined}
                                  max={
                                    f.field === "mvp_points" ? 10 : undefined
                                  }
                                  onChange={(e) =>
                                    handlePerfChange(
                                      perf.player_id,
                                      f.field,
                                      f.type === "number"
                                        ? Number(e.target.value)
                                        : e.target.value,
                                    )
                                  }
                                  className={`w-full bg-black border py-2 px-2 text-white text-xs font-bold focus:outline-none transition-all text-center ${
                                    f.field === "mvp_points"
                                      ? "border-yellow-800/40 focus:border-yellow-500"
                                      : f.field === "runs" ||
                                          f.field === "balls"
                                        ? "border-white/10 focus:border-primary/50"
                                        : f.field === "wickets"
                                          ? "border-primary/20 focus:border-primary"
                                          : "border-white/10 focus:border-white/30"
                                  }`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={syncStatus === "syncing"}
                  className="w-full py-5 bg-primary text-white text-xs font-black uppercase tracking-[0.8em] shadow-[0_0_40px_rgba(239,35,60,0.3)] hover:bg-black hover:text-primary border border-primary transition-all flex items-center justify-center gap-3"
                >
                  {syncStatus === "syncing" ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trophy className="w-4 h-4" />
                  )}
                  Save Match & Update Player Stats
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────────
   BEST WIN SETTINGS
───────────────────────────────────────────── */
const BestWinSettings = ({ token, API_BASE_URL }) => {
  const [team, setTeam] = useState({ best_win: "", best_win_url: "" });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/team`);
      const data = await res.json();
      setTeam({
        best_win: data.best_win || "",
        best_win_url: data.best_win_url || ""
      });
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus("saving");
    try {
      const res = await fetch(`${API_BASE_URL}/api/team`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(team)
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (e) {
      console.error(e);
      setStatus("error");
    } finally {
      setSaving(false);
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="mt-12 pt-10 border-t border-white/5">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-1 h-8 bg-primary shadow-[0_0_15px_rgba(239,35,60,0.5)]" />
        <div>
          <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">
            Team <span className="text-primary not-italic">Settings</span>
          </h3>
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mt-1">
            Global Tactical Configuration
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">
              Best Win Description
            </label>
            <input
              value={team.best_win}
              placeholder="e.g. Defeated Bakery 11 in a thriller"
              onChange={(e) => setTeam({ ...team, best_win: e.target.value })}
              className="w-full bg-black border border-white/10 py-4 px-5 text-white text-sm font-bold tracking-widest focus:border-primary/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">
              Best Win URL (CricHeroes)
            </label>
            <div className="relative">
              <input
                value={team.best_win_url}
                placeholder="https://cricheroes.com/match-details/..."
                onChange={(e) => setTeam({ ...team, best_win_url: e.target.value })}
                className="w-full bg-black border border-white/10 py-4 px-5 text-white text-xs font-bold focus:border-primary/50 outline-none transition-all"
              />
              {team.best_win_url && (
                <a 
                  href={team.best_win_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`mt-10 px-10 py-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 border ${
          status === "success" 
            ? "bg-green-500/10 border-green-500 text-green-500" 
            : status === "error"
            ? "bg-red-500/10 border-red-500 text-red-500"
            : "bg-primary border-primary text-white hover:bg-black hover:text-primary"
        }`}
      >
        {status === "saving" ? (
          <RefreshCcw className="w-4 h-4 animate-spin" />
        ) : status === "success" ? (
          <Check className="w-4 h-4" />
        ) : status === "error" ? (
          <X className="w-4 h-4" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {status === "saving" ? "Updating..." : status === "success" ? "System Updated" : status === "error" ? "Update Failed" : "Update Team Settings"}
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN ADMIN DASHBOARD
───────────────────────────────────────────── */
const AdminDashboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("players");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [bulkSyncing, setBulkSyncing] = useState(false);
  const [bulkSyncMsg, setBulkSyncMsg] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    role: "Batsman",
    matches: 0,
    runs: 0,
    wickets: 0,
    external_id: "",
    titles: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [cropSource, setCropSource] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const [matches, setMatches] = useState([]);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : "";

  const navigate = useNavigate();

  useEffect(() => {
    const t = localStorage.getItem("adminToken");
    if (!t) navigate("/admin/login");
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/players`);
      const data = await res.json();
      setPlayers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch players error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "name" || name === "role" || name === "external_id"
          ? value
          : Number(value),
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCropSource(url);
      setShowCropper(true);
    }
  };

  const handleCropDone = (croppedFile, croppedUrl) => {
    setImageFile(croppedFile);
    setPreviewUrl(croppedUrl);
    setShowCropper(false);
    setCropSource(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "Batsman",
      matches: 0,
      runs: 0,
      wickets: 0,
      external_id: "",
      titles: "",
    });
    setImageFile(null);
    setPreviewUrl("");
    setCropSource(null);
    setShowCropper(false);
    setEditingPlayer(null);
    setIsFormOpen(false);
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      role: player.role,
      matches: player.matches,
      runs: player.runs,
      wickets: player.wickets,
      external_id: player.external_id || "",
      titles: Array.isArray(player.titles) ? player.titles.join(", ") : "",
    });
    setPreviewUrl(
      player.image_url
        ? player.image_url.startsWith("http")
          ? player.image_url
          : `${API_BASE_URL}/${player.image_url}`
        : "",
    );
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this player? This action is irreversible."))
      return;
    setSyncStatus("syncing");
    try {
      const res = await fetch(`${API_BASE_URL}/api/players/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPlayers(players.filter((p) => p._id !== id));
        setSyncStatus("success");
      } else setSyncStatus("error");
    } catch {
      setSyncStatus("error");
    } finally {
      setTimeout(() => setSyncStatus("idle"), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSyncStatus("syncing");

    // Serialize titles: convert comma-separated string → array
    const titlesArr = formData.titles
      ? String(formData.titles).split(",").map(t => t.trim()).filter(Boolean)
      : [];

    let body;
    let headers = { Authorization: `Bearer ${token}` };

    if (imageFile) {
      // Use FormData for image uploads
      const payload = new FormData();
      Object.keys(formData).forEach((k) => {
        if (k === "titles") {
          titlesArr.forEach(t => payload.append("titles[]", t));
        } else {
          payload.append(k, formData[k]);
        }
      });
      payload.append("image", imageFile);
      body = payload;
      // Browser automatically sets multi-part boundary for FormData
    } else {
      // Use JSON for simple data updates (more reliable on Vercel)
      headers["Content-Type"] = "application/json";
      body = JSON.stringify({
        ...formData,
        titles: titlesArr
      });
    }

    try {
      const url = editingPlayer
        ? `${API_BASE_URL}/api/players/${editingPlayer._id}`
        : `${API_BASE_URL}/api/players`;
      
      const res = await fetch(url, {
        method: editingPlayer ? "PUT" : "POST",
        headers,
        body,
      });

      if (res.ok) {
        const saved = await res.json();
        setPlayers(
          editingPlayer
            ? players.map((p) => (p._id === saved._id ? saved : p))
            : [saved, ...players],
        );
        setSyncStatus("success");
        setTimeout(resetForm, 1000);
      } else setSyncStatus("error");
    } catch {
      setSyncStatus("error");
    } finally {
      setTimeout(() => setSyncStatus("idle"), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const tabs = [
    { id: "players", name: "Players", icon: Users },
    { id: "matchlog", name: "Match Log", icon: Activity },
    { id: "stats", name: "Team Stats", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex selection:bg-primary selection:text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#88080808,transparent_80%)]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

      {/* Sidebar */}
      <div className="w-16 md:w-72 bg-black/40 backdrop-blur-3xl border-r border-white/5 flex flex-col z-20 relative flex-shrink-0">
        <div className="p-6 border-b border-white/5 flex flex-col items-center md:items-start">
          <div className="w-10 h-10 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center p-2 mb-3">
            <Shield className="w-full h-full text-primary" />
          </div>
          <div className="hidden md:block">
            <h2 className="text-lg font-black italic tracking-tighter uppercase leading-none">
              Admin <span className="text-primary not-italic">Panel</span>
            </h2>
            <p className="text-[7px] font-black text-gray-500 uppercase tracking-[0.4em] mt-1">
              Daitya Legion Control
            </p>
          </div>
        </div>

        <nav className="flex-1 p-3 md:p-5 space-y-1.5">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 md:p-4 rounded-sm transition-all group ${activeTab === item.id ? "bg-primary/10 border-l-2 border-primary text-white" : "text-gray-500 hover:text-white"}`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? "text-primary" : "group-hover:text-primary transition-colors"}`}
              />
              <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em]">
                {item.name}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="hidden md:flex flex-col mb-6 p-3 bg-primary/5 border border-primary/20 rounded-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                Logged In
              </span>
            </div>
            <span className="text-[9px] font-black text-white uppercase italic tracking-tighter">
              Sagar Pathak
            </span>
            <span className="text-[6px] font-bold text-primary/40 uppercase tracking-[0.4em] mt-0.5">
              Team Admin
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center md:justify-start gap-3 p-3 text-gray-600 hover:text-primary transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.4em]">
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto p-5 md:p-10 z-10 relative">
        <div className="max-w-[1600px] mx-auto">
          {/* Players Tab */}
          {activeTab === "players" && (
            <div>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-white/5 pb-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.6em]">
                      Squad Overview
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                    Players{" "}
                    <span className="text-primary not-italic">Roster</span>
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <AnimatePresence mode="wait">
                    {syncStatus !== "idle" && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-sm border text-[9px] font-black uppercase tracking-widest ${
                          syncStatus === "syncing"
                            ? "border-primary/20 bg-primary/5 text-primary"
                            : syncStatus === "success"
                              ? "border-green-500/20 bg-green-500/5 text-green-500"
                              : "border-red-500/20 bg-red-500/5 text-red-500"
                        }`}
                      >
                        {syncStatus === "syncing" && (
                          <RefreshCcw className="w-3 h-3 animate-spin" />
                        )}
                        {syncStatus === "success" && (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {syncStatus === "error" && (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {syncStatus}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    onClick={async () => {
                      if (bulkSyncing) return;
                      const secret = prompt('Enter admin secret to trigger full CricHeroes sync:');
                      if (!secret) return;
                      setBulkSyncing(true);
                      setBulkSyncMsg('Syncing all players from CricHeroes...');
                      try {
                        const res = await fetch(`${API_BASE_URL}/api/admin/bulk-sync?secret=${encodeURIComponent(secret)}&force=true`);
                        const data = await res.json();
                        if (data.success) {
                          setBulkSyncMsg('Sync started! Refreshing data...');
                          setTimeout(async () => {
                            await fetchPlayers();
                            setBulkSyncMsg('Sync complete!');
                            setTimeout(() => setBulkSyncMsg(''), 3000);
                          }, 5000);
                        } else {
                          setBulkSyncMsg(`Error: ${data.error}`);
                        }
                      } catch (e) {
                        setBulkSyncMsg(`Failed: ${e.message}`);
                      } finally {
                        setBulkSyncing(false);
                        setTimeout(() => setBulkSyncMsg(''), 8000);
                      }
                    }}
                    className={`flex items-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-[0.4em] border transition-all group ${
                      bulkSyncing
                        ? 'bg-primary/20 border-primary/50 text-primary cursor-wait'
                        : 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white'
                    } shadow-[0_0_30px_rgba(34,197,94,0.15)]`}
                  >
                    {bulkSyncing ? (
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                    )}
                    Sync All
                  </button>
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-3 px-6 py-4 bg-primary text-white text-xs font-black uppercase tracking-[0.4em] hover:bg-black hover:text-primary border border-primary transition-all shadow-[0_0_30px_rgba(239,35,60,0.3)] group"
                  >
                    Add Player{" "}
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  </button>
                </div>
                {bulkSyncMsg && (
                  <div className="mt-4 flex items-center gap-2 px-4 py-2 border border-primary/20 bg-primary/5 text-[9px] font-black uppercase tracking-widest text-primary animate-pulse">
                    <RefreshCcw className="w-3 h-3 animate-spin" />
                    {bulkSyncMsg}
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 opacity-30">
                  <RefreshCcw className="w-16 h-16 animate-spin mb-8 text-primary" />
                  <span className="text-lg font-black uppercase tracking-[0.6em] italic">
                    Loading Players...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {players.map((p) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={p._id}
                        className="relative group"
                      >
                        <PlayerCard player={p} />
                        <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-md flex flex-col items-center justify-center p-8 z-50 border border-primary/40 shadow-[inset_0_0_50px_rgba(239,35,60,0.2)]">
                          <h4 className="text-lg font-black italic tracking-tighter uppercase mb-1">
                            {p.name}
                          </h4>
                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6">
                            {p.role} · {p.matches} matches
                          </p>
                          <div className="w-full flex flex-col gap-2">
                            <button
                              onClick={() => handleEdit(p)}
                              className="w-full flex items-center justify-center gap-3 py-3 border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-[0.4em]"
                            >
                              <Edit3 className="w-4 h-4 text-blue-500" /> Edit
                              Player
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="w-full flex items-center justify-center gap-3 py-3 border border-primary/20 bg-primary/5 hover:bg-primary transition-all text-[10px] font-black uppercase tracking-[0.4em] text-primary hover:text-white"
                            >
                              <Trash2 className="w-4 h-4" /> Remove
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* Match Log Tab */}
          {activeTab === "matchlog" && (
            <MatchLogTab
              players={players}
              API_BASE_URL={API_BASE_URL}
              token={token}
            />
          )}

          {/* Team Stats Tab */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none mb-8">
                Team <span className="text-primary not-italic">Stats</span>
              </h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Players",
                    val: players.length,
                    color: "text-white",
                  },
                  {
                    label: "Total Runs",
                    val: players.reduce((s, p) => s + (p.runs || 0), 0),
                    color: "text-primary",
                  },
                  {
                    label: "Total Wickets",
                    val: players.reduce((s, p) => s + (p.wickets || 0), 0),
                    color: "text-red-500",
                  },
                  {
                    label: "MOM Awards",
                    val: players.reduce(
                      (s, p) => s + (p.man_of_the_match || 0),
                      0,
                    ),
                    color: "text-yellow-400",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="p-6 bg-[#0a0b10] border border-white/5 flex flex-col"
                  >
                    <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-3">
                      {s.label}
                    </span>
                    <span className={`text-4xl font-black italic ${s.color}`}>
                      {s.val}
                    </span>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-600 font-black uppercase tracking-widest text-[8px]">
                      {[
                        "Player",
                        "Role",
                        "Matches",
                        "Runs",
                        "Avg",
                        "SR",
                        "Wkts",
                        "Econ",
                        "Catches",
                        "MOM",
                      ].map((h) => (
                        <th key={h} className="text-left py-3 pr-6">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((p) => (
                      <tr
                        key={p._id}
                        className="border-b border-white/5 hover:bg-white/2 transition-colors"
                      >
                        <td className="py-3 pr-6 font-black text-white uppercase tracking-tight whitespace-nowrap">
                          {p.name}
                        </td>
                        <td className="pr-6 text-gray-500">{p.role}</td>
                        <td className="pr-6 text-gray-400">{p.matches}</td>
                        <td className="pr-6 text-primary font-bold">
                          {p.runs}
                        </td>
                        <td className="pr-6 text-gray-400">
                          {p.batting?.average || 0}
                        </td>
                        <td className="pr-6 text-gray-400">
                          {p.batting?.strike_rate || 0}
                        </td>
                        <td className="pr-6 text-red-500 font-bold">
                          {p.wickets}
                        </td>
                        <td className="pr-6 text-gray-400">
                          {p.bowling?.economy || 0}
                        </td>
                        <td className="pr-6 text-gray-400">{p.catches || 0}</td>
                        <td className="pr-6 text-yellow-400 font-bold">
                          {p.man_of_the_match || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <BestWinSettings token={token} API_BASE_URL={API_BASE_URL} />
            </div>
          )}
        </div>
      </main>

      {/* Player Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="max-w-[1100px] w-full bg-black border border-white/5 relative z-10 overflow-hidden flex flex-col lg:flex-row shadow-[0_0_100px_rgba(0,0,0,1)]"
            >
              <button
                onClick={resetForm}
                className="absolute top-5 right-5 z-20 w-10 h-10 bg-white/5 hover:bg-primary transition-all flex items-center justify-center rounded-sm group"
              >
                <X className="w-5 h-5 text-gray-500 group-hover:text-white" />
              </button>

              <div className="flex-1 p-8 md:p-14 border-r border-white/5 bg-[#08090d]">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1 h-10 bg-primary" />
                  <div>
                    <h3 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">
                      {editingPlayer ? "Edit" : "Add"}{" "}
                      <span className="text-primary not-italic">Player</span>
                    </h3>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em] mt-1">
                      Player Profile Entry
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">
                        Player Name
                      </label>
                      <input
                        name="name"
                        className="w-full bg-black border border-white/10 py-4 px-5 text-white text-sm font-bold uppercase tracking-widest focus:border-primary/50 outline-none transition-all"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">
                        Role
                      </label>
                      <select
                        name="role"
                        className="w-full bg-black border border-white/10 py-4 px-5 text-white text-sm font-bold uppercase tracking-widest focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        {[
                          "Batsman",
                          "Bowler",
                          "All-Rounder",
                          "Wicketkeeper",
                        ].map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { label: "Matches Played", name: "matches" },
                      { label: "Runs", name: "runs" },
                      { label: "Wickets", name: "wickets" },
                    ].map((f) => (
                      <div key={f.name} className="space-y-2">
                        <label className="text-[8px] font-black text-gray-700 uppercase tracking-[0.4em]">
                          {f.label}
                        </label>
                        <input
                          name={f.name}
                          type="number"
                          className="w-full bg-black border border-white/10 py-4 px-5 text-white text-sm font-bold tracking-widest focus:border-primary/50 outline-none transition-all"
                          value={formData[f.name]}
                          onChange={handleChange}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">
                      CricHeroes Player ID (Optional)
                    </label>
                    <input
                      name="external_id"
                      className="w-full bg-black border border-white/10 py-4 px-5 text-white text-sm font-bold tracking-widest focus:border-primary/50 outline-none transition-all"
                      value={formData.external_id}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">
                      CricHeroes Titles <span className="text-gray-600 normal-case font-medium tracking-normal">(comma-separated, e.g. Aspirant, Classicist)</span>
                    </label>
                    <input
                      name="titles"
                      value={formData.titles}
                      placeholder="Aspirant, Classicist, Maverick..."
                      onChange={handleChange}
                      className="w-full bg-black border border-amber-900/30 py-4 px-5 text-amber-200 text-sm font-bold tracking-widest focus:border-amber-600/50 outline-none transition-all"
                    />
                    {formData.titles && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {formData.titles.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                          <span key={i} className={`px-2.5 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest ${
                            i === 0
                              ? 'text-amber-100'
                              : 'text-[#b0b8c4] bg-white/[0.06] border border-white/[0.12]'
                          }`} style={i === 0 ? {background: 'linear-gradient(90deg,#78570a,#c9991f,#78570a)'} : {}}>
                            {i === 0 ? '✦ ' : '· '}{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">
                      Player Photo
                    </label>
                    {previewUrl && (
                      <div className="relative mb-3 inline-block">
                        <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover object-top border border-primary/30" />
                        <button
                          type="button"
                          onClick={() => { setCropSource(previewUrl); setShowCropper(true); }}
                          className="absolute bottom-1 right-1 px-2 py-1 bg-black/80 border border-white/20 text-[8px] font-black uppercase tracking-widest text-gray-300 hover:text-primary flex items-center gap-1 transition-colors"
                        >
                          <Crop className="w-2.5 h-2.5" /> Re-crop
                        </button>
                      </div>
                    )}
                    <div className="relative group/upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="border-2 border-dashed border-white/10 py-8 flex flex-col items-center gap-3 group-hover/upload:border-primary/40 transition-all bg-white/[0.02]">
                        <Upload className="w-6 h-6 text-gray-700 group-hover/upload:text-primary transition-colors" />
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">
                          {imageFile ? imageFile.name : "Click to upload photo"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={syncStatus === "syncing"}
                    className={`w-full py-5 text-xs font-black uppercase tracking-[0.8em] shadow-[0_0_40px_rgba(239,35,60,0.3)] border transition-all flex items-center justify-center gap-3 group ${
                      syncStatus === "success"
                        ? "bg-green-500 border-green-500 text-white"
                        : syncStatus === "error"
                        ? "bg-red-500 border-red-500 text-white"
                        : "bg-primary border-primary text-white hover:bg-black hover:text-primary"
                    }`}
                  >
                    {syncStatus === "syncing" ? (
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                    ) : syncStatus === "success" ? (
                      <Check className="w-4 h-4" />
                    ) : syncStatus === "error" ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />
                    )}
                    {syncStatus === "syncing"
                      ? "Synchronizing..."
                      : syncStatus === "success"
                      ? "Success"
                      : syncStatus === "error"
                      ? "Failed"
                      : editingPlayer
                      ? "Save Changes"
                      : "Add Player"}
                  </button>
                </form>
              </div>

              <div className="hidden lg:flex lg:w-80 bg-[#0a0b10] flex-col items-center justify-center p-12 relative">
                <div className="absolute top-8 left-8 text-gray-900 font-black text-[6rem] select-none uppercase tracking-tighter opacity-10 leading-none">
                  LIVE
                </div>
                <div className="relative z-10">
                  <PlayerCard
                    player={{
                      ...formData,
                      image_url:
                        previewUrl ||
                        "https://cricheroes.com/assets/images/team-profile-placeholder.png",
                      is_manual_override: true,
                    }}
                  />
                </div>
                <p className="mt-8 text-[9px] font-black text-gray-700 uppercase tracking-[0.5em] text-center leading-relaxed italic">
                  Live preview of player card
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Cropper Modal */}
      {showCropper && cropSource && (
        <ImageCropperModal
          imageSrc={cropSource}
          onCancel={() => { setShowCropper(false); setCropSource(null); }}
          onCrop={handleCropDone}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
