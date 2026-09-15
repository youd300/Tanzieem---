import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target,
  Flame,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  TrendingUp,
  Award,
  Calendar,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../services/authContext';
import { soundEngine } from '../services/soundEngine';

export const GoalsHabitsView: React.FC = () => {
  const { refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'habits' | 'goals'>('habits');
  const [habits, setHabits] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // New habit state
  const [habitTitle, setHabitTitle] = useState('');
  const [habitCategory, setHabitCategory] = useState('Study');

  // New goal state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalCategory, setGoalCategory] = useState('Productivity');
  const [goalTarget, setGoalTarget] = useState(10);
  const [goalUnit, setGoalUnit] = useState('chapters');
  const [goalDeadline, setGoalDeadline] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [h, g] = await Promise.all([
        api.habits.list().catch(() => []),
        api.goals.list().catch(() => []),
      ]);
      setHabits(h);
      setGoals(g);
    } catch (err) {
      console.warn('Failed to load habits/goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleHabit = async (habitId: string) => {
    try {
      const updated = await api.habits.toggleToday(habitId);
      soundEngine.playLevelUp();
      await refreshProfile();
      await loadData();
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    try {
      await api.habits.create({
        title: habitTitle.trim(),
        category: habitCategory,
      });
      setHabitTitle('');
      setShowHabitModal(false);
      soundEngine.playUiClick();
      await loadData();
    } catch (err) {
      console.error('Failed to create habit:', err);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    try {
      await api.habits.delete(id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete habit:', err);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    try {
      await api.goals.create({
        title: goalTitle.trim(),
        description: goalDescription.trim(),
        category: goalCategory,
        targetValue: Number(goalTarget) || 1,
        unit: goalUnit.trim() || 'units',
        deadline: goalDeadline || null,
      });
      setGoalTitle('');
      setGoalDescription('');
      setShowGoalModal(false);
      soundEngine.playUiClick();
      await loadData();
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  };

  const handleUpdateGoalProgress = async (goal: any, delta: number) => {
    const newProgress = Math.max(0, (goal.current_value || 0) + delta);
    const isCompleted = newProgress >= goal.target_value;
    try {
      await api.goals.update(goal.id, {
        currentValue: newProgress,
        status: isCompleted ? 'completed' : 'active',
      });
      if (isCompleted && goal.status !== 'completed') {
        soundEngine.playLevelUp();
        await refreshProfile();
      }
      await loadData();
    } catch (err) {
      console.error('Failed to update goal progress:', err);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.goals.delete(id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 text-slate-100 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-cyan-400" />
            Habits & Long-Term Goals
          </h1>
          <p className="text-xs text-slate-400">
            Build unshakeable daily streaks & conquer ambitious life milestones
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('habits')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'habits'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Daily Habits ({habits.length})
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'goals'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            Milestone Goals ({goals.length})
          </button>
        </div>
      </div>

      {/* Habits Tab Content */}
      {activeTab === 'habits' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-400 font-semibold">
              Check in daily to build streak multipliers and gain +15 XP per habit.
            </span>
            <button
              onClick={() => setShowHabitModal(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs hover:bg-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.3)]"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Habit
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading habits...</div>
          ) : habits.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500">
              <Flame className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-400" />
              <p className="text-xs font-bold text-slate-300">No active habits yet.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Start small: "15 min Daily Reading", "Morning Quran Recitation", or "Workout".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {habits.map((h) => {
                const isCompletedToday = h.completedToday;
                return (
                  <div
                    key={h.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCompletedToday
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => handleToggleHabit(h.id)}
                        className="text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
                      >
                        {isCompletedToday ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <h4
                          className={`text-xs font-extrabold text-white truncate ${
                            isCompletedToday ? 'text-emerald-300' : ''
                          }`}
                        >
                          {h.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                            {h.category}
                          </span>
                          <span className="flex items-center gap-1 font-bold text-amber-400">
                            <Flame className="w-3 h-3" />
                            {h.streak} day streak
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteHabit(h.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Goals Tab Content */}
      {activeTab === 'goals' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-400 font-semibold">
              Track multi-step milestones with clear quantitative goals.
            </span>
            <button
              onClick={() => setShowGoalModal(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs hover:bg-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.3)]"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Goal
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading goals...</div>
          ) : goals.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500">
              <Target className="w-10 h-10 mx-auto mb-2 opacity-30 text-cyan-400" />
              <p className="text-xs font-bold text-slate-300">No active goals yet.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Define measurable targets: "Read 10 Books", "Complete 50 Focus Sprints".
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((g) => {
                const progressPct = Math.min(
                  100,
                  Math.round(((g.current_value || 0) / (g.target_value || 1)) * 100)
                );
                const isCompleted = g.status === 'completed' || progressPct >= 100;

                return (
                  <div
                    key={g.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{g.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
                            {g.category}
                          </span>
                        </div>
                        {g.description && (
                          <p className="text-xs text-slate-400 mt-0.5">{g.description}</p>
                        )}
                      </div>

                      {/* Progress incrementers */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => handleUpdateGoalProgress(g, -1)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-bold text-xs"
                        >
                          -1
                        </button>
                        <span className="text-xs font-bold text-cyan-300 min-w-[60px] text-center font-mono">
                          {g.current_value} / {g.target_value} {g.unit}
                        </span>
                        <button
                          onClick={() => handleUpdateGoalProgress(g, 1)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 font-bold text-xs"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(g.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                      <span>{progressPct}% Completed</span>
                      {g.deadline && <span>Deadline: {g.deadline}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showHabitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#080E1C] border border-cyan-500/30 rounded-3xl p-6 text-slate-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-extrabold text-white">Create Daily Habit</h3>
                <button
                  onClick={() => setShowHabitModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateHabit} className="py-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Habit Title *</label>
                  <input
                    type="text"
                    required
                    value={habitTitle}
                    onChange={(e) => setHabitTitle(e.target.value)}
                    placeholder="e.g. 20 Minutes English Shadowing Practice"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Study">Study & English</option>
                    <option value="Spiritual">Spiritual & Quran</option>
                    <option value="Productivity">Deep Work</option>
                    <option value="Health">Health & Fitness</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-800 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowHabitModal(false)}
                    className="flex-1 py-2.5 rounded-xl font-bold bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl font-extrabold bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                  >
                    Create Habit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#080E1C] border border-cyan-500/30 rounded-3xl p-6 text-slate-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-extrabold text-white">Create Milestone Goal</h3>
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="py-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Goal Title *</label>
                  <input
                    type="text"
                    required
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="e.g. Master TypeScript Deep Dive"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Target Number</label>
                    <input
                      type="number"
                      min={1}
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Unit</label>
                    <input
                      type="text"
                      value={goalUnit}
                      onChange={(e) => setGoalUnit(e.target.value)}
                      placeholder="chapters, hours, tasks"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowGoalModal(false)}
                    className="flex-1 py-2.5 rounded-xl font-bold bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl font-extrabold bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                  >
                    Create Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
