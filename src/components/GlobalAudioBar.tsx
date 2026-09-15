import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  X,
  BookOpen,
  Headphones,
  ExternalLink,
} from 'lucide-react';
import { useAudio } from '../services/audioContext';

export const GlobalAudioBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    volume,
    isMuted,
    togglePlayPause,
    seek,
    seekRelative,
    setSpeed,
    setVolumeLevel,
    toggleMute,
    closePlayer,
    showMiniPlayer,
  } = useAudio();

  if (!currentTrack || !showMiniPlayer) return null;

  const formatSeconds = (s: number) => {
    if (isNaN(s)) return '00:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-xl z-40 bg-[#080E1C]/95 border border-cyan-500/40 rounded-2xl p-3 shadow-[0_0_30px_rgba(0,229,255,0.2)] backdrop-blur-xl text-slate-100"
      >
        {/* Progress Bar */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            seek(pos * duration);
          }}
          className="w-full h-1.5 bg-slate-800 rounded-full mb-2 cursor-pointer relative overflow-hidden group"
        >
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-150 relative"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Track Info */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0">
              {currentTrack.type === 'quran' ? (
                <BookOpen className="w-4 h-4" />
              ) : (
                <Headphones className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
              <p className="text-[10px] text-slate-400 truncate">{currentTrack.subtitle}</p>
            </div>
          </div>

          {/* Time & Play Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              {formatSeconds(currentTime)} / {formatSeconds(duration)}
            </span>

            {/* Seek -15s */}
            <button
              onClick={() => seekRelative(-15)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Seek -15 seconds"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlayPause}
              className="p-2 rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all font-black shadow-[0_0_10px_rgba(0,229,255,0.3)] cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-slate-950" />
              ) : (
                <Play className="w-4 h-4 fill-slate-950" />
              )}
            </button>

            {/* Seek +30s */}
            <button
              onClick={() => seekRelative(30)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Seek +30 seconds"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Speed Selector */}
            <button
              onClick={() => {
                const speeds = [0.75, 1, 1.25, 1.5, 2];
                const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                setSpeed(speeds[nextIdx]);
              }}
              className="px-1.5 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-400 transition-colors"
              title="Cycle Playback Speed"
            >
              {playbackSpeed}x
            </button>

            {/* Mute Toggle */}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors hidden sm:inline-flex"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close Bar */}
            <button
              onClick={closePlayer}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
              title="Close Player"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
