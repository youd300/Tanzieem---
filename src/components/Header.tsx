import React from 'react';
import { Flame, Coins, Globe, Settings as SettingsIcon, Download, User, LogIn } from 'lucide-react';
import { useAuth } from '../services/authContext';
import { soundEngine } from '../services/soundEngine';

interface HeaderProps {
  title: string;
  lang: 'en' | 'ar';
  onToggleLang: () => void;
  onOpenSettings: () => void;
  onOpenCoinLedger: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onInstallPwa?: () => void;
  canInstallPwa?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  lang,
  onToggleLang,
  onOpenSettings,
  onOpenCoinLedger,
  onOpenProfile,
  onOpenAuth,
  onInstallPwa,
  canInstallPwa,
}) => {
  const { user, profile } = useAuth();

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 w-full bg-[#070A13]/90 backdrop-blur-xl border-b border-cyan-500/10 px-4 py-3 sm:px-6 transition-colors"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand Icon + Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Glowing Squircle Logo */}
          <div className="relative shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-1 border border-cyan-400/30 shadow-[0_0_12px_rgba(0,229,255,0.25)] flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" fill="none">
              <path
                d="M10 10 H30 L22 20 L30 30 H10 L18 20 Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <circle cx="20" cy="20" r="2" fill="#00E5FF" />
              <circle cx="20" cy="25" r="1.5" fill="#38BDF8" />
            </svg>
          </div>

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold tracking-wider text-slate-100 uppercase truncate font-mono flex items-center gap-1.5">
              <span>{title}</span>
            </h1>
            <p className="text-[10px] text-cyan-400/80 font-medium tracking-wide truncate hidden sm:block">
              Organize Your Time. Build Your Life.
            </p>
          </div>
        </div>

        {/* Right: Badges & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* PWA Install Button */}
          {canInstallPwa && onInstallPwa && (
            <button
              onClick={onInstallPwa}
              title="Install Tanzieem App"
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all shadow-[0_0_10px_rgba(0,229,255,0.15)] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Install</span>
            </button>
          )}

          {/* Flame Streak Badge */}
          <div
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.15)]"
            title={`${profile?.streak || 0} Day Streak`}
          >
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-400 animate-pulse" />
            <span className="text-xs font-bold font-mono">{profile?.streak || 0}</span>
          </div>

          {/* Coins Badge (Opens Ledger Modal) */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenCoinLedger();
            }}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.15)] hover:bg-amber-500/20 transition-all cursor-pointer"
            title="Click to view real SQLite coin transactions"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold font-mono">{profile?.coins ?? 500}</span>
          </button>

          {/* User Profile / Auth Button */}
          {user ? (
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenProfile();
              }}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/40 border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
              title="User Profile & Settings"
            >
              <User className="w-4 h-4" />
              <span className="text-[11px] font-bold hidden lg:inline max-w-[80px] truncate">
                {profile?.name || 'Profile'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenAuth();
              }}
              className="px-2.5 py-1 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs hover:bg-cyan-300 transition-all flex items-center gap-1 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="px-2 py-1 rounded-xl text-xs font-semibold text-slate-300 hover:text-cyan-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="uppercase text-[11px] font-mono">{lang === 'en' ? 'عربي' : 'EN'}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
