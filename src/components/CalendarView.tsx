import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Flame,
  X,
  Target,
} from 'lucide-react';
import { api } from '../services/api';

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [calendarData, setCalendarData] = useState<any>({ tasks: [], sessions: [], habitLogs: [] });
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const monthString = `${year}-${String(month + 1).padStart(2, '0')}`;

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const data = await api.calendar.get(monthString);
      setCalendarData(data);
    } catch (err) {
      console.warn('Failed to load calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [monthString]);

  // Days in month calculation
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to extract items for a given date YYYY-MM-DD
  const getItemsForDay = (dateStr: string) => {
    const tasks = (calendarData.tasks || []).filter((t: any) => t.due_date === dateStr);
    const sessions = (calendarData.sessions || []).filter((s: any) => {
      const sessionDate = new Date(s.start_timestamp).toISOString().split('T')[0];
      return sessionDate === dateStr;
    });
    const habits = (calendarData.habitLogs || []).filter((h: any) => h.date === dateStr);
    return { tasks, sessions, habits };
  };

  const selectedDayItems = selectedDay ? getItemsForDay(selectedDay) : null;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 text-slate-100 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-cyan-400" />
            Chrono Calendar
          </h1>
          <p className="text-xs text-slate-400">
            Real timeline of tasks due, focus sprints completed, and habit logs
          </p>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-black text-white min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[11px] font-bold text-slate-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Leading empty days */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[90px] rounded-2xl bg-slate-950/20 border border-slate-900/40 opacity-40" />
        ))}

        {/* Actual Month Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isToday = new Date().toISOString().split('T')[0] === dateStr;
          const { tasks, sessions, habits } = getItemsForDay(dateStr);
          const hasActivity = tasks.length > 0 || sessions.length > 0 || habits.length > 0;

          return (
            <div
              key={dayNum}
              onClick={() => setSelectedDay(dateStr)}
              className={`min-h-[70px] sm:min-h-[90px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isToday
                  ? 'bg-cyan-950/30 border-cyan-400/50 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                  : hasActivity
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono font-bold ${
                    isToday ? 'text-cyan-300 font-extrabold' : 'text-slate-300'
                  }`}
                >
                  {dayNum}
                </span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>

              {/* Badges preview */}
              <div className="flex flex-wrap gap-1 mt-1">
                {sessions.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">
                    {sessions.length}⏱
                  </span>
                )}
                {tasks.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                    {tasks.length}✓
                  </span>
                )}
                {habits.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold">
                    {habits.length}🔥
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Details Drawer */}
      <AnimatePresence>
        {selectedDay && selectedDayItems && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#080E1C] border border-cyan-500/30 rounded-3xl p-6 text-slate-100 shadow-[0_0_50px_rgba(0,229,255,0.2)] max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-white">{selectedDay}</h3>
                  <p className="text-[11px] text-slate-400">Activity record for this date</p>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 py-4 overflow-y-auto space-y-4 text-xs">
                {/* Focus sessions */}
                <div>
                  <h4 className="font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Focus Sprints ({selectedDayItems.sessions.length})
                  </h4>
                  {selectedDayItems.sessions.length === 0 ? (
                    <p className="text-[11px] text-slate-500">No focus sprints logged on this date.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedDayItems.sessions.map((s: any) => (
                        <div
                          key={s.id}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-white">{s.task_title || 'Open Focus'}</p>
                            <p className="text-[10px] text-slate-400">{s.actual_minutes} min duration</p>
                          </div>
                          <span className="text-[10px] font-bold text-cyan-300">+{s.xp_earned} XP</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tasks due */}
                <div>
                  <h4 className="font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Tasks Due ({selectedDayItems.tasks.length})
                  </h4>
                  {selectedDayItems.tasks.length === 0 ? (
                    <p className="text-[11px] text-slate-500">No tasks had deadlines on this date.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedDayItems.tasks.map((t: any) => (
                        <div
                          key={t.id}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                        >
                          <p className="font-bold text-white">{t.title}</p>
                          <span className="text-[10px] font-bold text-slate-400 capitalize">{t.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Habits logged */}
                <div>
                  <h4 className="font-bold text-rose-300 mb-2 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    Habits Logged ({selectedDayItems.habits.length})
                  </h4>
                  {selectedDayItems.habits.length === 0 ? (
                    <p className="text-[11px] text-slate-500">No habit check-ins recorded for this date.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedDayItems.habits.map((h: any) => (
                        <div
                          key={h.id}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                        >
                          <p className="font-bold text-white">{h.habit_id}</p>
                          <span className="text-[10px] font-bold text-emerald-400">Completed ✓</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
