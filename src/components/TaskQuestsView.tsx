import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  Play,
  Trash2,
  Tag,
  AlertCircle,
  Calendar,
  X,
  Edit2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../services/authContext';
import { soundEngine } from '../services/soundEngine';

interface TaskQuestsViewProps {
  onStartFocusWithTask: (task: { id: string; title: string }) => void;
}

export const TaskQuestsView: React.FC<TaskQuestsViewProps> = ({ onStartFocusWithTask }) => {
  const { refreshProfile } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('in_progress');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [category, setCategory] = useState('Productivity');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [subtasksInput, setSubtasksInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await api.tasks.list();
      setTasks(data);
    } catch (err) {
      console.warn('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleOpenCreate = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('Productivity');
    setDueDate(new Date().toISOString().split('T')[0]);
    setEstimatedMinutes(30);
    setSubtasksInput('');
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (task: any) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setCategory(task.category);
    setDueDate(task.due_date || '');
    setEstimatedMinutes(task.estimated_minutes || 30);
    const subtaskTitles = Array.isArray(task.subtasks)
      ? task.subtasks.map((st: any) => st.title).join('\n')
      : '';
    setSubtasksInput(subtaskTitles);
    setFormError(null);
    setShowModal(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Task title is required');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const subtasks = subtasksInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((t, idx) => ({ id: `sub_${idx}`, title: t, completed: false }));

    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      dueDate: dueDate || null,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      subtasks,
    };

    try {
      if (editingTaskId) {
        await api.tasks.update(editingTaskId, payload);
      } else {
        await api.tasks.create(payload);
        soundEngine.playUiClick();
      }
      setShowModal(false);
      await fetchTasks();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (task: any) => {
    try {
      if (task.status === 'completed') {
        await api.tasks.reopen(task.id);
      } else {
        await api.tasks.complete(task.id);
        soundEngine.playLevelUp();
        await refreshProfile();
      }
      await fetchTasks();
    } catch (err) {
      console.error('Failed to toggle complete:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.tasks.delete(id);
      await fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'in_progress' && t.status === 'completed') return false;
    if (statusFilter === 'completed' && t.status !== 'completed') return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 text-slate-100 pb-28">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            Task Quests & Objectives
          </h1>
          <p className="text-xs text-slate-400">
            Organize actionable missions • Earn XP and Coins on real completion
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Task
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        {/* Status filters */}
        <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              statusFilter === 'in_progress'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              statusFilter === 'completed'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading database tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <Zap className="w-10 h-10 mx-auto mb-3 opacity-30 text-cyan-400" />
          <h3 className="font-bold text-slate-200">No tasks in this view</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Create your first quest to start building momentum and earning XP and Coins.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition-colors"
          >
            + Create First Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-70'
                    : 'bg-slate-900/75 border-slate-800 hover:border-slate-700'
                } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
              >
                {/* Left: Checkbox & Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3
                        className={`font-bold text-sm text-white ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          task.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : task.priority === 'high'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                        {task.category}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 line-clamp-1 mb-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          {task.due_date}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {task.estimated_minutes} min est.
                      </span>
                      <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                        <Sparkles className="w-3 h-3" />
                        +{task.xp_reward} XP • +{task.coin_reward} Coins
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  {!isCompleted && (
                    <button
                      onClick={() => onStartFocusWithTask({ id: task.id, title: task.title })}
                      className="px-3 py-1.5 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs hover:bg-cyan-300 transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,229,255,0.3)] cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      Focus
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Edit Task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#080E1C] border border-cyan-500/30 rounded-3xl p-6 text-slate-100 shadow-[0_0_60px_rgba(0,229,255,0.2)] max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="text-base font-extrabold text-white">
                  {editingTaskId ? 'Edit Task Quest' : 'Create New Task Quest'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="py-4 space-y-4 overflow-y-auto text-xs">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Master React Concurrency & Server Actions"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Key deliverables and milestones..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Productivity">Productivity</option>
                      <option value="Study">Study & Knowledge</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Health">Health & Fitness</option>
                      <option value="Spiritual">Spiritual & Quran</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Estimated Minutes</label>
                    <input
                      type="number"
                      min={5}
                      max={480}
                      value={estimatedMinutes}
                      onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Subtasks (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={subtasksInput}
                    onChange={(e) => setSubtasksInput(e.target.value)}
                    placeholder="Step 1: Read documentation&#10;Step 2: Write test cases&#10;Step 3: Deploy"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-mono text-xs"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl font-extrabold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingTaskId ? 'Update Task' : 'Create Task'}
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
