import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    Play,
    Users,
    Video,
    Volume2,
    VolumeX,
    X,
    ZoomIn,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";

/* ── Imports ─────────────────────────────────────────────────────────────── */
import Photo1 from "../assets/Team Gallery/Photo1.jpeg";
import Photo2 from "../assets/Team Gallery/Photo2.png";
import Shot1 from "../assets/Team Gallery/Shot1.mp4";
import Shot2 from "../assets/Team Gallery/Shot2.mp4";
import TeamMoment1 from "../assets/Team Gallery/Team_moment1.mp4";
import TeamMoment2 from "../assets/Team Gallery/Team_moment2.webp";

/* ── Data ────────────────────────────────────────────────────────────────── */
// 🖼 Photo Vault  ─ Photo1, Photo2
const PHOTO_VAULT = [
  { id: "pv1", type: "image", src: Photo1, caption: "Squad mid-game." },
  { id: "pv2", type: "image", src: Photo2, caption: "Full team line-up." },
];

// 🎬 Video Vault  ─ Shot1, Shot2, Shot3
const VIDEO_VAULT = [
  {
    id: "vv1",
    type: "video",
    src: Shot1,
    caption: "Raw in-game footage.",
    portrait: true,
  },
  {
    id: "vv2",
    type: "video",
    src: Shot2,
    caption: "Player highlights.",
    portrait: true,
  },
  {
    id: "vv3",
    type: "video",
    src: TeamMoment1,
    caption: "Key match reel.",
    portrait: false,
  },
];

// 👥 Team Vault  ─ Team_moment1 (video), Team_moment2 (webp image)
const TEAM_VAULT = [
  {
    id: "tv1",
    type: "video",
    src: TeamMoment1,
    caption: "Team action.",
    portrait: false,
  },
  {
    id: "tv2",
    type: "image",
    src: TeamMoment2,
    caption: "Team group shot.",
    portrait: false,
  },
];

/* ── Lightbox video (own ref so src always triggers load+play) ───────────── */
function LightboxVideo({ src, muted, onCanPlay }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.load();
    const p = el.play();
    if (p) p.catch(() => {});
    return () => {
      el.pause();
      el.src = "";
      el.load();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      muted={muted}
      loop
      playsInline
      onCanPlay={onCanPlay}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        background: "#000",
      }}
    />
  );
}

/* ── Lightbox ─────────────────────────────────────────────────────────────── */
function Lightbox({ items, index, onClose, onPrev, onNext }) {
  const item = items[index];
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const isPortrait = item.type === "video" && item.portrait;

  useEffect(() => {
    setReady(false);
  }, [index]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      {/* Plain dark overlay — no backdrop-blur (kills performance) */}
      <div className="absolute inset-0 bg-black/96" />

      {/* Content */}
      <motion.div
        key={item.id}
        className="relative z-10 flex flex-col items-center px-4 w-full"
        style={{ maxWidth: isPortrait ? "360px" : "min(92vw, 1000px)" }}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Image ── */}
        {item.type === "image" && (
          <img
            src={item.src}
            alt="gallery"
            style={{
              maxWidth: "88vw",
              maxHeight: "76vh",
              objectFit: "contain",
              borderRadius: "2px",
              display: "block",
            }}
          />
        )}

        {/* ── Video ── */}
        {item.type === "video" && (
          <div
            className="relative w-full rounded-sm overflow-hidden bg-black"
            style={{
              aspectRatio: isPortrait ? "9/16" : "16/9",
              maxHeight: "76vh",
            }}
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
              className="absolute bottom-3 right-3 p-2 bg-black/70 border border-white/15 rounded-full hover:border-primary/50 transition-colors"
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-gray-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-primary" />
              )}
            </button>
          </div>
        )}

        {/* Caption */}
        <div className="mt-4 text-center select-none">
          <p className="text-2xl">🏏</p>
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-1">
            {item.caption}
          </p>
          <p className="text-gray-700 text-[9px] font-black uppercase tracking-[0.35em] mt-2">
            {index + 1} / {items.length}
          </p>
        </div>
      </motion.div>

      {/* Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-3 md:left-8 z-10 p-3 bg-black/60 border border-white/10 rounded-full hover:border-primary/40 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-3 md:right-8 z-10 p-3 bg-black/60 border border-white/10 rounded-full hover:border-primary/40 transition-colors group"
          >
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
          </button>
        </>
      )}

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2.5 bg-black/60 border border-white/10 rounded-full hover:border-primary/40 transition-colors"
      >
        <X className="w-5 h-5 text-gray-400 hover:text-primary transition-colors" />
      </button>
    </motion.div>
  );
}

/* ── Image card (lazy, no animation library — pure CSS transitions) ────────── */
function ImgCard({ item, onClick }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className="relative overflow-hidden cursor-pointer group aspect-[4/3] rounded-sm bg-[#0c0c0c] border border-white/5"
      onClick={onClick}
    >
      {!loaded && <div className="absolute inset-0 bg-white/3 animate-pulse" />}
      <img
        src={item.src}
        alt="gallery"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${loaded ? "opacity-100" : "opacity-0"}`}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
      {/* Zoom hint */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none">
        <div className="p-3 bg-primary/90 rounded-full shadow-[0_0_20px_rgba(239,35,60,0.4)]">
          <ZoomIn className="w-5 h-5 text-white" />
        </div>
      </div>
      {/* Emoji label */}
      <div className="absolute bottom-3 left-3 text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-250 select-none">
        🏏
      </div>
      <div className="absolute inset-0 border border-transparent group-hover:border-primary/35 transition-colors duration-300 rounded-sm pointer-events-none" />
    </div>
  );
}

/* ── Video card (preload="none", plays only on hover) ────────────────────── */
function VidCard({ item, onClick }) {
  const vRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const isPortrait = item.portrait;

  const enter = useCallback(() => {
    setHovering(true);
    const el = vRef.current;
    if (!el) return;
    if (el.readyState === 0) el.load();
    el.play().catch(() => {});
  }, []);

  const leave = useCallback(() => {
    setHovering(false);
    const el = vRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }, []);

  return (
    <div
      className="relative overflow-hidden cursor-pointer group rounded-sm bg-[#0c0c0c] border border-white/5"
      style={{ aspectRatio: isPortrait ? "9/16" : "16/9" }}
      onClick={onClick}
      onMouseEnter={enter}
      onMouseLeave={leave}
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
          transition: "transform 0.45s ease",
          transform: hovering ? "scale(1.04)" : "scale(1)",
        }}
      />
      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
      {/* Video badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-black/80 border border-primary/25 rounded-sm">
        <Play className="w-2.5 h-2.5 text-primary fill-primary" />
        <span className="text-[8px] font-black text-primary uppercase tracking-widest">
          Video
        </span>
      </div>
      {/* Bottom emoji */}
      <div className="absolute bottom-3 left-3 text-xl select-none">🏏</div>
      {/* Play overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: hovering ? 1 : 0, transition: "opacity 0.2s" }}
      >
        <div className="p-4 bg-primary/90 rounded-full shadow-[0_0_36px_rgba(239,35,60,0.5)]">
          <Play className="w-7 h-7 text-white fill-white" />
        </div>
      </div>
      <div className="absolute inset-0 border border-transparent group-hover:border-primary/35 transition-colors duration-300 rounded-sm pointer-events-none" />
    </div>
  );
}

/* ── Section header ────────────────────────────────────────────────────────── */
function VaultHeader({ icon: Icon, title, accent, sub }) {
  return (
    <div className="flex items-center gap-4 mb-10 flex-wrap">
      <div className="w-1.5 h-12 bg-primary/80 flex-shrink-0" />
      <div>
        <h2 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
          {title} <span className="text-primary not-italic">{accent}</span>
        </h2>
        <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em]">
          {sub}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2 px-4 py-2 border border-white/5 bg-[#0c0c0c]">
        <Icon className="w-3.5 h-3.5 text-primary/60" />
        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">
          {title} {accent}
        </span>
      </div>
    </div>
  );
}

/* ── Divider ─────────────────────────────────────────────────────────────── */
function Divider() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 mb-20 md:mb-28">
      <div className="flex items-center gap-6">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="px-5 py-2 border border-primary/20 bg-primary/5 flex items-center gap-2 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em]">
            Daitya Legion
          </span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
const Gallery = () => {
  // lightbox state: null | { items, index }
  const [lb, setLb] = useState(null);

  const open = (items, idx) => setLb({ items, index: idx });
  const close = () => setLb(null);
  const prev = () =>
    setLb((l) => ({
      ...l,
      index: (l.index - 1 + l.items.length) % l.items.length,
    }));
  const next = () =>
    setLb((l) => ({ ...l, index: (l.index + 1) % l.items.length }));

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = lb ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lb]);

  const totalMedia =
    PHOTO_VAULT.length + VIDEO_VAULT.length + TEAM_VAULT.length;

  return (
    <div className="min-h-screen bg-[#050505] overflow-x-hidden selection:bg-primary selection:text-white">
      <Navbar />

      {/* One static radial glow — no fixed layers, no blur */}
      <div
        className="absolute top-0 left-0 w-full h-[600px] pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 30% 0%, rgba(239,35,60,0.07), transparent)",
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="pt-24 sm:pt-32 md:pt-44 pb-10 sm:pb-16 md:pb-20 px-4 max-w-[1400px] mx-auto">
        {/* Badges */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20">
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">
              Media Vault
            </span>
          </div>
          <div className="px-3 py-2 bg-primary rounded-sm shadow-[0_0_14px_rgba(239,35,60,0.3)]">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">
              ✦ New Feature
            </span>
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-[8rem] lg:text-[11rem] font-black text-white tracking-tighter leading-none italic uppercase mb-4 break-words">
          TEAM <span className="text-primary not-italic">GALLERY</span>
        </h1>
        <p className="text-gray-700 font-bold uppercase tracking-[0.5em] text-[10px] mb-12">
          Daitya Legion — Behind the Battles · Unfiltered Moments
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Photos", val: PHOTO_VAULT.length, Icon: ImageIcon },
            { label: "Player Shots", val: VIDEO_VAULT.length, Icon: Video },
            { label: "Team Moments", val: TEAM_VAULT.length, Icon: Users },
            { label: "Total Media", val: totalMedia, Icon: Play },
          ].map(({ label, val, Icon }) => (
            <div
              key={label}
              className="p-6 bg-[#0c0c0c] border border-white/5 hover:border-primary/20 transition-colors group"
            >
              <Icon className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors mb-3" />
              <p className="text-3xl md:text-5xl font-black italic tracking-tighter text-white">
                {val}
              </p>
              <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mt-2">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ PHOTO VAULT ══════════════════════════════════════════════════════ */}
      <div className="max-w-[1400px] mx-auto px-4 mb-20 md:mb-28">
        <VaultHeader
          icon={ImageIcon}
          title="Photo"
          accent="Vault"
          sub={`${PHOTO_VAULT.length} Exclusive Shots`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PHOTO_VAULT.map((item, idx) => (
            <ImgCard
              key={item.id}
              item={item}
              onClick={() => open(PHOTO_VAULT, idx)}
            />
          ))}
        </div>
      </div>

      <Divider />

      {/* ══ VIDEO VAULT ══════════════════════════════════════════════════════ */}
      <div className="max-w-[1400px] mx-auto px-4 mb-20 md:mb-28">
        <VaultHeader
          icon={Video}
          title="Video"
          accent="Vault"
          sub={`${VIDEO_VAULT.length} Action Clips`}
        />
        {/* Portrait pair (Shot1 + Shot2) side by side, landscape (Shot3) full width */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            {VIDEO_VAULT.filter((v) => v.portrait).map((item, idx) => (
              <div
                key={item.id}
                className="flex-1"
                style={{ maxWidth: "400px" }}
              >
                <VidCard
                  item={item}
                  onClick={() => open(VIDEO_VAULT, VIDEO_VAULT.indexOf(item))}
                />
              </div>
            ))}
          </div>
          {VIDEO_VAULT.filter((v) => !v.portrait).map((item) => (
            <VidCard
              key={item.id}
              item={item}
              onClick={() => open(VIDEO_VAULT, VIDEO_VAULT.indexOf(item))}
            />
          ))}
        </div>
      </div>

      <Divider />

      {/* ══ TEAM VAULT ═══════════════════════════════════════════════════════ */}
      <div className="max-w-[1400px] mx-auto px-4 pb-28">
        <VaultHeader
          icon={Users}
          title="Team"
          accent="Vault"
          sub={`${TEAM_VAULT.length} Group Moments`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {TEAM_VAULT.map((item, idx) =>
            item.type === "image" ? (
              <ImgCard
                key={item.id}
                item={item}
                onClick={() => open(TEAM_VAULT, idx)}
              />
            ) : (
              <VidCard
                key={item.id}
                item={item}
                onClick={() => open(TEAM_VAULT, idx)}
              />
            ),
          )}
        </div>
      </div>

      <Footer />

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lb && (
          <Lightbox
            items={lb.items}
            index={lb.index}
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
