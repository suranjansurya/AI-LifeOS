import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { getWellnessOverviewAi, generateAiWellnessPlanProposalClient } from '../services/aiService';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Moon,
  Zap,
  Droplets,
  Activity,
  Coffee,
  Sparkles,
  Plus,
  Clock,
  Smile,
  ShieldCheck,
  X,
  Check
} from 'lucide-react';

export const Wellness = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [checkins, setCheckins] = useState([
    {
      id: 'chk-1',
      checkin_date: new Date().toISOString().split('T')[0],
      sleep_duration: 7.5,
      energy_level: 4,
      mood: 4,
      hydration_amount: 6,
      movement_duration: 30,
      notes: 'Rested and productive morning focus.'
    }
  ]);

  const [overview, setOverview] = useState(null);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [aiPlan, setAiPlan] = useState(null);

  // Form Fields
  const [sleepInput, setSleepInput] = useState('7.5');
  const [energyInput, setEnergyInput] = useState('4');
  const [moodInput, setMoodInput] = useState('4');
  const [hydrationInput, setHydrationInput] = useState('6');
  const [movementInput, setMovementInput] = useState('30');
  const [notesInput, setNotesInput] = useState('');

  const fetchOverview = async () => {
    try {
      const res = await getWellnessOverviewAi(checkins, []);
      setOverview(res);
    } catch (e) {
      showToast('Error loading wellness overview.', 'error');
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [checkins]);

  const handleSaveCheckin = (e) => {
    e.preventDefault();
    const newChk = {
      id: `chk-${Date.now()}`,
      checkin_date: new Date().toISOString().split('T')[0],
      sleep_duration: parseFloat(sleepInput) || 7.5,
      energy_level: parseInt(energyInput) || 4,
      mood: parseInt(moodInput) || 4,
      hydration_amount: parseInt(hydrationInput) || 6,
      movement_duration: parseInt(movementInput) || 30,
      notes: notesInput
    };

    setCheckins(prev => [...prev, newChk]);
    showToast('Daily wellness check-in saved!', 'success');
    setShowCheckinModal(false);
  };

  const handleAddWater = () => {
    setCheckins(prev => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = { ...copy[copy.length - 1] };
      last.hydration_amount = Math.min(12, (last.hydration_amount || 0) + 1);
      copy[copy.length - 1] = last;
      return copy;
    });
    showToast('Recorded +1 glass of water!', 'success');
  };

  const handleGenerateWellnessPlan = async () => {
    try {
      const res = await generateAiWellnessPlanProposalClient();
      if (res.proposedPlan) {
        setAiPlan(res.proposedPlan);
        setShowPlanModal(true);
      }
    } catch (e) {
      showToast('Error generating AI wellness plan.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Lifestyle & Wellness Intelligence System"
        subtitle="Self-tracking wellness check-ins, sleep routines, break management, and work-life balance optimization."
        action={
          <div className="flex items-center gap-2">
            <Button variant="ai" size="sm" onClick={handleGenerateWellnessPlan} icon={Sparkles}>
              AI Wellness Planner
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowCheckinModal(true)} icon={Plus}>
              Daily Check-in
            </Button>
          </div>
        }
      />

      {/* DISCLAIMER CALLOUT */}
      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Self-tracking productivity & lifestyle organization tool. Not a medical or diagnostic system.</span>
        </div>
      </div>

      {/* METRICS DASHBOARD CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-panel p-4 flex items-center justify-between border-indigo-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">SLEEP DURATION</span>
            <span className="text-2xl font-black text-indigo-400 font-mono">
              {overview?.sleepDuration || 7.5} hrs
            </span>
          </div>
          <Moon className="w-6 h-6 text-indigo-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-amber-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">ENERGY RATING</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {overview?.energyLevel || 4} / 5
            </span>
          </div>
          <Zap className="w-6 h-6 text-amber-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-cyan-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">HYDRATION</span>
            <span className="text-2xl font-black text-cyan-400 font-mono">
              {overview?.hydrationAmount || 6} / 8
            </span>
          </div>
          <Button variant="outline" size="xs" onClick={handleAddWater}>
            +1 Water
          </Button>
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-emerald-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">LIFESTYLE CONSISTENCY</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {overview?.lifestyleConsistency || 84}%
            </span>
          </div>
          <Heart className="w-6 h-6 text-emerald-400 opacity-60" />
        </div>
      </div>

      {/* AI INSIGHTS BANNER */}
      {overview?.insights && (
        <div className="card-panel p-5 space-y-3 border-emerald-500/40 bg-emerald-950/20">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>AI LIFESTYLE & BALANCE DIAGNOSTICS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overview.insights.map((ins, i) => (
              <div key={i} className="p-3 rounded-xl bg-zinc-950/80 border border-emerald-500/30 space-y-1 text-xs">
                <span className="font-bold text-zinc-100 block">{ins.title}</span>
                <p className="text-zinc-300">{ins.message}</p>
                <span className="text-[10px] text-zinc-500 font-mono block mt-1">Source: {ins.citation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHECK-IN MODAL */}
      {showCheckinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-emerald-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-400" />
                Daily Wellness Check-in (Optional)
              </h3>
              <button onClick={() => setShowCheckinModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCheckin} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Sleep Duration (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={sleepInput}
                  onChange={(e) => setSleepInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Energy Level (1 to 5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={energyInput}
                  onChange={(e) => setEnergyInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Hydration (Glasses)</label>
                <input
                  type="number"
                  value={hydrationInput}
                  onChange={(e) => setHydrationInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowCheckinModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Save Check-in</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI WELLNESS PLAN PROPOSAL MODAL */}
      {showPlanModal && aiPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-lg w-full p-6 space-y-4 border-emerald-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                {aiPlan.title}
              </h3>
              <button onClick={() => setShowPlanModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl p-3 bg-zinc-900/60">
                {aiPlan.steps.map((step, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-200 block">{step.title}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{step.time} • {step.category} • {step.durationMinutes}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowPlanModal(false)}>Cancel</Button>
              <Button variant="ai" size="sm" onClick={() => { showToast('Balanced plan saved!', 'success'); setShowPlanModal(false); }}>
                Accept Plan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* WORK-LIFE BALANCE BREAKDOWN */}
      <div className="card-panel p-5 space-y-4">
        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          WORK-LIFE BALANCE DISTRIBUTION
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center text-zinc-300">
            <span>Deep Work & Priority Focus Time</span>
            <span className="font-mono font-bold text-indigo-400">45% (4.2 hrs)</span>
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '45%' }} />
          </div>

          <div className="flex justify-between items-center text-zinc-300 pt-2">
            <span>Study & Learning Sprints</span>
            <span className="font-mono font-bold text-purple-400">25% (2.3 hrs)</span>
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '25%' }} />
          </div>

          <div className="flex justify-between items-center text-zinc-300 pt-2">
            <span>Restorative Breaks & Personal Time</span>
            <span className="font-mono font-bold text-emerald-400">30% (2.8 hrs)</span>
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '30%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
