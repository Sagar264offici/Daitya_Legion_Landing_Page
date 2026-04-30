import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, SkipForward, SkipBack } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import TimelessMusic from '../assets/Timeless (Instrumental).mp3';
import MeAndTheDevil from '../assets/Me and the Devil (Instrumental).mp3';
import BelieverInstrumental from '../assets/Imagine Dragons   Believer Official Instrumental.mp3';
import StarboySInstrumental from '../assets/The Weeknd Starboy Instrumental Original.mp3';

const TRACKS = [
  { title: 'TIMELESS', artist: 'THE WEEKND', src: TimelessMusic },
  { title: 'ME & THE DEVIL', artist: 'SAM COOKE', src: MeAndTheDevil },
  { title: 'BELIEVER', artist: 'IMAGINE DRAGONS', src: BelieverInstrumental },
  { title: 'STARBOY', artist: 'THE WEEKND', src: StarboySInstrumental },
];

const AudioConsole = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(() => Math.floor(Math.random() * TRACKS.length));
  const [volume, setVolume] = useState(() => parseInt(localStorage.getItem('daitya_volume') || '50'));
  const [isMuted, setIsMuted] = useState(false);
  const [showTrack, setShowTrack] = useState(false);
  const audioRef = useRef(null);

  const currentTrack = TRACKS[trackIndex];

  // When track changes, reload audio and play
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.load();
    audioRef.current.volume = volume / 100;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    }
  }, [trackIndex]);

  // Initial autoplay attempt
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setTrackIndex((i) => {
      let next = Math.floor(Math.random() * TRACKS.length);
      if (next === i) next = (next + 1) % TRACKS.length;
      return next;
    });
    setShowTrack(true);
    setTimeout(() => setShowTrack(false), 2500);
  };

  const prevTrack = () => {
    setTrackIndex((i) => {
      let prev = Math.floor(Math.random() * TRACKS.length);
      if (prev === i) prev = (prev - 1 + TRACKS.length) % TRACKS.length;
      return prev;
    });
    setShowTrack(true);
    setTimeout(() => setShowTrack(false), 2500);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value);
    setVolume(newVol);
    localStorage.setItem('daitya_volume', newVol.toString());
    if (audioRef.current) audioRef.current.volume = newVol / 100;
    if (newVol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative flex items-center gap-2 sm:gap-3 bg-black/60 backdrop-blur-md border border-white/5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-sm group">
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onEnded={nextTrack}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Track name toast */}
      <AnimatePresence>
        {showTrack && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 border border-primary/30 text-[8px] font-black uppercase tracking-widest text-primary px-3 py-1.5 whitespace-nowrap rounded-sm"
          >
            {currentTrack.title}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label */}
      <div className="hidden sm:flex flex-col items-center justify-center mr-1">
        <span className="text-[7px] font-black text-primary uppercase tracking-[0.3em] mb-0.5">COMMS</span>
        <Music className={`w-3 h-3 ${isPlaying ? 'text-primary animate-pulse' : 'text-gray-700'}`} />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button onClick={prevTrack} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-gray-600 hover:text-primary transition-colors">
          <SkipBack className="w-3 h-3" />
        </button>

        <button
          onClick={togglePlay}
          className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center bg-white/5 hover:bg-primary/20 border border-white/10 transition-all rounded-sm hover:shadow-[0_0_15px_rgba(136,8,8,0.3)]"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary fill-primary" />}
        </button>

        <button onClick={nextTrack} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-gray-600 hover:text-primary transition-colors">
          <SkipForward className="w-3 h-3" />
        </button>
      </div>

      {/* Volume */}
      <div className="hidden sm:flex items-center gap-2">
        <button onClick={toggleMute} className="text-gray-500 hover:text-white transition-colors">
          {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-primary" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
        <div className="relative w-16 sm:w-20 flex items-center group/slider">
          <input
            type="range"
            min="0" max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded opacity-0 group-hover/slider:opacity-100 transition-opacity whitespace-nowrap">
            GAIN: {volume}%
          </div>
        </div>
      </div>

      <div className="absolute -bottom-[1px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_10px_rgba(136,8,8,0.5)]"></div>
    </div>
  );
};

export default AudioConsole;
