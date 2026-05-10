import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';

import TimelessMusic from '../assets/Timeless (Instrumental).mp3';

const AudioConsole = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume]       = useState(() => parseInt(localStorage.getItem('daitya_volume') || '50'));
  const [isMuted, setIsMuted]     = useState(false);
  const audioRef = useRef(null);

  // Initial autoplay attempt
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); }
    else           { audioRef.current.play().catch(() => {}); }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const v = parseInt(e.target.value);
    setVolume(v);
    localStorage.setItem('daitya_volume', v.toString());
    if (audioRef.current) audioRef.current.volume = v / 100;
    if (v > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative flex items-center gap-2 sm:gap-3 bg-black/60 backdrop-blur-md border border-white/5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-sm">
      <audio
        ref={audioRef}
        src={TimelessMusic}
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Label */}
      <div className="hidden sm:flex flex-col items-center justify-center mr-1">
        <span className="text-[7px] font-black text-primary uppercase tracking-[0.3em] mb-0.5">COMMS</span>
        <Music className={`w-3 h-3 ${isPlaying ? 'text-primary animate-pulse' : 'text-gray-700'}`} />
      </div>

      {/* Play / Pause */}
      <button
        onClick={togglePlay}
        className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center bg-white/5 hover:bg-primary/20 border border-white/10 transition-all rounded-sm hover:shadow-[0_0_15px_rgba(136,8,8,0.3)]"
      >
        {isPlaying
          ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          : <Play  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary fill-primary" />}
      </button>

      {/* Volume */}
      <div className="hidden sm:flex items-center gap-2">
        <button onClick={toggleMute} className="text-gray-500 hover:text-white transition-colors">
          {isMuted || volume === 0
            ? <VolumeX className="w-3.5 h-3.5 text-primary" />
            : <Volume2 className="w-3.5 h-3.5" />}
        </button>
        <div className="relative w-16 sm:w-20 flex items-center group/slider">
          <input
            type="range" min="0" max="100" value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded opacity-0 group-hover/slider:opacity-100 transition-opacity whitespace-nowrap">
            GAIN: {volume}%
          </div>
        </div>
      </div>

      <div className="absolute -bottom-[1px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_10px_rgba(136,8,8,0.5)]" />
    </div>
  );
};

export default AudioConsole;
