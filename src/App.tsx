/**
 * TANZIEEM
 * Organize Your Time. Build Your Life.
 * Production-Grade PWA + Web App
 * By Yosef Idris
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './services/authContext';
import { AudioProvider } from './services/audioContext';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { GlobalAudioBar } from './components/GlobalAudioBar';

// Views
import { HomeDashboard } from './components/HomeDashboard';
import { TaskQuestsView } from './components/TaskQuestsView';
import { FocusTimerView } from './components/FocusTimerView';
import { QuranView } from './components/QuranView';
import { PodcastView } from './components/PodcastView';
import { DailyPlannerView } from './components/DailyPlannerView';
import { GoalsHabitsView } from './components/GoalsHabitsView';
import { CalendarView } from './components/CalendarView';
import { SanctuaryRoomView } from './components/SanctuaryRoomView';
import { AICoachView } from './components/AICoachView';
import { AnalyticsView } from './components/AnalyticsView';
import { MissionsAchievementsView } from './components/MissionsAchievementsView';

// Modals
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { CoinHistoryModal } from './components/CoinHistoryModal';
import { SettingsModal } from './components/SettingsModal';

import { dataService } from './services/dataService';
import { soundEngine } from './services/soundEngine';

function AppContent() {
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCoinLedgerOpen, setIsCoinLedgerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Focus Timer overlay
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerInitialMinutes, setTimerInitialMinutes] = useState(25);
  const [timerAttachedTask, setTimerAttachedTask] = useState<any>(null);

  // PWA install prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Tanzieem PWA Service Worker active:', reg.scope))
        .catch((err) => console.log('SW registration notice:', err));
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Sync RTL / LTR document direction
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstallPwa(false);
    }
    setDeferredPrompt(null);
  };

  const handleToggleLang = () => {
    soundEngine.playClick();
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const handleStartFocus = (minutes: number, task?: any) => {
    soundEngine.playTimerStart();
    setTimerInitialMinutes(minutes);
    setTimerAttachedTask(task || null);
    setIsTimerOpen(true);
  };

  const getScreenTitle = () => {
    switch (currentTab) {
      case 'home':
        return 'TANZIEEM • Central Command';
      case 'tasks':
        return 'TANZIEEM • Tasks & Objectives';
      case 'focus':
        return 'TANZIEEM • Deep Work Chamber';
      case 'quran':
        return 'TANZIEEM • Holy Quran Recitation';
      case 'podcasts':
        return 'TANZIEEM • English Podcasts & Drills';
      case 'planner':
        return 'TANZIEEM • Chrono Day Planner';
      case 'goals':
        return 'TANZIEEM • Habits & Milestones';
      case 'calendar':
        return 'TANZIEEM • Chrono Calendar';
      case 'space':
        return 'TANZIEEM • Sanctuary Room';
      case 'coach':
        return 'TANZIEEM • AI Advisor Coach';
      case 'stats':
        return 'TANZIEEM • Performance Analytics';
      default:
        return 'TANZIEEM';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070A13] flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
          Initializing Tanzieem Production Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A13] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        title={getScreenTitle()}
        lang={language}
        onToggleLang={handleToggleLang}
        onOpenSettings={() => {
          soundEngine.playClick();
          setIsSettingsOpen(true);
        }}
        onOpenCoinLedger={() => {
          setIsCoinLedgerOpen(true);
        }}
        onOpenProfile={() => {
          setIsProfileModalOpen(true);
        }}
        onOpenAuth={() => {
          setIsAuthModalOpen(true);
        }}
        onInstallPwa={handleInstallPwa}
        canInstallPwa={canInstallPwa}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full max-w-5xl mx-auto transition-all">
        {currentTab === 'home' && (
          <HomeDashboard
            onNavigate={(tab) => setCurrentTab(tab as NavTab)}
            onStartFocus={handleStartFocus}
            onOpenCoinLedger={() => setIsCoinLedgerOpen(true)}
          />
        )}

        {currentTab === 'tasks' && (
          <TaskQuestsView
            onStartFocusWithTask={(task) => handleStartFocus(25, task)}
          />
        )}

        {currentTab === 'focus' && (
          <FocusTimerView
            initialMinutes={25}
            onClose={() => setCurrentTab('home')}
            onSessionFinished={async () => {
              await refreshProfile();
            }}
          />
        )}

        {currentTab === 'quran' && <QuranView />}

        {currentTab === 'podcasts' && <PodcastView />}

        {currentTab === 'planner' && <DailyPlannerView />}

        {currentTab === 'goals' && <GoalsHabitsView />}

        {currentTab === 'calendar' && <CalendarView />}

        {currentTab === 'space' && (
          <SanctuaryRoomView
            user={{
              id: profile?.user_id || 'user',
              name: profile?.name || 'Explorer',
              coins: profile?.coins || 500,
              level: profile?.level || 1,
              xp: profile?.xp || 0,
              streak: profile?.streak || 0,
            } as any}
            lang={language}
            onRefreshUser={refreshProfile}
          />
        )}

        {currentTab === 'coach' && (
          <AICoachView
            user={{
              name: profile?.name || 'Explorer',
              streak: profile?.streak || 0,
              completedTasksTotal: (profile as any)?.completed_tasks_total || 0,
              focusMinutesTotal: (profile as any)?.focus_minutes_total || 0,
            } as any}
            activeTasks={[]}
            lang={language}
          />
        )}

        {currentTab === 'stats' && (
          <div className="space-y-6">
            <MissionsAchievementsView
              user={{
                coins: profile?.coins || 500,
                streak: profile?.streak || 0,
                completedTasksTotal: (profile as any)?.completed_tasks_total || 0,
                focusMinutesTotal: (profile as any)?.focus_minutes_total || 0,
                level: profile?.level || 1,
              } as any}
              lang={language}
              onRefreshUser={refreshProfile}
            />
            <AnalyticsView />
          </div>
        )}
      </main>

      {/* Global Audio Player Bar (Persistent across all routes) */}
      <GlobalAudioBar />

      {/* Footer Splash & Creator Credit */}
      <footer className="w-full py-6 text-center border-t border-slate-900/80 text-xs text-slate-500 pb-24">
        <div className="max-w-md mx-auto space-y-1">
          <p className="font-bold text-slate-400">
            TANZIEEM — Organize Your Time. Build Your Life.
          </p>
          <p className="text-cyan-400 font-semibold tracking-wide">
            Designed & Engineered by Yosef Idris
          </p>
          <p className="text-[10px] text-slate-600 font-mono">
            Full-Stack SQLite Persistence • PWA • Zero Fake Data
          </p>
        </div>
      </footer>

      {/* Floating Bottom Nav */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'focus') {
            handleStartFocus(25);
          } else {
            setCurrentTab(tab);
          }
        }}
        lang={language}
      />

      {/* Fullscreen Focus Timer Overlay when triggered from elsewhere */}
      {isTimerOpen && (
        <FocusTimerView
          attachedTask={timerAttachedTask}
          initialMinutes={timerInitialMinutes}
          onClose={() => setIsTimerOpen(false)}
          onSessionFinished={async () => {
            await refreshProfile();
            setIsTimerOpen(false);
          }}
        />
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            refreshProfile();
          }}
        />
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <ProfileModal
          onClose={() => setIsProfileModalOpen(false)}
          onLogout={() => {
            setIsProfileModalOpen(false);
            refreshProfile();
          }}
        />
      )}

      {/* Coin History Modal */}
      {isCoinLedgerOpen && (
        <CoinHistoryModal
          onClose={() => setIsCoinLedgerOpen(false)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          user={{
            name: profile?.name || 'Explorer',
            email: user?.email || '',
            coins: profile?.coins || 500,
          } as any}
          settings={{
            language,
            soundEnabled: true,
            theme: 'dark',
            notifications: true,
          } as any}
          lang={language}
          onClose={() => setIsSettingsOpen(false)}
          onUpdateSettings={(newSettings: any) => {
            if (newSettings.language) setLanguage(newSettings.language);
          }}
          onUpdateUser={() => {
            refreshProfile();
          }}
          onInstallPwa={handleInstallPwa}
          canInstallPwa={canInstallPwa}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </AuthProvider>
  );
}
