import React, { useState } from 'react';
import {
  Trophy,
  Target,
  Zap,
  Coins,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  Sparkles,
} from 'lucide-react';
import { Mission, Achievement, UserProfile, AppLanguage } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { dataService } from '../services/dataService';
import { soundEngine } from '../services/soundEngine';

interface MissionsAchievementsViewProps {
  user: UserProfile;
  lang: AppLanguage;
  onRefreshUser: () => void;
}

export const MissionsAchievementsView: React.FC<MissionsAchievementsViewProps> = ({
  user,
  lang,
  onRefreshUser,
}) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'missions' | 'achievements'>('missions');
  const [missions, setMissions] = useState<Mission[]>(() => dataService.getMissions());
  const [achievements, setAchievements] = useState<Achievement[]>(() =>
    dataService.getAchievements()
  );
  const [claimToast, setClaimToast] = useState<string | null>(null);

  const reloadData = () => {
    setMissions([...dataService.getMissions()]);
    setAchievements([...dataService.getAchievements()]);
    onRefreshUser();
  };

  const handleClaimMission = (missionId: string) => {
    soundEngine.playCoin();
    const result = dataService.claimMissionReward(missionId);
    if (result) {
      setClaimToast(`+${result.xp} XP & +${result.coins} Coins Claimed!`);
      reloadData();
      setTimeout(() => setClaimToast(null), 3000);
    }
  };

  return (
    <div id="missions-achievements-view" className="space-y-4 pb-20">
      {/* Header Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('missions');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              activeTab === 'missions'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>{t.missions}</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('achievements');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              activeTab === 'achievements'
                ? 'bg-violet-500/20 text-violet-300 border-violet-400/50 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{t.achievements}</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-time tracking</span>
        </div>
      </div>

      {claimToast && (
        <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 text-xs font-bold text-center animate-in fade-in shadow-[0_0_15px_rgba(0,229,255,0.3)]">
          {claimToast}
        </div>
      )}

      {/* Missions Tab */}
      {activeTab === 'missions' && (
        <div className="space-y-3">
          <div className="glass-panel rounded-2xl p-4 flex items-center justify-between border-cyan-500/20">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Daily & Weekly Flow Directives</h3>
              <p className="text-xs text-slate-400">
                Reinforce daily habits and claim deterministic XP and Tanzieem coins.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {missions.map((mission) => {
              const progressPct = Math.min(100, Math.round((mission.progress / mission.target) * 100));

              return (
                <div
                  key={mission.id}
                  className="glass-panel rounded-2xl p-4 border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                        {mission.type}
                      </span>
                      <h4 className="text-sm font-bold text-slate-200">
                        {lang === 'ar' ? mission.titleAr : mission.titleEn}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 font-tabular text-xs">
                      <span className="text-cyan-400 font-bold flex items-center gap-0.5">
                        <Zap className="w-3 h-3" />+{mission.rewardXp}
                      </span>
                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                        <Coins className="w-3 h-3" />+{mission.rewardCoins}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400">
                    {lang === 'ar' ? mission.descriptionAr : mission.descriptionEn}
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-tabular">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-slate-300 font-bold">
                        {mission.progress} / {mission.target} ({progressPct}%)
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-700"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-end">
                    {mission.claimed ? (
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Claimed</span>
                      </span>
                    ) : mission.completed ? (
                      <button
                        onClick={() => handleClaimMission(mission.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:opacity-95 transition-all"
                      >
                        Claim Reward (+{mission.rewardXp} XP)
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">In Progress</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((ach) => {
            const progressPct = Math.min(100, Math.round((ach.current / ach.target) * 100));

            return (
              <div
                key={ach.id}
                className={`glass-panel rounded-2xl p-4 border transition-all space-y-3 ${
                  ach.unlocked
                    ? 'border-cyan-500/30 bg-slate-900/70'
                    : 'border-slate-800/80 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        ach.unlocked
                          ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(0,229,255,0.35)]'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Trophy className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-100">
                        {lang === 'ar' ? ach.titleAr : ach.titleEn}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                        {lang === 'ar' ? ach.descriptionAr : ach.descriptionEn}
                      </p>
                    </div>
                  </div>

                  {ach.unlocked && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Unlocked
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-tabular">
                    <span className="text-slate-500">Tier Progress</span>
                    <span className="text-slate-300 font-bold">
                      {ach.current} / {ach.target}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        ach.unlocked ? 'bg-cyan-400' : 'bg-slate-700'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60 font-tabular">
                  <span className="text-slate-400 font-medium">Bounty</span>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">+{ach.rewardXp} XP</span>
                    <span className="text-amber-400 font-bold">+{ach.rewardCoins} Coins</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
