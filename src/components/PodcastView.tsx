import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Headphones,
  Play,
  Pause,
  Heart,
  History,
  ExternalLink,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Gauge,
  Sparkles,
  Info,
  Clock,
  ListMusic,
} from 'lucide-react';
import { PODCAST_PLAYLISTS, PodcastEpisode, PodcastPlaylist } from '../data/podcastsData';
import { useAudio } from '../services/audioContext';
import { api } from '../services/api';

export const PodcastView: React.FC = () => {
  const { currentTrack, isPlaying, playTrack, togglePlayPause, seekRelative, playbackSpeed, setSpeed } = useAudio();
  const [selectedPlaylist, setSelectedPlaylist] = useState<PodcastPlaylist>(PODCAST_PLAYLISTS[0]);
  const [activeTab, setActiveTab] = useState<'episodes' | 'favorites' | 'history'>('episodes');
  const [activeEpisode, setActiveEpisode] = useState<PodcastEpisode | null>(PODCAST_PLAYLISTS[0].episodes[0]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [f, h] = await Promise.all([
        api.podcasts.getFavorites().catch(() => []),
        api.podcasts.getHistory().catch(() => []),
      ]);
      setFavorites(f);
      setHistory(h);
    } catch (e) {
      console.warn('Failed to load podcast user data:', e);
    }
  };

  const isFavorited = (episodeId: string) => {
    return favorites.some((f) => f.episode_id === episodeId);
  };

  const handleToggleFavorite = async (ep: PodcastEpisode) => {
    try {
      const res = await api.podcasts.toggleFavorite({
        episode_id: ep.id,
        playlist_id: ep.playlistId,
        title: ep.title,
        author: ep.author,
        duration_seconds: ep.durationSeconds,
        thumbnail: ep.thumbnail,
      });
      await loadUserData();
    } catch (e) {
      console.error('Failed to toggle favorite:', e);
    }
  };

  const handlePlayEpisode = (ep: PodcastEpisode) => {
    setActiveEpisode(ep);
    playTrack({
      id: `podcast_${ep.id}`,
      type: 'podcast',
      title: ep.title,
      subtitle: `${ep.author} • English Listening Practice`,
      youtubeId: ep.id,
      thumbnail: ep.thumbnail,
      durationSeconds: ep.durationSeconds,
      originalUrl: ep.youtubeUrl,
    });

    // Record history
    api.podcasts.saveHistory({
      episode_id: ep.id,
      playlist_id: ep.playlistId,
      title: ep.title,
      author: ep.author,
      duration_seconds: ep.durationSeconds,
      last_position_seconds: 0,
      completed: false,
    }).then(() => loadUserData()).catch(() => {});
  };

  const isCurrentEpPlaying = (id: string) => {
    return currentTrack?.type === 'podcast' && currentTrack.youtubeId === id && isPlaying;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 text-slate-100 pb-28">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                English Audio Podcasts
              </h1>
              <p className="text-xs text-slate-400">
                Improve English Listening While You Organize Your Time
              </p>
            </div>
          </div>
        </div>

        {/* Attribution & Legal Notice */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 max-w-md">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Official YouTube IFrame Integration • 100% Legal Embedding</span>
        </div>
      </div>

      {/* Playlist Selector Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {PODCAST_PLAYLISTS.map((pl) => (
          <button
            key={pl.id}
            onClick={() => setSelectedPlaylist(pl)}
            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
              selectedPlaylist.id === pl.id
                ? 'bg-cyan-950/40 border-cyan-400/50 shadow-[0_0_20px_rgba(0,229,255,0.15)]'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                {pl.category}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {pl.episodes.length} Episodes
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-white">{pl.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{pl.subtitle}</p>
          </button>
        ))}
      </div>

      {/* Embedded Audio-First Player Unit (When Episode Selected) */}
      {activeEpisode && (
        <div className="mb-8 p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0a1224] to-[#060c18] border border-cyan-500/30 shadow-[0_0_40px_rgba(0,229,255,0.1)]">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Embedded YouTube Player Container */}
            <div className="w-full lg:w-72 aspect-video sm:aspect-[4/3] lg:aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-lg relative shrink-0">
              <iframe
                id="tanzieem-podcast-player"
                src={`https://www.youtube.com/embed/${activeEpisode.id}?enablejsapi=1&origin=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.origin : ''
                )}`}
                title={activeEpisode.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Episode Details & Audio Controls */}
            <div className="flex-1 w-full text-left">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {selectedPlaylist.author}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleFavorite(activeEpisode)}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      isFavorited(activeEpisode.id)
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Toggle Favorite"
                  >
                    <Heart className={`w-4 h-4 ${isFavorited(activeEpisode.id) ? 'fill-rose-400' : ''}`} />
                  </button>
                  <a
                    href={activeEpisode.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
                    title="Open Original on YouTube"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-black text-white line-clamp-2">
                {activeEpisode.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {activeEpisode.description}
              </p>

              {/* Player Quick Bar */}
              <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => handlePlayEpisode(activeEpisode)}
                  className="px-5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs hover:bg-cyan-300 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.3)] cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  Play Episode
                </button>

                {/* Speed Controls */}
                <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 p-1 rounded-xl">
                  {[0.75, 1, 1.25, 1.5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                        playbackSpeed === s
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium ml-auto">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Duration: {activeEpisode.durationFormatted}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800 w-full sm:w-auto mb-6">
        <button
          onClick={() => setActiveTab('episodes')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'episodes'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Episodes ({selectedPlaylist.episodes.length})
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'favorites'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          Favorites ({favorites.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Listening History
        </button>
      </div>

      {/* Episodes List */}
      {activeTab === 'episodes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {selectedPlaylist.episodes.map((ep) => {
            const isPlayingThis = isCurrentEpPlaying(ep.id);
            const isSelected = activeEpisode?.id === ep.id;

            return (
              <div
                key={ep.id}
                className={`p-4 rounded-2xl border transition-all flex gap-3.5 ${
                  isSelected
                    ? 'bg-cyan-950/30 border-cyan-400/40 shadow-[0_0_20px_rgba(0,229,255,0.1)]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Thumbnail */}
                <div
                  onClick={() => setActiveEpisode(ep)}
                  className="relative w-28 h-20 rounded-xl overflow-hidden bg-black shrink-0 cursor-pointer group"
                >
                  <img
                    src={ep.thumbnail}
                    alt={ep.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 fill-white text-white drop-shadow" />
                  </div>
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-white">
                    {ep.durationFormatted}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => setActiveEpisode(ep)}
                      className="font-bold text-xs text-white line-clamp-2 hover:text-cyan-300 cursor-pointer"
                    >
                      {ep.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{ep.author}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handlePlayEpisode(ep)}
                      className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-cyan-400" />
                      Play Now
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFavorite(ep)}
                        className={`text-slate-400 hover:text-rose-400 transition-colors ${
                          isFavorited(ep.id) ? 'text-rose-400' : ''
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFavorited(ep.id) ? 'fill-rose-400' : ''}`} />
                      </button>
                      <a
                        href={ep.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-slate-300"
                        title="Open on YouTube"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div className="space-y-3">
          {favorites.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-2xl">
              <Heart className="w-10 h-10 mx-auto mb-3 opacity-30 text-rose-400" />
              <h4 className="font-bold text-slate-200">No favorite episodes saved yet</h4>
              <p className="text-xs text-slate-500 mt-1">
                Click the heart icon on any episode to save it to your quick-access favorites.
              </p>
            </div>
          ) : (
            favorites.map((fav) => (
              <div
                key={fav.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {fav.thumbnail && (
                    <img
                      src={fav.thumbnail}
                      alt=""
                      className="w-16 h-10 rounded-lg object-cover bg-black"
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-xs text-white">{fav.title}</h4>
                    <p className="text-[10px] text-slate-400">{fav.author}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const ep = selectedPlaylist.episodes.find((e) => e.id === fav.episode_id);
                      if (ep) handlePlayEpisode(ep);
                    }}
                    className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-2xl">
              <History className="w-10 h-10 mx-auto mb-3 opacity-30 text-cyan-400" />
              <h4 className="font-bold text-slate-200">No podcast listening history yet</h4>
              <p className="text-xs text-slate-500 mt-1">
                When you listen to episodes while organizing your day, your progress is recorded here.
              </p>
            </div>
          ) : (
            history.map((h) => (
              <div
                key={h.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-white">{h.title}</h4>
                  <p className="text-[10px] text-slate-400">{new Date(h.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
