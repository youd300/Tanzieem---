import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Search,
  Play,
  Pause,
  Bookmark,
  BookmarkCheck,
  History,
  Info,
  ExternalLink,
  ChevronRight,
  Volume2,
  Check,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { SURAH_LIST, SurahMeta, getSurahAudioUrl, QURAN_ATTRIBUTION } from '../data/quranData';
import { useAudio } from '../services/audioContext';
import { api } from '../services/api';

export const QuranView: React.FC = () => {
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'surahs' | 'bookmarks' | 'history'>('surahs');
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta | null>(null);
  const [surahAyahs, setSurahAyahs] = useState<any[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState(false);

  // Load bookmarks & history from database
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [b, h] = await Promise.all([
        api.quran.getBookmarks().catch(() => []),
        api.quran.getHistory().catch(() => []),
      ]);
      setBookmarks(b);
      setHistory(h);
    } catch (e) {
      console.warn('Failed to fetch quran user data:', e);
    }
  };

  const isBookmarked = (surahNumber: number) => {
    return bookmarks.some((b) => b.surah_number === surahNumber);
  };

  const toggleBookmark = async (surah: SurahMeta) => {
    const existing = bookmarks.find((b) => b.surah_number === surah.number);
    try {
      if (existing) {
        await api.quran.removeBookmark(existing.id);
        setBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
      } else {
        const added = await api.quran.addBookmark({
          surah_number: surah.number,
          surah_name_ar: surah.nameAr,
          surah_name_en: surah.nameEn,
          ayah_number: 1,
          note: `Bookmarked Surah ${surah.nameEn}`,
        });
        setBookmarks((prev) => [added, ...prev]);
      }
    } catch (e) {
      console.error('Bookmark error:', e);
    }
  };

  const handlePlaySurah = (surah: SurahMeta) => {
    const audioUrl = getSurahAudioUrl(surah.number);
    playTrack({
      id: `quran_surah_${surah.number}`,
      type: 'quran',
      title: `سورة ${surah.nameAr}`,
      subtitle: `${surah.nameEn} (${surah.translationEn}) • الشيخ مشاري العفاسي`,
      audioUrl,
      surahNumber: surah.number,
    });

    // Save reading history
    api.quran.saveHistory({
      surah_number: surah.number,
      surah_name_ar: surah.nameAr,
      surah_name_en: surah.nameEn,
      last_position_seconds: 0,
      completed: false,
    }).then(() => loadUserData()).catch(() => {});
  };

  // Open Surah Reader modal
  const openSurahReader = async (surah: SurahMeta) => {
    setSelectedSurah(surah);
    setLoadingAyahs(true);
    try {
      // Dynamic fetch from reliable public AlQuran cloud API (Arabic Simple/Uthmani)
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/ar.alafasy`);
      const data = await res.json();
      if (data?.data?.ayahs) {
        setSurahAyahs(data.data.ayahs);
      } else {
        setSurahAyahs([]);
      }
    } catch (e) {
      console.warn('Failed to load online ayahs:', e);
      setSurahAyahs([]);
    } finally {
      setLoadingAyahs(false);
    }
  };

  const filteredSurahs = SURAH_LIST.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      s.number.toString() === query ||
      s.nameAr.includes(query) ||
      s.nameEn.toLowerCase().includes(query) ||
      s.translationEn.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 text-slate-100 pb-28">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                القرآن الكريم — The Holy Quran
              </h1>
              <p className="text-xs text-slate-400">
                114 Surahs • Mishary Rashid Alafasy Recitations • Verse Reader
              </p>
            </div>
          </div>
        </div>

        {/* Legal Attribution Badge */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 max-w-sm">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {QURAN_ATTRIBUTION.reciter} • {QURAN_ATTRIBUTION.source}
          </span>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        {/* Tabs */}
        <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('surahs')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'surahs'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Surahs ({SURAH_LIST.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'bookmarks'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Bookmarks ({bookmarks.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Recitation History
          </button>
        </div>

        {/* Search */}
        {activeTab === 'surahs' && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or number..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Main Content Areas */}
      {activeTab === 'surahs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSurahs.map((surah) => {
            const isCurrent =
              currentTrack?.type === 'quran' && currentTrack.surahNumber === surah.number;
            const bookmarked = isBookmarked(surah.number);

            return (
              <div
                key={surah.number}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-emerald-950/30 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                } flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center font-mono">
                        {surah.number}
                      </span>
                      <div>
                        <h3 className="text-base font-extrabold text-white font-arabic">
                          سورة {surah.nameAr}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {surah.nameEn} • {surah.translationEn}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleBookmark(surah)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        bookmarked
                          ? 'text-amber-400 hover:text-amber-300'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={bookmarked ? 'Remove Bookmark' : 'Bookmark Surah'}
                    >
                      {bookmarked ? (
                        <BookmarkCheck className="w-4 h-4 fill-amber-400/20" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/60 font-medium">
                      {surah.revelationType}
                    </span>
                    <span>•</span>
                    <span>{surah.totalAyahs} Verses</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => handlePlaySurah(surah)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isCurrent && isPlaying
                        ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-slate-950" />
                        Playing Now
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-emerald-300" />
                        Listen Audio
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => openSurahReader(surah)}
                    className="py-2 px-3 rounded-xl text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Read Verses"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Read
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bookmarks Tab */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-3">
          {bookmarks.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-2xl">
              <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30 text-emerald-400" />
              <h4 className="font-bold text-slate-200">No bookmarks saved yet</h4>
              <p className="text-xs text-slate-500 mt-1">
                Click the bookmark icon on any Surah to save it to your personal persistent list.
              </p>
            </div>
          ) : (
            bookmarks.map((bm) => {
              const surah = SURAH_LIST.find((s) => s.number === bm.surah_number);
              return (
                <div
                  key={bm.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
                      {bm.surah_number}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">
                        سورة {bm.surah_name_ar} ({bm.surah_name_en})
                      </h4>
                      <p className="text-[11px] text-slate-400">{bm.note || 'Saved Bookmark'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {surah && (
                      <button
                        onClick={() => handlePlaySurah(surah)}
                        className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                        title="Listen"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    {surah && (
                      <button
                        onClick={() => openSurahReader(surah)}
                        className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Read"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => surah && toggleBookmark(surah)}
                      className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <BookmarkCheck className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-2xl">
              <History className="w-10 h-10 mx-auto mb-3 opacity-30 text-cyan-400" />
              <h4 className="font-bold text-slate-200">No reading history yet</h4>
              <p className="text-xs text-slate-500 mt-1">
                Your recitation listening sessions and progress will appear here automatically.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const surah = SURAH_LIST.find((s) => s.number === item.surah_number);
              const dateStr = new Date(item.timestamp).toLocaleString();
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs font-mono">
                      {item.surah_number}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">سورة {item.surah_name_ar}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>Last listened: {dateStr}</span>
                        <span>•</span>
                        <span>{item.completed ? 'Completed' : 'In Progress'}</span>
                      </div>
                    </div>
                  </div>

                  {surah && (
                    <button
                      onClick={() => handlePlaySurah(surah)}
                      className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Resume
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Surah Reader Fullscreen / Modal */}
      <AnimatePresence>
        {selectedSurah && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-[#080E1C] border border-emerald-500/30 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.2)] max-h-[92vh] flex flex-col"
            >
              {/* Reader Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedSurah(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="text-lg font-black text-white font-arabic">
                      سورة {selectedSurah.nameAr}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedSurah.nameEn} ({selectedSurah.translationEn}) • {selectedSurah.totalAyahs} Verses
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlaySurah(selectedSurah)}
                    className="py-2 px-3 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Play Recitation
                  </button>
                  <button
                    onClick={() => toggleBookmark(selectedSurah)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Reader Body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 text-right font-arabic leading-loose">
                {/* Basmala (except Surah At-Tawbah 9) */}
                {selectedSurah.number !== 9 && (
                  <div className="text-center py-4 border-b border-slate-800/80 text-2xl sm:text-3xl text-emerald-300 font-arabic">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                )}

                {loadingAyahs ? (
                  <div className="py-16 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs">Loading authentic verses...</p>
                  </div>
                ) : surahAyahs.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    <p className="text-lg mb-2">قراءة سورة {selectedSurah.nameAr}</p>
                    <p className="text-xs text-slate-500">
                      استمع إلى التلاوة العطرة بصوت الشيخ مشاري راشد العفاسي عبر المشغل الصوتي المدمج.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {surahAyahs.map((ayah) => (
                      <div
                        key={ayah.numberInSurah}
                        className="p-3 rounded-xl hover:bg-slate-900/60 transition-colors inline"
                      >
                        <span className="text-xl sm:text-2xl text-slate-100 font-normal leading-loose">
                          {ayah.text}{' '}
                        </span>
                        <span className="inline-flex items-center justify-center w-7 h-7 mx-1 text-xs font-bold text-emerald-400 border border-emerald-500/40 rounded-full font-mono">
                          {ayah.numberInSurah}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
