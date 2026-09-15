import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, AlertTriangle, Calendar, Clock, Loader2 } from 'lucide-react';
import { AICoachMessage, UserProfile, TaskQuest, AppLanguage } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { dataService } from '../services/dataService';
import { soundEngine } from '../services/soundEngine';
import { CompanionAvatar } from './CompanionAvatar';

interface AICoachViewProps {
  user: UserProfile;
  activeTasks: TaskQuest[];
  lang: AppLanguage;
}

export const AICoachView: React.FC<AICoachViewProps> = ({ user, activeTasks, lang }) => {
  const t = TRANSLATIONS[lang];
  const [messages, setMessages] = useState<AICoachMessage[]>(() => dataService.getCoachMessages());
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt || loading) return;

    soundEngine.playClick();
    setInputText('');

    // Add user message to UI
    const userMsg = dataService.addCoachMessage({
      sender: 'user',
      text: prompt,
    });
    setMessages([...dataService.getCoachMessages()]);
    setLoading(true);

    try {
      // Calculate overload metrics from real user data
      const totalEstimatedTaskMinutes = activeTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);

      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          userContext: {
            name: user.name,
            level: user.level,
            title: user.title,
            focusMinutes: user.focusMinutesTotal,
            dailyTarget: user.dailyTargetMinutes,
            streak: user.streak,
            focusArea: user.focusArea,
            totalEstimatedTaskMinutes,
            activeTasksCount: activeTasks.length,
          },
        }),
      });

      const data = await response.json();
      const replyText = data.reply || 'Continue with your single highest-impact priority.';

      dataService.addCoachMessage({
        sender: 'assistant',
        text: replyText,
      });
      setMessages([...dataService.getCoachMessages()]);
    } catch (err) {
      console.warn('AI coach fetch error:', err);
      dataService.addCoachMessage({
        sender: 'assistant',
        text: 'Prioritize your single highest-leverage task: "Finalize Mobile UI Design System". Commit to a 25-minute Pomodoro sprint.',
      });
      setMessages([...dataService.getCoachMessages()]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-coach-view" className="flex flex-col h-[calc(100vh-180px)] min-h-[480px] max-h-[750px] pb-4">
      {/* Coach Header banner */}
      <div className="glass-panel rounded-2xl p-3.5 mb-3 border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>{t.aiCoach}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-400">
              Personalized time-blocking, cognitive overload detection & flow optimization
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-cyan-300 text-xs font-semibold border border-slate-800">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Gemini Intelligence</span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        {[
          { label: '⚡ Build my morning flow', prompt: 'Please build an optimal 2-hour morning flow schedule for my active design quests.' },
          { label: '⚠️ I feel overloaded today', prompt: 'I feel overloaded with tasks. Can you analyze my workload and recommend what to cut or defer?' },
          { label: '⏱ Suggest optimal Pomodoro plan', prompt: 'What duration intervals (25m vs 50m) should I use today based on my focus fatigue?' },
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip.prompt)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/30 whitespace-nowrap transition-all font-medium flex-shrink-0"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-950/40 border border-slate-900/80">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {!isUser ? (
                <div className="flex-shrink-0 mt-1">
                  <CompanionAvatar size={34} mood="focus" withGlow={false} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1 border border-cyan-500/30">
                  {user.name.charAt(0)}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  isUser
                    ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800/80 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold p-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Chrono Coach is formulating focus recommendation...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.askCoachPlaceholder}
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="p-3 rounded-2xl font-bold bg-cyan-400 text-slate-950 disabled:opacity-40 hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
