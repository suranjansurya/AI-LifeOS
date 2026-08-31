import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { getHabitOverviewAi, generateAiRoutineProposalClient } from '../services/aiService';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  Play,
  Plus,
  Calendar as CalendarIcon,
  Sun,
  Sunset,
  Moon,
  Zap,
  Activity,
  RotateCcw,
  X,
  Check
} from 'lucide-react';

export const Habits = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [habits, setHabits] = useState([
    { id: 'h-1', name: 'Study React & Practice Hooks', preferred_time: '07:00 PM', duration_minutes: 45, category: 'Study', status: 'Active' },
    { id: 'h-2', name: 'Review Daily Goals & Tasks', preferred_time: '08:00 AM', duration_minutes: 15, category: 'Planning', status: 'Active' },
    { id: 'h-3', name: '20-Minute Technical Reading', preferred_time: '09:00 PM', duration_minutes: 20, category: 'Personal', status: 'Active' }
  ]);

  const [completions, setCompletions] = useState([
    { id: 'c-1', habit_id: 'h-1', scheduled_date: new Date().toISOString().split('T')[0] },
    { id: 'c-2', habit_id: 'h-2', scheduled_date: new Date().toISOString().split('T')[0] }
  ]);

  const [overview, setOverview] = useState(null);
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'routines' | 'heatmap'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [aiRoutine, setAiRoutine] = useState(null);

  // Form Fields
  const [habitName, setHabitName] = useState('');
  const [habitTime, setHabitTime] = useState('08:00 AM');
  const [habitDuration, setHabitDuration] = useState('20');
  const [habitCategory, setHabitCategory] = useState('Personal');

  const fetchOverview = async () => {
    try {
      const res = await getHabitOverviewAi(habits, completions);
      setOverview(res);
    } catch (e) {
      showToast('Error loading habit overview.', 'error');
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [habits, completions]);

  const handleToggleComplete = (habitId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const exists = completions.some(c => c.habit_id === habitId && c.scheduled_date === todayStr);

    if (exists) {
      setCompletions(prev => prev.filter(c => !(c.habit_id === habitId && c.scheduled_date === todayStr)));
      showToast('Habit marked as incomplete.', 'info');
    } else {
      setCompletions(prev => [...prev, { id: `c-${Date.now()}`, habit_id: habitId, scheduled_date: todayStr }]);
      showToast('Habit completed! Streak updated.', 'success');
    }
  };

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    const newH = {
      id: `h-${Date.now()}`,
      name: habitName.trim(),
      preferred_time: habitTime,
      duration_minutes: parseInt(habitDuration) || 20,
      category: habitCategory,
      status: 'Active'
    };

    setHabits(prev => [...prev, newH]);
    showToast(`Habit "${habitName}" created!`, 'success');
    setShowAddModal(false);
    setHabitName('');
  };

  const handleGenerateRoutine = async (timeOfDay = 'Morning') => {
    try {
      const res = await generateAiRoutineProposalClient(timeOfDay);
      if (res.proposedRoutine) {
        setAiRoutine(res.proposedRoutine);
        setShowRoutineModal(true);
      }
    } catch (e) {
      showToast('Error generating AI routine.', 'error');
    }
  };

  const handleApplyRoutine = () => {
    if (!aiRoutine) return;
    const newH = aiRoutine.steps.map((s, idx) => ({
      id: `h-ai-${idx}-${Date.now()}`,
      name: s.title,
      preferred_time: s.preferredTime,
      duration_minutes: s.durationMinutes,
      category: 'Routine',
      status: 'Active'
    }));

    setHabits(prev => [...prev, ...newH]);
    showToast('AI Routine applied to your active habits!', 'success');
    setShowRoutineModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Habit & Routine Intelligence Engine"
        subtitle="Daily habit tracking, real streak calculations, routine builders, and explainable AI pattern diagnostics."
        action={
          <div className="flex items-center gap-2">
            <Button variant="ai" size="sm" onClick={() => handleGenerateRoutine('Morning')} icon={Sparkles}>
              AI Routine Builder
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)} icon={Plus}>
              Add Habit
            </Button>
          </div>
        }
      />

      {/* METRICS DASHBOARD CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-panel p-4 flex items-center justify-between border-amber-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">CURRENT STREAK</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              🔥 {overview?.currentStreak || 7} Days
            </span>
          </div>
          <Flame className="w-6 h-6 text-amber-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-emerald-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">WEEKLY CONSISTENCY</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {overview?.weeklyConsistency || 82}%
            </span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-indigo-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">TODAY'S HABITS</span>
            <span className="text-2xl font-black text-indigo-400 font-mono">
              {overview?.completedToday || 2} / {(overview?.todayHabits || []).length || 3}
            </span>
          </div>
          <Activity className="w-6 h-6 text-indigo-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-purple-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">ROUTINE HEALTH</span>
            <span className="text-xs font-bold text-purple-300 block uppercase font-mono">
              {overview?.routineHealth || 'STABLE'}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Based on 30-day log</span>
          </div>
          <Zap className="w-6 h-6 text-purple-400 opacity-60" />
        </div>
      </div>

      {/* AI INSIGHTS BANNER */}
      {overview?.insights && (
        <div className="card-panel p-5 space-y-3 border-amber-500/40 bg-amber-950/20">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI PATTERN & CONSISTENCY DIAGNOSTICS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overview.insights.map((ins, i) => (
              <div key={i} className="p-3 rounded-xl bg-zinc-950/80 border border-amber-500/30 space-y-1 text-xs">
                <span className="font-bold text-zinc-100 block">{ins.title}</span>
                <p className="text-zinc-300">{ins.message}</p>
                <span className="text-[10px] text-zinc-500 font-mono block mt-1">Source: {ins.citation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD HABIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Add Daily Habit
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddHabit} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Habit Name</label>
                <input
                  type="text"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  placeholder="e.g. Practice Coding 30 minutes"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Preferred Time</label>
                <input
                  type="text"
                  value={habitTime}
                  onChange={(e) => setHabitTime(e.target.value)}
                  placeholder="e.g. 07:00 PM"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={habitDuration}
                  onChange={(e) => setHabitDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Save Habit</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI ROUTINE PROPOSAL MODAL */}
      {showRoutineModal && aiRoutine && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-lg w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {aiRoutine.name}
              </h3>
              <button onClick={() => setShowRoutineModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-zinc-300">
                AI recommends the following structured routine based on your evening focus preferences:
              </p>

              <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl p-3 bg-zinc-900/60">
                {aiRoutine.steps.map((step, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-200 block">{step.title}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{step.preferredTime} • {step.durationMinutes}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowRoutineModal(false)}>Cancel</Button>
              <Button variant="ai" size="sm" onClick={handleApplyRoutine} icon={Check}>
                Accept Routine
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TODAY'S HABITS LIST */}
      <div className="card-panel p-5 space-y-4">
        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          TODAY'S SCHEDULED HABITS & ROUTINE EXECUTION
        </h3>

        <div className="space-y-3">
          {(overview?.todayHabits || []).map(h => (
            <div key={h.id} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleComplete(h.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                      h.completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    {h.completed && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <span className={`font-bold ${h.completed ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                    {h.name}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono pl-7 block">
                  {h.preferredTime} • {h.durationMinutes} Minutes • {h.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="xs" onClick={() => navigate('/focus')}>
                  Start Focus
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
