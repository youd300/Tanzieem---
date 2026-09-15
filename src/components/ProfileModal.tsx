import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Globe, Clock, Bell, Check, AlertCircle, Shield, Award, Sparkles } from 'lucide-react';
import { useAuth } from '../services/authContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [timezone, setTimezone] = useState('UTC');
  const [dailyTargetHours, setDailyTargetHours] = useState(2);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
      setLanguage(profile.language || 'en');
      setTimezone(profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
      setDailyTargetHours(Math.round((profile.daily_target_minutes || 120) / 60));
      setNotificationsEnabled(profile.notifications_enabled === 1);
    }
  }, [profile, isOpen]);

  if (!isOpen || !profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl.trim(),
        language,
        timezone,
        daily_target_minutes: Math.max(1, dailyTargetHours) * 60,
        notifications_enabled: notificationsEnabled ? 1 : 0,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile changes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-[#080E1C] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.15)] overflow-hidden text-slate-100 max-h-[90vh] flex flex-col"
        >
          {/* Top Bar */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Edit Profile</h3>
                <p className="text-xs text-slate-400">Manage your identity and daily focus goals</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Profile saved and synchronized to database!</span>
              </div>
            )}

            {/* Profile Header Preview */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
              <div className="relative">
                <img
                  src={avatarUrl || PRESET_AVATARS[0]}
                  alt="Avatar"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PRESET_AVATARS[0];
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-white truncate">{name || profile.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Lvl {profile.level}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">@{profile.username}</p>
                <p className="text-[11px] text-cyan-400/90 font-medium mt-0.5 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {profile.title}
                </p>
              </div>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Choose Avatar</label>
              <div className="flex gap-2 mb-2">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${
                      avatarUrl === url ? 'border-cyan-400 scale-105 shadow-[0_0_10px_rgba(0,229,255,0.4)]' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Or paste custom image URL"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Name & Bio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Username (Fixed)</label>
                <input
                  type="text"
                  disabled
                  value={`@${profile.username}`}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Bio / Personal Motto</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Organize Your Time. Build Your Life."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="en">English</option>
                  <option value="ar">العربية (Arabic)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Daily Focus Goal
                </label>
                <select
                  value={dailyTargetHours}
                  onChange={(e) => setDailyTargetHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value={1}>1 Hour / day</option>
                  <option value={2}>2 Hours / day</option>
                  <option value={3}>3 Hours / day</option>
                  <option value={4}>4 Hours / day</option>
                  <option value={6}>6 Hours / day</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                <span className="flex items-center gap-2 font-bold text-slate-200">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  Task & Session Notifications
                </span>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 accent-cyan-500"
                />
              </label>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl font-extrabold text-xs bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
