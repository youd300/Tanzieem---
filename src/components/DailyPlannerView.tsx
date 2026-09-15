import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Save,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';
import { soundEngine } from '../services/soundEngine';

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export const DailyPlannerView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New block form
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:00');
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const fetchDayPlan = async (dateStr: string) => {
    setLoading(true);
    try {
      const plan = await api.dailyPlan.get(dateStr);
      setTimeBlocks(plan?.timeBlocks || []);
      setNotes(plan?.notes || '');
    } catch (err) {
      console.warn('Failed to load day plan:', err);
      setTimeBlocks([]);
      setNotes('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDayPlan(selectedDate);
  }, [selectedDate]);

  const handleSave = async (blocks = timeBlocks, currentNotes = notes) => {
    setSaving(true);
    try {
      await api.dailyPlan.save({
        date: selectedDate,
        timeBlocks: blocks,
        notes: currentNotes,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save daily plan:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newBlock: TimeBlock = {
      id: `block_${Date.now()}`,
      startTime: newStart,
      endTime: newEnd,
      title: newTitle.trim(),
      completed: false,
      priority: newPriority,
    };

    const updated = [...timeBlocks, newBlock].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
    setTimeBlocks(updated);
    setNewTitle('');
    setShowAddBlock(false);
    soundEngine.playUiClick();
    handleSave(updated, notes);
  };

  const handleToggleComplete = (id: string) => {
    const updated = timeBlocks.map((b) =>
      b.id === id ? { ...b, completed: !b.completed } : b
    );
    setTimeBlocks(updated);
    soundEngine.playUiClick();
    handleSave(updated, notes);
  };

  const handleDeleteBlock = (id: string) => {
    const updated = timeBlocks.filter((b) => b.id !== id);
    setTimeBlocks(updated);
    handleSave(updated, notes);
  };

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 text-slate-100 pb-28">
      {/* Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-cyan-400" />
            Daily Chrono Planner
          </h1>
          <p className="text-xs text-slate-400">
            Structure your day into intentional focus blocks & reflect on milestones
          </p>
        </div>

        {/* Date Selector Controls */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => shiftDate(-1)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-cyan-300 px-2 py-1 focus:outline-none"
          />
          <button
            onClick={() => shiftDate(1)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Blocks Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-extrabold text-white">Time Blocks Schedule</h2>
              <span className="text-[10px] text-slate-500 font-medium">({timeBlocks.length} blocks)</span>
            </div>
            <button
              onClick={() => setShowAddBlock(!showAddBlock)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Block
            </button>
          </div>

          {/* Add Block Form Drawer */}
          <AnimatePresence>
            {showAddBlock && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddBlock}
                className="p-4 rounded-2xl bg-[#080E1C] border border-cyan-500/40 space-y-3 overflow-hidden text-xs"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Start Time</label>
                    <input
                      type="time"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">End Time</label>
                    <input
                      type="time"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Block Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Deep Work: Algorithm Analysis"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewPriority(p)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                          newPriority === p
                            ? 'bg-cyan-400 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddBlock(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-cyan-400 text-slate-950 font-black"
                    >
                      Save Block
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Blocks List */}
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading daily plan...</div>
          ) : timeBlocks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30 text-cyan-400" />
              <p className="text-xs font-semibold">No time blocks scheduled for this day.</p>
              <p className="text-[11px] text-slate-500 mt-1">Plan your hours to maintain cognitive focus.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {timeBlocks.map((block) => (
                <div
                  key={block.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    block.completed
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => handleToggleComplete(block.id)}
                      className="text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
                    >
                      {block.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono font-bold text-cyan-300">
                          {block.startTime} – {block.endTime}
                        </span>
                        <h4
                          className={`text-xs font-bold text-white truncate ${
                            block.completed ? 'line-through text-slate-500' : ''
                          }`}
                        >
                          {block.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Notes & Reflections Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-extrabold text-white">Day Notes & Reflections</h2>
            </div>
            {savedSuccess && (
              <span className="text-[10px] font-bold text-emerald-400">Saved to DB!</span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col h-[320px]">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record daily insights, blockers, achievements, and grateful reflections..."
              className="w-full flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
            />
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs hover:bg-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Plan & Notes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
