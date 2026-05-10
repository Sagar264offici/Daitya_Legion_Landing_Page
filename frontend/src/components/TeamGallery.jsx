import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, ZoomIn, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";

// ── Media imports ─────────────────────────────────────────────────────────────
import Photo1 from "../assets/Team Gallery/Photo1.jpeg";
import Photo2 from "../assets/Team Gallery/Photo2.png";
import Shot1  from "../assets/Team Gallery/Shot1.mp4";
import Shot2  from "../assets/Team Gallery/Shot2.mp4";
import Shot3  from "../assets/Team Gallery/Shot3.mp4";

// ── Gallery data ──────────────────────────────────────────────────────────────
const GALLERY_ITEMS = [
  { id: 1, type: "image", src: Photo1,  label: "Team Moment",       span: "col-span-1 row-span-2" },
  { id: 2, type: "video", src: Shot3,   label: "Shot 3 – Highlight", span: "col-span-1 row-span-1" },
  { id: 3, type: "image", src: Photo2,  label: "Team Photo",        span: "col-span-1 row-span-1" },
  { id: 4, type: "video", src: Shot1,   label: "Shot 1 – Action",   span: "col-span-2 row-span-2" },
  { id: 5, type: "video", src: Shot2,   label: "Shot 2 – Victory",  span: "col-span-1 row-span-1" },
];

// ── Stagger container ─────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.88, rotateX: 12 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: { type: "spring", stiffness: 80, damping: 16 },
  },
};

// ── Lightbox overlay ──────────────────────────────────────────────────────────
function Lightbox({ items, activeIndex, onClose, onPrev, onNext }) {
  const item = items[activeIndex];
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  // Auto-play video when opened
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [activeIndex]);

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox-backdrop"
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Blurred cinematic backdrop */}
        <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />

        {/* Red glow aura */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,35,60,0.08),transparent_70%)] pointer-events-none" />

        {/* Media */}
        <motion.div
          key={`lb-${activeIndex}`}
          className="relative z-10 max-w-[90vw] max-h-[85vh] flex flex-col items-center"
          initial={{ scale: 0.75, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {item.type === "image" ? (
            <img
              src={item.src}
              alt={item.label}
              className="max-w-[85vw] max-h-[75vh] object-contain rounded-sm shadow-[0_0_80px_rgba(239,35,60,0.25)]"
            />
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                src={item.src}
                muted={muted}
                loop
                playsInline
                controls={false}
                className="max-w-[85vw] max-h-[75vh] rounded-sm shadow-[0_0_80px_rgba(239,35,60,0.25)] object-contain"
              />
              {/* Mute toggle */}
              <button
                onClick={() => setMuted((m) => !m)}
                className="absolute bottom-4 right-4 p-2 bg-black/60 border border-white/10 rounded-full hover:border-primary/60 transition-colors"
              >
                {muted ? (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-primary" />
                )}
              </button>
            </div>
          )}

          {/* Label */}
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
            {item.label}
            <span className="ml-4 text-gray-700">
              {activeIndex + 1} / {items.length}
            </span>
          </p>
        </motion.div>

        {/* Navigation arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 md:left-10 z-10 p-3 bg-black/60 border border-white/10 rounded-full hover:border-primary/60 hover:bg-primary/10 transition-all group"
        >
          <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 md:right-10 z-10 p-3 bg-black/60 border border-white/10 rounded-full hover:border-primary/60 hover:bg-primary/10 transition-all group"
        >
          <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-black/60 border border-white/10 rounded-full hover:border-primary/60 hover:bg-primary/10 transition-all"
        >
          <X className="w-5 h-5 text-gray-400 hover:text-primary transition-colors" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Single gallery card ───────────────────────────────────────────────────────
function GalleryCard({ item, onClick, index }) {
  const videoRef = useRef(null);
  const [hovering, setHovering] = useState(false);

  const handleMouseEnter = () => {
    setHovering(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };
  const handleMouseLeave = () => {
    setHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`relative overflow-hidden cursor-pointer group ${item.span} rounded-sm`}
      style={{ minHeight: "200px" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(index)}
      whileHover={{ scale: 1.02, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {/* Media */}
      {item.type === "image" ? (
        <img
          src={item.src}
          alt={item.label}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <>
          <video
            ref={videoRef}
            src={item.src}
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Play badge */}
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-black/70 border border-primary/40 rounded-sm backdrop-blur-sm">
              <Play className="w-2.5 h-2.5 text-primary fill-primary" />
              <span className="text-[8px] font-black text-primary uppercase tracking-widest">Video</span>
            </div>
          </div>
        </>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

      {/* Hover content */}
      <motion.div
        className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none"
        animate={{ opacity: hovering ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      >
        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-gray-400 mb-1">
          {item.type === "image" ? "Photo" : "Video"}
        </p>
        <p className="text-sm font-black text-white uppercase tracking-tight leading-tight">
          {item.label}
        </p>
      </motion.div>

      {/* Zoom icon */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        animate={{ opacity: hovering ? 1 : 0, scale: hovering ? 1 : 0.6 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-3 bg-primary/90 rounded-full shadow-[0_0_30px_rgba(239,35,60,0.6)]">
          {item.type === "video"
            ? <Play className="w-5 h-5 text-white fill-white" />
            : <ZoomIn className="w-5 h-5 text-white" />
          }
        </div>
      </motion.div>

      {/* Glowing border on hover */}
      <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/60 transition-all duration-400 rounded-sm pointer-events-none" />
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TeamGallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const sectionRef = useRef(null);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevItem = () => setLightboxIndex((i) => (i - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length);
  const nextItem = () => setLightboxIndex((i) => (i + 1) % GALLERY_ITEMS.length);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIndex]);

  return (
    <section
      id="team-gallery"
      ref={sectionRef}
      className="relative py-24 md:py-40 overflow-hidden bg-[#050505]"
    >
      {/* Section background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 relative z-10">

        {/* ── Section Header ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-16 md:mb-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1.5 h-14 bg-gradient-to-b from-primary to-primary/30" />
            <div>
              {/* NEW badge */}
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-[0.3em] rounded-sm shadow-[0_0_20px_rgba(239,35,60,0.5)] animate-pulse">
                  ✦ New Feature
                </span>
                <span className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em]">
                  Exclusive Media Vault
                </span>
              </div>
              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white italic tracking-tighter uppercase leading-none">
                Team{" "}
                <span className="text-primary not-italic">Gallery</span>
              </h2>
              <p className="mt-3 text-[10px] font-black text-gray-600 uppercase tracking-[0.5em]">
                Behind the battles · Unfiltered moments
              </p>
            </div>
          </div>

          {/* Decorative line */}
          <div className="flex items-center gap-4 ml-6 mt-8">
            <div className="h-px flex-1 bg-gradient-to-r from-primary/40 via-primary/10 to-transparent" />
            <span className="text-[8px] font-black text-gray-700 uppercase tracking-[0.4em]">
              {GALLERY_ITEMS.filter(i => i.type === "image").length} Photos · {GALLERY_ITEMS.filter(i => i.type === "video").length} Videos
            </span>
          </div>
        </motion.div>

        {/* ── Masonry grid ──────────────────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 auto-rows-[220px] md:auto-rows-[260px] gap-3 md:gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          style={{ perspective: 1000 }}
        >
          {GALLERY_ITEMS.map((item, idx) => (
            <GalleryCard
              key={item.id}
              item={item}
              index={idx}
              onClick={openLightbox}
            />
          ))}
        </motion.div>

        {/* ── Bottom strip ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex items-center justify-between"
        >
          <span className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">
            Click any media to open fullscreen
          </span>
          <div className="flex gap-2">
            {GALLERY_ITEMS.map((_, i) => (
              <button
                key={i}
                onClick={() => openLightbox(i)}
                className="w-1.5 h-1.5 rounded-full bg-primary/20 hover:bg-primary transition-colors"
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          items={GALLERY_ITEMS}
          activeIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevItem}
          onNext={nextItem}
        />
      )}
    </section>
  );
}
