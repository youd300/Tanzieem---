import React, { useState, useEffect } from 'react';
import {
  Zap,
  Flame,
  Clock,
  ChevronRight,
  Sparkles,
  Play,
  ArrowUpRight,
  BookOpen,
  Headphones,
  Calendar,
  CheckCircle2,
  Circle,
  Coins,
  Target,
  Plus,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../services/authContext';
import { api } from '../services/api';
import { soundEngine } from '../services/soundEngine';

interface HomeDashboardProps {
  onNavigate: (tab: string) => void;
  onStartFocus: (minutes: number, task?: any) => void;
  onOpenCoinLedger: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  onStartFocus,
  onOpenCoinLedger,
}) => {
  const { profile, refreshProfile } = useAuth();
  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [todayHabits, setTodayHabits] = useState<any[]>([]);
  const [activeGoals, setActiveGoals] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Time of day greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const loadDashboardData = async () => {
    try {
      const [tasks, habits, goals, stats] = await Promise.all([
        api.tasks.list().catch(() => []),
        api.habits.list().catch(() => []),
        api.goals.list().catch(() => []),
        api.analytics.get().catch(() => null),
      ]);
      setTodayTasks(tasks.filter((t) => t.status !== 'completed').slice(0, 4));
      setTodayHabits(habits.slice(0, 4));
      setActiveGoals(goals.slice(0, 3));
      setAnalytics(stats);
    } catch (err) {
      console.warn('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggleHabit = async (id: string) => {
    try {
      await api.habits.toggleToday(id);
      soundEngine.playLevelUp();
      await refreshProfile();
      await loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (task: any) => {
    try {
      await api.tasks.complete(task.id);
      soundEngine.playLevelUp();
      await refreshProfile();
      await loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // Real level & XP calculations
  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const xpInCurrentLevel = xp % 100;
  const xpForNextLevel = 100;
  const xpPercent = Math.min(100, Math.round((xpInCurrentLevel / xpForNextLevel) * 100));

  // Today's focus metrics
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayMinutes = analytics?.last7Days?.find((d: any) => d.date === todayDateStr)?.minutes || 0;
  const targetMinutes = profile?.daily_target_minutes || 120;
  const focusPercentage = Math.min(100, Math.round((todayMinutes / targetMinutes) * 100));

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 text-slate-100 pb-28 space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>{greeting}, {profile?.name || 'Explorer'}</span>
            <span className="text-cyan-400">⚡</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {profile?.title || 'Chrono Initiate'} • Organize Your Time. Build Your Life.
          </p>
        </div>

        {/* Level & Coins Header Badges */}
        <div className="flex items-center gap-2.5">
          {/* Coins Pill */}
          <button
            onClick={onOpenCoinLedger}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-xs hover:bg-amber-500/25 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            title="View Real Coin Ledger"
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{profile?.coins ?? 500} Coins</span>
          </button>

          {/* Streak Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-bold text-xs">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>{profile?.streak ?? 0}d streak</span>
          </div>
        </div>
      </div>

      {/* Level XP Progress Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-slate-900/60 border border-cyan-500/20">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-extrabold text-[10px] border border-cyan-500/30">
              LEVEL {level}
            </span>
            <span className="text-slate-300 font-bold">{profile?.title}</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 font-semibold">
            {xpInCurrentLevel} / {xpForNextLevel} XP to Level {level + 1}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(0,229,255,0.4)]"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* Main Focus Sprint Quick-Start Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0a1428] to-[#070e1c] border border-cyan-500/40 shadow-[0_0_30px_rgba(0,229,255,0.15)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
              RAPID FOCUS PROTOCOL
            </span>
            <h2 className="text-lg font-black text-white mt-0.5">Start Deep Work Chamber</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Timer starts strictly at zero • Records authentic seconds to SQLite
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1 rounded-xl">
            {[15, 25, 45, 60].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMinutes(m)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedMinutes === m
                    ? 'bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(0,229,255,0.3)] font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Today's Focus: {todayMinutes}m</p>
              <p className="text-[11px] text-slate-400">Target: {targetMinutes}m ({focusPercentage}% done)</p>
            </div>
          </div>

          <button
            onClick={() => onStartFocus(selectedMinutes)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(0,229,255,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            Launch Chamber ({selectedMinutes}m)
          </button>
        </div>
      </div>

      {/* Quick Navigation Cards: Quran, Podcasts, Planner, Calendar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Quran */}
        <button
          onClick={() => onNavigate('quran')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-extrabold text-white group-hover:text-emerald-300">
            القرآن الكريم
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">114 Surahs • Mishary Alafasy</p>
        </button>

        {/* English Podcasts */}
        <button
          onClick={() => onNavigate('podcasts')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Headphones className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-extrabold text-white group-hover:text-cyan-300">
            English Podcasts
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Listening & Speaking Practice</p>
        </button>

        {/* Daily Planner */}
        <button
          onClick={() => onNavigate('planner')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-950/20 transition-all text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-extrabold text-white group-hover:text-blue-300">
            Daily Planner
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Time blocks & Notes</p>
        </button>

        {/* Analytics */}
        <button
          onClick={() => onNavigate('analytics')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-950/20 transition-all text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-extrabold text-white group-hover:text-purple-300">
            Analytics
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Real database stats</p>
        </button>
      </div>

      {/* Two Column Grid: Today's Tasks & Habits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today's Tasks */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                Active Objectives
              </h3>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <p>No open tasks right now.</p>
                <button
                  onClick={() => onNavigate('tasks')}
                  className="mt-2 text-cyan-400 font-bold"
                >
                  + Add Quest
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="text-slate-500 hover:text-cyan-400 cursor-pointer"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold text-white truncate">{task.title}</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 shrink-0">
                      +{task.xp_reward} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today's Habits */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Daily Habits
              </h3>
              <button
                onClick={() => onNavigate('goals')}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
              >
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayHabits.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <p>No habits configured yet.</p>
                <button
                  onClick={() => onNavigate('goals')}
                  className="mt-2 text-amber-400 font-bold"
                >
                  + Add Daily Habit
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                      habit.completedToday
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        onClick={() => handleToggleHabit(habit.id)}
                        className="cursor-pointer"
                      >
                        {habit.completedToday ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 hover:text-amber-400" />
                        )}
                      </button>
                      <span
                        className={`text-xs font-bold truncate ${
                          habit.completedToday ? 'text-emerald-300' : 'text-white'
                        }`}
                      >
                        {habit.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1 shrink-0">
                      <Flame className="w-3 h-3" />
                      {habit.streak}d
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
