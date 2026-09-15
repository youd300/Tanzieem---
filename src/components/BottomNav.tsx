import React, { useState } from 'react';
import {
  Home,
  CheckSquare,
  Zap,
  BookOpen,
  Calendar,
  MoreHorizontal,
  Headphones,
  Target,
  BarChart3,
  Sparkles,
  Bot,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../services/soundEngine';

export type NavTab =
  | 'home'
  | 'tasks'
  | 'focus'
  | 'quran'
  | 'podcasts'
  | 'planner'
  | 'goals'
  | 'calendar'
  | 'space'
  | 'coach'
  | 'stats';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  lang: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, lang }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const primaryTabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
    {
      id: 'focus',
      label: 'Focus',
      icon: (
        <div className="w-10 h-10 -mt-5 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)] border-2 border-[#070A13]">
          <Zap className="w-5 h-5 fill-slate-950" />
        </div>
      ),
    },
    { id: 'quran', label: 'Quran', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'planner', label: 'Plan', icon: <Calendar className="w-5 h-5" /> },
  ];

  const moreItems: { id: NavTab; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'podcasts', label: 'English Podcasts', desc: 'Listening & speaking drills', icon: <Headphones className="w-4 h-4 text-cyan-400" /> },
    { id: 'goals', label: 'Habits & Goals', desc: 'Streaks and milestones', icon: <Target className="w-4 h-4 text-amber-400" /> },
    { id: 'calendar', label: 'Chrono Calendar', desc: 'Monthly schedule & activity', icon: <Calendar className="w-4 h-4 text-emerald-400" /> },
    { id: 'space', label: 'Sanctuary Room', desc: 'Coin upgrades & aesthetic items', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
    { id: 'stats', label: 'Performance Analytics', desc: 'Authentic SQLite metrics', icon: <BarChart3 className="w-4 h-4 text-blue-400" /> },
    { id: 'coach', label: 'AI Advisor Coach', desc: 'Personal productivity guidance', icon: <Bot className="w-4 h-4 text-pink-400" /> },
  ];

  const isMoreActive = moreItems.some((i) => i.id === currentTab);

  return (
    <>
      {/* More Menu Drawer */}
      <AnimatePresence>
        {showMoreMenu && (
          <div
            onClick={() => setShowMoreMenu(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-end justify-center p-3 pb-20"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#080E1C] border border-cyan-500/30 rounded-3xl p-5 shadow-[0_0_40px_rgba(0,229,255,0.2)] text-slate-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  More Tanzieem Modules
                </h3>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {moreItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      soundEngine.playClick();
                      onSelectTab(item.id);
                      setShowMoreMenu(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      currentTab === item.id
                        ? 'bg-cyan-950/40 border-cyan-400/50 text-cyan-300'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-800/80 w-fit mb-2">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">{item.label}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Bar */}
      <nav
        id="bottom-nav-dock"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#070A13]/95 backdrop-blur-xl border-t border-cyan-500/10 px-2 py-1.5 transition-all"
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          {primaryTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundEngine.playClick();
                  onSelectTab(tab.id);
                }}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                  isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.icon}
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                  {tab.label}
                </span>
                {isActive && tab.id !== 'focus' && (
                  <span className="absolute -bottom-1 w-3.5 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF]" />
                )}
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowMoreMenu(!showMoreMenu);
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
              isMoreActive || showMoreMenu ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">More</span>
            {isMoreActive && (
              <span className="absolute -bottom-1 w-3.5 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF]" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
