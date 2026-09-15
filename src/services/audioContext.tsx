import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { api } from './api';

export type AudioTrackType = 'quran' | 'podcast';

export interface GlobalTrack {
  id: string;
  type: AudioTrackType;
  title: string;
  subtitle: string;
  audioUrl?: string; // For Quran audio
  youtubeId?: string; // For YouTube podcast official player
  thumbnail?: string;
  durationSeconds?: number;
  surahNumber?: number;
  playlistId?: string;
  originalUrl?: string;
}

interface AudioContextValue {
  currentTrack: GlobalTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  volume: number;
  isMuted: boolean;
  playTrack: (track: GlobalTrack) => void;
  togglePlayPause: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  seekRelative: (deltaSeconds: number) => void;
  setSpeed: (speed: number) => void;
  setVolumeLevel: (vol: number) => void;
  toggleMute: () => void;
  closePlayer: () => void;
  showMiniPlayer: boolean;
  setShowMiniPlayer: (show: boolean) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<GlobalTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(true);

  // Native HTML5 audio for Quran
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioElementRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // Save history as completed
      if (currentTrack?.type === 'quran' && currentTrack.surahNumber) {
        api.quran.saveHistory({
          surah_number: currentTrack.surahNumber,
          surah_name_ar: currentTrack.title,
          surah_name_en: currentTrack.subtitle,
          last_position_seconds: Math.floor(audio.duration || 0),
          completed: true,
        }).catch(() => {});
      }
    };

    const handleError = (e: any) => {
      console.warn('Audio playback error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // Sync speed & volume to native audio
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = playbackSpeed;
      audioElementRef.current.volume = isMuted ? 0 : volume;
    }
  }, [playbackSpeed, volume, isMuted]);

  // Periodic history auto-save for Quran
  useEffect(() => {
    if (!currentTrack || currentTrack.type !== 'quran' || !currentTrack.surahNumber || !isPlaying) return;
    const interval = setInterval(() => {
      if (audioElementRef.current && audioElementRef.current.currentTime > 5) {
        api.quran.saveHistory({
          surah_number: currentTrack.surahNumber,
          surah_name_ar: currentTrack.title,
          surah_name_en: currentTrack.subtitle,
          last_position_seconds: Math.floor(audioElementRef.current.currentTime),
          completed: false,
        }).catch(() => {});
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [currentTrack, isPlaying]);

  const playTrack = (track: GlobalTrack) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setShowMiniPlayer(true);

    if (track.type === 'quran' && track.audioUrl) {
      if (audioElementRef.current) {
        audioElementRef.current.src = track.audioUrl;
        audioElementRef.current.currentTime = 0;
        audioElementRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('Audio play prevented or failed:', err);
          setIsPlaying(false);
        });
      }
    } else if (track.type === 'podcast') {
      // For YouTube podcasts, pause any active HTML5 Quran audio
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      setIsPlaying(true);
      setDuration(track.durationSeconds || 900);
    }
  };

  const togglePlayPause = () => {
    if (!currentTrack) return;

    if (currentTrack.type === 'quran' && audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElementRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const pause = () => {
    if (currentTrack?.type === 'quran' && audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setIsPlaying(false);
  };

  const resume = () => {
    if (currentTrack?.type === 'quran' && audioElementRef.current) {
      audioElementRef.current.play().catch(() => {});
    }
    setIsPlaying(true);
  };

  const seek = (seconds: number) => {
    const target = Math.max(0, Math.min(seconds, duration || 999999));
    setCurrentTime(target);
    if (currentTrack?.type === 'quran' && audioElementRef.current) {
      audioElementRef.current.currentTime = target;
    }
  };

  const seekRelative = (deltaSeconds: number) => {
    seek(currentTime + deltaSeconds);
  };

  const setSpeed = (speed: number) => {
    setPlaybackSpeedState(speed);
  };

  const setVolumeLevel = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolume(clamped);
    if (isMuted && clamped > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const closePlayer = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        playbackSpeed,
        volume,
        isMuted,
        playTrack,
        togglePlayPause,
        pause,
        resume,
        seek,
        seekRelative,
        setSpeed,
        setVolumeLevel,
        toggleMute,
        closePlayer,
        showMiniPlayer,
        setShowMiniPlayer,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return ctx;
}
