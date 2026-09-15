import React from 'react';
import {
  X,
  Globe,
  Volume2,
  VolumeX,
  Download,
  Shield,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, AppSettings, AppLanguage } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { dataService } from '../services/dataService';
import { soundEngine } from '../services/soundEngine';

interface SettingsModalProps {
  user: UserProfile;
  settings: AppSettings;
  lang: AppLanguage;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onUpdateUser: (newUser: Partial<UserProfile>) => void;
  onInstallPwa?: () => void;
  canInstallPwa?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  settings,
  lang,
  onClose,
  onUpdateSettings,
  onUpdateUser,
  onInstallPwa,
  canInstallPwa,
}) => {
  const t = TRANSLATIONS[lang];

  const handleToggleSound = () => {
    const updated = !settings.soundEnabled;
    soundEngine.setSoundEnabled(updated);
    onUpdateSettings({ soundEnabled: updated });
  };

  const handleResetData = () => {
    if (window.confirm('Reset local progress to default setup?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-[#070A13]/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="max-w-md w-full glass-panel-glow rounded-3xl p-6 sm:p-7 space-y-5 border-cyan-400/30 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-100">{t.settings}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Language Selection */}
          <div className="glass-panel rounded-2xl p-3.5 space-y-2">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Language / اللغة</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ language: 'en' })}
                className={`py-2 px-3 rounded-xl font-bold transition-all border ${
                  settings.language === 'en'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                English (LTR)
              </button>
              <button
                onClick={() => onUpdateSettings({ language: 'ar' })}
                className={`py-2 px-3 rounded-xl font-bold transition-all border ${
                  settings.language === 'ar'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                العربية (RTL)
              </button>
            </div>
          </div>

          {/* Sound & Audio Synth */}
          <div className="glass-panel rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <span>Procedural Web Audio Synthesizer</span>
              </label>
              <button
                onClick={handleToggleSound}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                  settings.soundEnabled
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.soundEnabled ? 'Enabled' : 'Muted'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Generates chimes, level-up fanfares, and ambient soundscapes entirely in-browser without network requests.
            </p>
          </div>

          {/* PWA & Offline Status */}
          <div className="glass-panel rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>PWA & Offline Resilience</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Service Worker caches core assets. All user progress, timers, and quests survive offline states and device restarts.
            </p>
            {canInstallPwa && onInstallPwa && (
              <button
                onClick={onInstallPwa}
                className="w-full mt-2 py-2 px-3 rounded-xl font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.installPwa}</span>
              </button>
            )}
          </div>

          {/* User Profile Daily Target */}
          <div className="glass-panel rounded-2xl p-3.5 space-y-2">
            <label className="font-bold text-slate-300 block">
              Daily Target Hours: <span className="text-cyan-400">{user.dailyTargetMinutes / 60}h</span>
            </label>
            <input
              type="range"
              min="60"
              max="480"
              step="30"
              value={user.dailyTargetMinutes}
              onChange={(e) => onUpdateUser({ dailyTargetMinutes: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Data Reset */}
          <div className="pt-2 flex justify-between items-center text-slate-500 text-[11px]">
            <span>Need to start fresh?</span>
            <button
              onClick={handleResetData}
              className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* Creator Credit (Mandatory Location: Settings -> About) */}
        <div className="pt-3 border-t border-slate-800/80 text-center space-y-1">
          <p className="text-xs text-slate-400 font-medium">
            TANZIEEM — Organize Your Time. Build Your Life.
          </p>
          <p className="creator-credit text-sm text-cyan-400/90 font-medium tracking-wide">
            {t.creatorCredit}
          </p>
        </div>
      </div>
    </div>
  );
};
