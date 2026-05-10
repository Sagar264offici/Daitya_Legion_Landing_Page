import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Image as ImageIcon,
  Play,
  Users,
  Video,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";

// ── Media Imports ─────────────────────────────────────────────────────────────
import Photo1 from "../assets/Team Gallery/Photo1.jpeg";
import Photo2 from "../assets/Team Gallery/Photo2.png";
import Shot1  from "../assets/Team Gallery/Shot1.mp4";
import Shot2  from "../assets/Team Gallery/Shot2.mp4";
import Shot3  from "../assets/Team Gallery/Shot3.mp4";

// ── Data ──────────────────────────────────────────────────────────────────────
const TEAM_MOMENTS = [
  { id: "tm1", type: "photo", src: Photo1, label: "🏏",  caption: "The squad mid-game." },
  { id: "tm2", type: "photo", src: Photo2, label: "🏏",  caption: "Full team line-up." },
  { id: "tm3", type: "video", src: Shot3,  label: "🏏",  caption: "Team highlights.", portrait: false },
];

const PLAYER_MOMENTS = [
  { id: "pm1", type: "video", src: Shot1, label: "🏏", caption: "Raw in-game footage.",  portrait: true },
  { id: "pm2", type: "video", src: Shot2, label: "🏏", caption: "Player highlights.",    portrait: true },
];

// ── Light animation variants (no heavy spring/scale combos) ───────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// ── Video player inside lightbox (self-contained ref so it always plays) ──────
function LightboxVideo({ src, muted, onCanPlay }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.load();
    el.play().catch(() => {});
    return () => { el.pause(); };
  }, [src]); // re-runs whenever the src changes (new item)

  return (
    <video
      ref={ref}
      src={src}
      muted={muted}
      loop
      playsInline
      onCanPlay={onCanPlay}
      style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
    />
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ items, activeIndex, onClose, onPrev, onNext }) {
  const item = items[activeIndex];
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const isPortrait = item.type === "video" && item.portrait;

  // Keyboard
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowLeft")  onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, onPrev, onNext]);

  useEffect(() => { setReady(false); }, [activeIndex]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      {/* Backdrop — no backdrop-blur (too GPU-heavy), just dark overlay */}
      <div className="absolute inset-0 bg-black/95" />

      {/* Media */}
      <motion.div
        key={item.id}
        className="relative z-10 flex flex-col items-center px-4"
        style={{ maxWidth: isPortrait ? "380px" : "min(90vw, 960px)", width: "100%" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "photo" ? (
          <img
            src={item.src}
            alt="gallery"
            style={{ maxWidth: "85vw", maxHeight: "75vh", objectFit: "contain", borderRadius: "2px" }}
          />
        ) : (
          <div
            className="relative w-full rounded-sm overflow-hidden bg-black"
            style={{ aspectRatio: isPortrait ? "9/16" : "16/9", maxHeight: "75vh" }}
          >
            <LightboxVideo
              src={item.src}
              muted={muted}
              onCanPlay={() => setReady(true)}
            />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            )}
            <button
              onClick={() => setMuted((m) => !m)}
              className="absolute bottom-3 right-3 p-2 bg-black/70 border border-white/15 rounded-full hover:border-primary/60 transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-primary" />}
            </button>
          </div>
        )}

        {/* Caption */}
        <div className="mt-4 text-center">
          <p className="text-2xl">{item.label}</p>
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-1">{item.caption}</p>
          <p className="text-gray-700 text-[9px] font-black uppercase tracking-[0.35em] mt-2">
            {activeIndex + 1} / {items.length}
          </p>
        </div>
      </motion.div>

      {/* Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-3 md:left-8 z-10 p-3 bg-black/60 border border-white/10 rounded-full hover:border-primary/50 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-3 md:right-8 z-10 p-3 bg-black/60 border border-white/10 rounded-full hover:border-primary/50 transition-colors group"
          >
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
          </button>
        </>
      )}

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2.5 bg-black/60 border border-white/10 rounded-full hover:border-primary/50 transition-colors"
      >
        <X className="w-5 h-5 text-gray-400 hover:text-primary transition-colors" />
      </button>
    </motion.div>
  );
}

// ── Photo Card ────────────────────────────────────────────────────────────────
function PhotoCard({ item, onClick }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      className="relative overflow-hidden cursor-pointer group aspect-[4/3] rounded-sm bg-[#0a0b10] border border-white/5"
      onClick={onClick}
    >
      {!loaded && <div className="absolute inset-0 bg-white/3 animate-pulse" />}
      <img
        src={item.src}
        alt="team photo"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
      <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-250">
        <p className="text-xl">{item.label}</p>
      </div>
      {/* Subtle border glow */}
      <div className="absolute inset-0 border border-transparent group-hover:border-primary/40 transition-colors duration-300 rounded-sm pointer-events-none" />
      {/* Zoom hint */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none">
        <div className="p-3 bg-primary/90 rounded-full shadow-[0_0_20px_rgba(239,35,60,0.4)]">
          <ZoomIn className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

// ── Video Card ────────────────────────────────────────────────────────────────
function VideoCard({ item, onClick }) {
  const vRef    = useRef(null);
  const isPortrait = item.portrait;

  const handleEnter = () => {
    const el = vRef.current;
    if (!el) return;
    if (el.readyState === 0) el.load();
    el.play().catch(() => {});
  };
  const handleLeave = () => {
    const el = vRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  };

  return (
    <motion.div
      variants={fadeUp}
      className="relative overflow-hidden cursor-pointer group rounded-sm bg-[#0a0b10] border border-white/5"
      style={{ aspectRatio: isPortrait ? "9/16" : "16/9" }}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <video
        ref={vRef}
        src={item.src}
        muted
        loop
        playsInline
        preload="none"
        style={{
          width: "100%",
          height: "100%",
          objectFit: isPortrait ? "contain" : "cover",
          background: "#000",
        }}
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

      {/* Play badge */}
      <div className="absolute top-3 left-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/80 border border-primary/30 rounded-sm">
          <Play className="w-2.5 h-2.5 text-primary fill-primary" />
          <span className="text-[8px] font-black text-primary uppercase tracking-widest">Video</span>
        </div>
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-xl">{item.label}</p>
        <p className="text-[9px] text-gray-500 font-bold mt-1">{item.caption}</p>
      </div>

      {/* Play button overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="p-4 md:p-5 bg-primary/90 rounded-full shadow-[0_0_40px_rgba(239,35,60,0.55)]">
          <Play className="w-7 h-7 text-white fill-white" />
        </div>
      </div>

      {/* Border glow */}
      <div className="absolute inset-0 border border-transparent group-hover:border-primary/40 transition-colors duration-300 rounded-sm pointer-events-none" />
    </motion.div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, title, accent, count, label }) {
  return (
    <div className="flex items-center gap-4 mb-10 flex-wrap">
      <div className="w-1.5 h-12 bg-primary/80 flex-shrink-0" />
      <div>
        <h2 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
          {title} <span className="text-primary not-italic">{accent}</span>
        </h2>
        <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em]">
          {count} {label}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2 px-4 py-2 border border-white/5 bg-[#0a0b10]">
        <Icon className="w-3.5 h-3.5 text-primary/60" />
        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{title} {accent}</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const Gallery = () => {
  const [lightbox, setLightbox] = useState(null);

  const openTeam   = (idx) => setLightbox({ items: TEAM_MOMENTS,   index: idx });
  const openPlayer = (idx) => setLightbox({ items: PLAYER_MOMENTS, index: idx });
  const close = () => setLightbox(null);
  const prev  = () => setLightbox((l) => ({ ...l, index: (l.index - 1 + l.items.length) % l.items.length }));
  const next  = () => setLightbox((l) => ({ ...l, index: (l.index + 1) % l.items.length }));

  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  return (
    <div className="min-h-screen bg-[#050505] overflow-x-hidden selection:bg-primary selection:text-white">
      <Navbar />

      {/* Minimal static background — no expensive radial blurs on scroll */}
      <div className="fixed inset-0 pointer-events-none -z-10"
        style={{ background: "radial-gradient(circle at 30% 0%, rgba(239,35,60,0.06) 0%, transparent 55%)" }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="pt-24 sm:pt-28 md:pt-40 pb-10 sm:pb-16 md:pb-20 px-4 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-8 flex-wrap"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20">
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Media Vault</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 bg-primary rounded-sm shadow-[0_0_16px_rgba(239,35,60,0.35)]">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">✦ New Feature</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="text-4xl sm:text-6xl md:text-[8rem] lg:text-[11rem] font-black text-white tracking-tighter leading-none italic uppercase mb-4 break-words"
        >
          TEAM{" "}
          <span className="text-primary not-italic">GALLERY</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-gray-700 font-bold uppercase tracking-[0.5em] text-[10px] mb-12"
        >
          Daitya Legion — Behind the Battles · Unfiltered Moments
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Team Moments",  val: TEAM_MOMENTS.length,   Icon: Users },
            { label: "Player Shots",  val: PLAYER_MOMENTS.length, Icon: Clapperboard },
            { label: "Total Media",   val: TEAM_MOMENTS.length + PLAYER_MOMENTS.length, Icon: Play },
            { label: "Exclusive",     val: "100%", Icon: ImageIcon },
          ].map(({ label, val, Icon }) => (
            <div key={label} className="p-6 bg-[#0a0b10] border border-white/5 hover:border-primary/20 transition-colors group">
              <Icon className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors mb-3" />
              <p className="text-3xl md:text-5xl font-black italic tracking-tighter text-white">{val}</p>
              <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mt-2">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── TEAM MOMENTS ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 mb-20 md:mb-28">
        <SectionHeading
          icon={Users}
          title="Team"
          accent="Moments"
          count={TEAM_MOMENTS.length}
          label="Group Media"
        />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="space-y-5"
        >
          {/* Photos row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {TEAM_MOMENTS.filter(m => m.type === "photo").map((item) => (
              <PhotoCard
                key={item.id}
                item={item}
                onClick={() => openTeam(TEAM_MOMENTS.indexOf(item))}
              />
            ))}
          </div>
          {/* Team video row (full width) */}
          {TEAM_MOMENTS.filter(m => m.type === "video").map((item) => (
            <VideoCard
              key={item.id}
              item={item}
              onClick={() => openTeam(TEAM_MOMENTS.indexOf(item))}
            />
          ))}
        </motion.div>
      </div>

      {/* ── Divider ──────────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 mb-20 md:mb-28">
        <div className="flex items-center gap-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
          <div className="px-5 py-2 border border-primary/20 bg-primary/5 flex items-center gap-2 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em]">Daitya Legion</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        </div>
      </div>

      {/* ── PLAYER MOMENTS ───────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 pb-28">
        <SectionHeading
          icon={Clapperboard}
          title="Player"
          accent="Moments"
          count={PLAYER_MOMENTS.length}
          label="Action Shots"
        />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="flex flex-col sm:flex-row gap-5 justify-center"
        >
          {PLAYER_MOMENTS.map((item, idx) => (
            <div key={item.id} className="flex-1" style={{ maxWidth: "420px" }}>
              <VideoCard item={item} onClick={() => openPlayer(idx)} />
            </div>
          ))}
        </motion.div>
      </div>

      <Footer />

      {/* ── Lightbox ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox
            items={lightbox.items}
            activeIndex={lightbox.index}
            onClose={close}
            onPrev={prev}
            onNext={next}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
