import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Play,
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

// ── Data ─────────────────────────────────────────────────────────────────────
const PHOTOS = [
  { id: "p1", src: Photo1,  label: "Team Moment",  caption: "A candid moment of the squad." },
  { id: "p2", src: Photo2,  label: "Team Photo",   caption: "The Daitya Legion assembled." },
];

const VIDEOS = [
  { id: "v1", src: Shot1, label: "Shot 1 – Action",   caption: "Full game action reel." },
  { id: "v2", src: Shot2, label: "Shot 2 – Victory",  caption: "Victory celebration highlights." },
  { id: "v3", src: Shot3, label: "Shot 3 – Highlight", caption: "Key match highlights." },
];

// ── Animation variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 70, damping: 16 },
  },
};

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ items, activeIndex, onClose, onPrev, onNext }) {
  const item   = items[activeIndex];
  const vRef   = useRef(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft")   onPrev();
      if (e.key === "ArrowRight")  onNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    if (!vRef.current) return;
    vRef.current.load();
    vRef.current.play().catch(() => {});
  }, [activeIndex]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/96 backdrop-blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,35,60,0.07),transparent_70%)] pointer-events-none" />

      {/* Content */}
      <motion.div
        key={item.id}
        className="relative z-10 flex flex-col items-center max-w-[90vw] max-h-[88vh]"
        initial={{ scale: 0.78, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } }}
        exit={{ scale: 0.85, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "photo" ? (
          <img
            src={item.src}
            alt={item.label}
            className="max-w-[85vw] max-h-[75vh] object-contain rounded-sm shadow-[0_0_100px_rgba(239,35,60,0.2)]"
          />
        ) : (
          <div className="relative">
            <video
              ref={vRef}
              src={item.src}
              muted={muted}
              loop
              playsInline
              className="max-w-[85vw] max-h-[75vh] rounded-sm shadow-[0_0_100px_rgba(239,35,60,0.2)] object-contain bg-black"
            />
            <button
              onClick={() => setMuted((m) => !m)}
              className="absolute bottom-3 right-3 p-2 bg-black/70 border border-white/10 rounded-full hover:border-primary/60 transition-all"
            >
              {muted
                ? <VolumeX className="w-4 h-4 text-gray-400" />
                : <Volume2 className="w-4 h-4 text-primary" />}
            </button>
          </div>
        )}

        {/* Caption */}
        <div className="mt-5 text-center">
          <p className="text-white font-black uppercase tracking-tight text-sm">{item.label}</p>
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-1">{item.caption}</p>
          <p className="text-gray-700 text-[9px] font-black uppercase tracking-widest mt-3">
            {activeIndex + 1} / {items.length}
          </p>
        </div>
      </motion.div>

      {/* Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 md:left-8 z-10 p-3 bg-black/60 border border-white/10 rounded-full hover:border-primary/50 hover:bg-primary/10 transition-all group"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 md:right-8 z-10 p-3 bg-black/60 border border-white/10 rounded-full hover:border-primary/50 hover:bg-primary/10 transition-all group"
          >
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
          </button>
        </>
      )}

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 p-2.5 bg-black/60 border border-white/10 rounded-full hover:border-primary/50 hover:bg-primary/10 transition-all"
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
      variants={cardVariants}
      className="relative overflow-hidden cursor-pointer group aspect-[4/3] rounded-sm bg-[#0a0b10]"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
    >
      {/* Skeleton shimmer */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/3 via-white/6 to-white/3 animate-pulse" />
      )}

      <img
        src={item.src}
        alt={item.label}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${loaded ? "opacity-100" : "opacity-0"}`}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350" />

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-350">
        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-primary mb-1">Photo</p>
        <p className="text-sm font-black text-white uppercase tracking-tight">{item.label}</p>
      </div>

      {/* Zoom icon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none">
        <div className="p-3 bg-primary/90 rounded-full shadow-[0_0_30px_rgba(239,35,60,0.5)]">
          <ZoomIn className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Glow border */}
      <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/50 transition-all duration-350 rounded-sm pointer-events-none" />
    </motion.div>
  );
}

// ── Video Card ────────────────────────────────────────────────────────────────
function VideoCard({ item, onClick }) {
  const vRef = useRef(null);
  const [hovering, setHovering] = useState(false);

  const handleEnter = () => {
    setHovering(true);
    vRef.current?.play().catch(() => {});
  };
  const handleLeave = () => {
    setHovering(false);
    if (vRef.current) {
      vRef.current.pause();
      vRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      className="relative overflow-hidden cursor-pointer group aspect-video rounded-sm bg-[#0a0b10] border border-white/5"
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
    >
      {/* Video – only loads metadata until hovered */}
      <video
        ref={vRef}
        src={item.src}
        muted
        loop
        playsInline
        preload="none"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Static gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Video badge */}
      <div className="absolute top-3 left-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/80 border border-primary/30 rounded-sm backdrop-blur-sm">
          <Play className="w-2.5 h-2.5 text-primary fill-primary" />
          <span className="text-[8px] font-black text-primary uppercase tracking-widest">Video</span>
        </div>
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-primary mb-1">Daitya Legion</p>
        <p className="text-base font-black text-white uppercase tracking-tight leading-tight">{item.label}</p>
        <p className="text-[9px] text-gray-500 font-bold mt-1">{item.caption}</p>
      </div>

      {/* Play button on hover */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        animate={{ opacity: hovering ? 1 : 0, scale: hovering ? 1 : 0.7 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-5 bg-primary/90 rounded-full shadow-[0_0_50px_rgba(239,35,60,0.6)]">
          <Play className="w-8 h-8 text-white fill-white" />
        </div>
      </motion.div>

      {/* Glow border */}
      <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/50 transition-all duration-350 rounded-sm pointer-events-none" />
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const Gallery = () => {
  const [lightbox, setLightbox] = useState(null); // { items, index }

  const openPhoto = (idx) =>
    setLightbox({ items: PHOTOS.map((p) => ({ ...p, type: "photo" })), index: idx });

  const openVideo = (idx) =>
    setLightbox({ items: VIDEOS.map((v) => ({ ...v, type: "video" })), index: idx });

  const close = () => setLightbox(null);
  const prev  = () => setLightbox((l) => ({ ...l, index: (l.index - 1 + l.items.length) % l.items.length }));
  const next  = () => setLightbox((l) => ({ ...l, index: (l.index + 1) % l.items.length }));

  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  return (
    <div className="min-h-screen bg-[#050505] pb-0 overflow-x-hidden selection:bg-primary selection:text-white">
      <Navbar />

      {/* Fixed background glows */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div
          className="absolute top-0 left-0 w-full h-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle at 30% -10%, #ef233c, transparent 55%)", transform: "translateZ(0)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-full h-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle at 80% 110%, #7f1d1d, transparent 50%)", transform: "translateZ(0)" }}
        />
      </div>

      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <div className="pt-24 sm:pt-28 md:pt-40 pb-10 sm:pb-16 md:pb-24 px-4 max-w-[1400px] mx-auto">
        {/* NEW badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 w-fit">
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">
              Media Vault
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-sm shadow-[0_0_20px_rgba(239,35,60,0.4)]">
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">✦ New Feature</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="text-4xl sm:text-6xl md:text-[8rem] lg:text-[11rem] font-black text-white tracking-tighter leading-none italic uppercase mb-4 break-words"
        >
          TEAM{" "}
          <span className="text-primary not-italic tracking-[0.05em]">GALLERY</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-gray-700 font-bold uppercase tracking-[0.5em] text-[10px] mb-16"
        >
          Daitya Legion — Behind the Battles · Unfiltered Moments
        </motion.p>

        {/* Summary counters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4"
        >
          {[
            { label: "Photos",       val: PHOTOS.length, Icon: ImageIcon, color: "text-white" },
            { label: "Videos",       val: VIDEOS.length, Icon: Video,     color: "text-white" },
            { label: "Total Media",  val: PHOTOS.length + VIDEOS.length, Icon: Play, color: "text-primary" },
            { label: "Exclusive",    val: "100%",        Icon: ImageIcon, color: "text-primary" },
          ].map(({ label, val, Icon, color }) => (
            <div
              key={label}
              className="p-6 bg-[#0a0b10] border border-white/5 hover:border-primary/20 transition-all group"
            >
              <Icon className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors mb-3" />
              <p className={`text-3xl md:text-5xl font-black italic tracking-tighter ${color}`}>{val}</p>
              <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mt-2">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── PHOTOS SECTION ───────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 mb-24 md:mb-40">
        {/* Section heading */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-1.5 h-12 bg-primary/80" />
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              Photos <span className="text-primary not-italic">Vault</span>
            </h2>
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em]">
              {PHOTOS.length} Exclusive Shots
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4 py-2 border border-white/5 bg-[#0a0b10]">
            <ImageIcon className="w-3 h-3 text-primary/60" />
            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Photo Gallery</span>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {PHOTOS.map((p, idx) => (
            <PhotoCard key={p.id} item={p} onClick={() => openPhoto(idx)} />
          ))}
        </motion.div>
      </div>

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 mb-24 md:mb-40">
        <div className="relative flex items-center gap-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="px-6 py-2 border border-primary/20 bg-primary/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em]">
              Media Vault
            </span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
      </div>

      {/* ── VIDEOS SECTION ───────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 pb-24">
        {/* Section heading */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-1.5 h-12 bg-primary/80" />
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              Video <span className="text-primary not-italic">Reels</span>
            </h2>
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em]">
              {VIDEOS.length} Exclusive Clips
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4 py-2 border border-white/5 bg-[#0a0b10]">
            <Video className="w-3 h-3 text-primary/60" />
            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Video Gallery</span>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {VIDEOS.map((v, idx) => (
            <VideoCard key={v.id} item={v} onClick={() => openVideo(idx)} />
          ))}
        </motion.div>
      </div>

      <Footer />

      {/* Lightbox */}
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
