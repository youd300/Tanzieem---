import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles,
  Coins,
  Flame,
  Clock,
  ArrowLeft,
  X,
  Target,
  Trophy,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../services/authContext';
import { soundEngine } from '../services/soundEngine';

interface FocusTimerViewProps {
  initialMinutes?: number;
  initialTask?: { id: string; title: string } | null;
  onClose?: () => void;
  onSessionFinished?: () => void;
}

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  initialMinutes = 25,
  initialTask = null,
  onClose,
  onSessionFinished,
}) => {
  const { profile, refreshProfile } = useAuth();

  // Mode: 'pomodoro' (countdown from preset) or 'stopwatch' (counts up from 00:00:00)
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [selectedMinutes, setSelectedMinutes] = useState<number>(initialMinutes);

  // Accurate timestamp state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0); // STRICTLY STARTS AT 0
  const [lastStartTimestamp, setLastStartTimestamp] = useState<number | null>(null);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState<number>(0);

  // Soundscape
  const [activeSoundscape, setActiveSoundscape] = useState<string>('none');
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

  // Task linking
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<{ id: string; title: string } | null>(initialTask);

  // Completion modal state
  const [completedResult, setCompletedResult] = useState<{
    actualSeconds: number;
    actualMinutes: number;
    xpEarned: number;
    coinsEarned: number;
  } | null>(null);
  const [savingSession, setSavingSession] = useState(false);

  // Fetch available tasks to link
  useEffect(() => {
    api.tasks.list().then((list) => {
      setTasks(list.filter((t) => t.status !== 'completed'));
    }).catch(() => {});
  }, []);

  // Timestamp-based accurate timer loop
  useEffect(() => {
    if (!isRunning || !lastStartTimestamp) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const currentSegment = Math.floor((now - lastStartTimestamp) / 1000);
      const totalElapsed = accumulatedSeconds + currentSegment;
      setElapsedSeconds(totalElapsed);

      // In pomodoro mode, check if target reached
      if (timerMode === 'pomodoro') {
        const targetSeconds = selectedMinutes * 60;
        if (totalElapsed >= targetSeconds) {
          handleAutoFinish(totalElapsed);
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isRunning, lastStartTimestamp, accumulatedSeconds, timerMode, selectedMinutes]);

  const handleStart = () => {
    setIsRunning(true);
    setLastStartTimestamp(Date.now());
    soundEngine.playUiClick();
  };

  const handlePause = () => {
    if (!isRunning) return;
    const now = Date.now();
    const currentSegment = lastStartTimestamp ? Math.floor((now - lastStartTimestamp) / 1000) : 0;
    const newTotal = accumulatedSeconds + currentSegment;
    setAccumulatedSeconds(newTotal);
    setElapsedSeconds(newTotal);
    setIsRunning(false);
    setLastStartTimestamp(null);
    soundEngine.playUiClick();
  };

  const handleReset = () => {
    setIsRunning(false);
    setLastStartTimestamp(null);
    setAccumulatedSeconds(0);
    setElapsedSeconds(0); // STRICT RESET TO 00:00:00
    soundEngine.playUiClick();
  };

  const handleAutoFinish = async (finalSeconds: number) => {
    setIsRunning(false);
    setLastStartTimestamp(null);
    soundEngine.playLevelUp();
    await saveSession(finalSeconds);
  };

  const handleFinishManual = async () => {
    if (elapsedSeconds < 5) {
      alert('Focus session too short (under 5 seconds) to record rewards.');
      handleReset();
      return;
    }
    setIsRunning(false);
    setLastStartTimestamp(null);
    await saveSession(elapsedSeconds);
  };

  const saveSession = async (seconds: number) => {
    setSavingSession(true);
    try {
      const res = await api.timer.finish({
        actualSeconds: seconds,
        taskId: selectedTask?.id,
        taskTitle: selectedTask?.title || 'Open Focus Session',
        plannedMinutes: timerMode === 'pomodoro' ? selectedMinutes : undefined,
      });

      setCompletedResult({
        actualSeconds: res.actualSeconds,
        actualMinutes: res.actualMinutes,
        xpEarned: res.xpEarned,
        coinsEarned: res.coinsEarned,
      });

      await refreshProfile();
      if (onSessionFinished) onSessionFinished();
    } catch (err: any) {
      console.error('Failed to save focus session:', err);
      alert('Error saving session: ' + err.message);
    } finally {
      setSavingSession(false);
    }
  };

  // Display calculations
  let displayMinutes = 0;
  let displaySeconds = 0;

  if (timerMode === 'stopwatch') {
    displayMinutes = Math.floor(elapsedSeconds / 60);
    displaySeconds = elapsedSeconds % 60;
  } else {
    // Pomodoro countdown
    const targetSeconds = selectedMinutes * 60;
    const remaining = Math.max(0, targetSeconds - elapsedSeconds);
    displayMinutes = Math.floor(remaining / 60);
    displaySeconds = remaining % 60;
  }

  const formatTime = (min: number, sec: number) => {
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Calculate circular progress
  const targetTotal = timerMode === 'pomodoro' ? selectedMinutes * 60 : 3600;
  const progressPercent = Math.min(100, (elapsedSeconds / targetTotal) * 100);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100 relative">
      {/* Top Header Controls */}
      <div className="w-full max-w-xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Focus Chrono Chamber
            </h2>
            <p className="text-[11px] text-slate-400">Timestamp-accurate • Real XP & Coin Rewards</p>
          </div>
        </div>

        {/* Real Profile Stats */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold">
          <span className="flex items-center gap-1 text-amber-400">
            <Coins className="w-3.5 h-3.5" />
            {profile?.coins ?? 500}
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-cyan-400">
            <Flame className="w-3.5 h-3.5" />
            {profile?.streak ?? 0}d
          </span>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="w-full max-w-md flex p-1 rounded-xl bg-slate-950 border border-slate-800 mb-6">
        <button
          onClick={() => {
            if (!isRunning) {
              setTimerMode('pomodoro');
              handleReset();
            }
          }}
          disabled={isRunning}
          className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
            timerMode === 'pomodoro'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pomodoro Sprint
        </button>
        <button
          onClick={() => {
            if (!isRunning) {
              setTimerMode('stopwatch');
              handleReset();
            }
          }}
          disabled={isRunning}
          className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
            timerMode === 'stopwatch'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Open Stopwatch (00:00:00)
        </button>
      </div>

      {/* Duration presets (if Pomodoro) */}
      {timerMode === 'pomodoro' && (
        <div className="flex items-center gap-2 mb-6">
          {[15, 25, 45, 60].map((mins) => (
            <button
              key={mins}
              disabled={isRunning}
              onClick={() => {
                setSelectedMinutes(mins);
                handleReset();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                selectedMinutes === mins
                  ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
              } disabled:opacity-50`}
            >
              {mins}m
            </button>
          ))}
        </div>
      )}

      {/* Main Circular Clock Display */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center mb-8">
        {/* SVG Progress Ring */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
            className="text-slate-800/80"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={276.4}
            strokeDashoffset={276.4 - (276.4 * progressPercent) / 100}
            strokeLinecap="round"
            className="text-cyan-400 transition-all duration-300 shadow-[0_0_20px_rgba(0,229,255,0.5)]"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400/90 mb-1">
            {isRunning ? 'CHAMBER ACTIVE' : elapsedSeconds > 0 ? 'CHAMBER PAUSED' : 'READY TO FOCUS'}
          </span>
          <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_25px_rgba(0,229,255,0.4)]">
            {formatTime(displayMinutes, displaySeconds)}
          </div>
          <span className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-medium">
            Elapsed: {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
          </span>

          {/* Reward prediction */}
          <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <Sparkles className="w-3 h-3 text-amber-400" />
            +1 XP/min • 10 Coins/25m
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleReset}
          disabled={elapsedSeconds === 0 && !isRunning}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Reset back to 00:00:00"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {!isRunning ? (
          <button
            onClick={handleStart}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            {elapsedSeconds === 0 ? 'START FOCUS' : 'RESUME'}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-8 py-4 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <Pause className="w-5 h-5 fill-slate-950" />
            PAUSE
          </button>
        )}

        <button
          onClick={handleFinishManual}
          disabled={elapsedSeconds < 5 || savingSession}
          className="px-5 py-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs hover:bg-emerald-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          <CheckCircle2 className="w-4 h-4" />
          {savingSession ? 'Saving...' : 'Finish & Save'}
        </button>
      </div>

      {/* Task Linking Card */}
      <div className="w-full max-w-md p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            Link to Active Task
          </span>
          {selectedTask && (
            <button
              onClick={() => setSelectedTask(null)}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>

        {tasks.length === 0 ? (
          <p className="text-[11px] text-slate-500">No open tasks right now. Focusing on general productivity.</p>
        ) : (
          <select
            value={selectedTask?.id || ''}
            onChange={(e) => {
              const t = tasks.find((item) => item.id === e.target.value);
              setSelectedTask(t ? { id: t.id, title: t.title } : null);
            }}
            className="w-full p-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="">-- Focus on General Session --</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title} ({task.priority})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Celebration Completion Modal */}
      <AnimatePresence>
        {completedResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-[#080E1C] border border-cyan-400/40 rounded-3xl p-6 text-center text-slate-100 shadow-[0_0_60px_rgba(0,229,255,0.3)] relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(0,229,255,0.5)]">
                <Trophy className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-black text-white">Chamber Sprint Completed!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your focused time has been permanently etched into your database ledger.
              </p>

              {/* Reward stats */}
              <div className="grid grid-cols-3 gap-3 my-6">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Time</span>
                  <span className="text-sm font-black text-white">{completedResult.actualMinutes} min</span>
                </div>
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <span className="text-[10px] text-cyan-400 block font-semibold">XP Earned</span>
                  <span className="text-sm font-black text-cyan-300">+{completedResult.xpEarned}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <span className="text-[10px] text-amber-400 block font-semibold">Coins Earned</span>
                  <span className="text-sm font-black text-amber-300">+{completedResult.coinsEarned}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setCompletedResult(null);
                  handleReset();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,229,255,0.3)]"
              >
                Claim Rewards & Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
