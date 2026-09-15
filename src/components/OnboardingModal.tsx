import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { FocusArea, AppLanguage } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { dataService } from '../services/dataService';
import { soundEngine } from '../services/soundEngine';
import { CompanionAvatar } from './CompanionAvatar';

interface OnboardingModalProps {
  lang: AppLanguage;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ lang, onComplete }) => {
  const t = TRANSLATIONS[lang];
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('Alex');
  const [goal, setGoal] = useState<string>('Master deep flow state and build daily focus consistency');
  const [focusArea, setFocusArea] = useState<FocusArea>('Design');
  const [availableHours, setAvailableHours] = useState<number>(6);
  const [preferredSessionMinutes, setPreferredSessionMinutes] = useState<number>(25);
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState<number>(240);

  const handleFinish = () => {
    soundEngine.playTimerStart();
    dataService.completeOnboarding({
      name,
      goal,
      focusArea,
      availableHours,
      preferredSessionMinutes,
      dailyTargetMinutes,
    });
    onComplete();
  };

  return (
    <div
      id="onboarding-flow-modal"
      className="fixed inset-0 z-50 bg-[#070A13]/95 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="max-w-lg w-full glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-6 border-cyan-400/40 animate-in fade-in">
        {/* Companion greeting */}
        <div className="flex flex-col items-center text-center space-y-2">
          <CompanionAvatar size={100} mood="curious" withGlow={true} />
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Welcome to TANZIEEM
          </h2>
          <p className="creator-credit text-xs text-cyan-400">
            {t.creatorCredit}
          </p>
          <p className="text-xs text-slate-400 max-w-sm">
            Configure your personalized Chrono Sanctuary in under 60 seconds.
          </p>
        </div>

        {/* Step 1: Identity & Goal */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1.5">
                What should your companion call you?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex R."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1.5">
                Primary Craft / Focus Domain
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Design', 'Programming', 'Study', 'Work', 'Reading', 'Fitness'].map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setFocusArea(area as FocusArea)}
                    className={`py-2 px-2.5 rounded-xl font-bold transition-all border ${
                      focusArea === area
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                setStep(2);
              }}
              className="w-full mt-4 py-3 rounded-2xl font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
            >
              <span>Next: Time Targets</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        )}

        {/* Step 2: Time Targets & Session Pace */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-300">
                  Daily Deep Work Goal:
                </label>
                <span className="text-cyan-400 font-bold font-tabular">
                  {dailyTargetMinutes / 60} hours / day
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="360"
                step="30"
                value={dailyTargetMinutes}
                onChange={(e) => setDailyTargetMinutes(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-2">
                Preferred Focus Session Length
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mins: 15, label: '15m Sprint' },
                  { mins: 25, label: '25m Standard' },
                  { mins: 50, label: '50m Deep Flow' },
                ].map((s) => (
                  <button
                    key={s.mins}
                    type="button"
                    onClick={() => setPreferredSessionMinutes(s.mins)}
                    className={`py-2.5 rounded-xl font-bold transition-all border ${
                      preferredSessionMinutes === s.mins
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-2xl font-semibold text-slate-400 hover:bg-slate-800"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:opacity-95 shadow-[0_0_20px_rgba(0,229,255,0.35)] transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Enter Chrono Sanctuary</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
