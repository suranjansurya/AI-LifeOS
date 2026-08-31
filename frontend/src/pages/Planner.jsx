import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { generatePlanner2Plan } from '../services/aiService';
import { useNavigate } from 'react-router-dom';
import {
  Sliders,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  CalendarDays,
  Target,
  BarChart2,
  CheckSquare,
  ChevronRight,
  ShieldCheck,
  Play
} from 'lucide-react';

export const Planner = () => {
  const navigate = useNavigate();
  const {
    tasks,
    goals,
    milestones,
    calendarEvents,
    focusSessions,
    memories,
    preferences,
    setActiveFocusTask,
    toggleTask,
    showToast
  } = useApp();

  const [mode, setMode] = useState('Balanced'); // 'Balanced' | 'Deep Work' | 'Deadline Mode'
  const [availableHours, setAvailableHours] = useState(5.3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [rescheduleTaskModal, setRescheduleTaskModal] = useState(null);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await generatePlanner2Plan({
        tasks,
        goals,
        milestones,
        calendarEvents,
        focusSessions,
        memories,
        mode,
        availableHours
      });
      setPlanData(res);
      showToast(`⚡ Generated AI Plan 2.0 (${res.mode} mode)`, 'success');
    } catch (e) {
      showToast('Plan generation failed.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!planData && tasks.length > 0) {
      handleGeneratePlan();
    }
  }, [tasks]);

  const handleMoveSlot = (index, direction) => {
    if (!planData || !planData.schedule) return;
    const newSchedule = [...planData.schedule];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newSchedule.length) return;

    const temp = newSchedule[index];
    newSchedule[index] = newSchedule[targetIdx];
    newSchedule[targetIdx] = temp;

    setPlanData({ ...planData, schedule: newSchedule });
    showToast('Reordered planned tasks.', 'info');
  };

  const handleStartFocus = (slot) => {
    const targetTask = { id: slot.taskId, title: slot.title };
    setActiveFocusTask(targetTask);
    navigate('/focus');
  };

  const handleRescheduleConfirm = (option) => {
    if (!rescheduleTaskModal) return;
    const updatedSchedule = planData.schedule.filter(s => s.id !== rescheduleTaskModal.id);
    setPlanData({ ...planData, schedule: updatedSchedule });
    setRescheduleTaskModal(null);
    showToast(`Task rescheduled to ${option}.`, 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Life Planner 2.0"
        subtitle="Autonomous daily execution engine optimizing real tasks, goals, calendar commitments, and peak energy periods."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              icon={RotateCcw}
            >
              {isGenerating ? 'Planning...' : 'Regenerate'}
            </Button>

            <Button
              variant="ai"
              size="sm"
              onClick={() => showToast('Plan accepted and locked into Daily Execution state!', 'success')}
              icon={CheckCircle2}
            >
              Accept Today's Plan
            </Button>
          </div>
        }
      />

      {/* Mode Selector & Available Time Bar */}
      <div className="card-panel p-5 border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Planning Mode:</span>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'Balanced', label: '⚖️ Balanced' },
              { id: 'Deep Work', label: '🧠 Deep Work' },
              { id: 'Deadline Mode', label: '🚨 Deadline Mode' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === m.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-zinc-400">Available Time Today:</span>
          <select
            value={availableHours}
            onChange={(e) => setAvailableHours(parseFloat(e.target.value))}
            className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-indigo-300 focus:outline-none cursor-pointer"
          >
            <option value={3.5}>3.5 Hours</option>
            <option value={5.3}>5.3 Hours (Default)</option>
            <option value={7.0}>7.0 Hours</option>
          </select>
        </div>
      </div>

      {planData && (
        <>
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="card-panel p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase">Plan Quality Score</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-indigo-400 font-mono">{planData.planQualityScore}</span>
                <span className="text-xs text-zinc-500 font-mono">/ 100</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono mt-1">Optimal Feasibility</span>
            </div>

            <div className="card-panel p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase">Available Time</span>
              <span className="text-2xl font-black text-zinc-100 font-mono mt-1">{planData.availableHours}h</span>
              <span className="text-[10px] text-zinc-500 font-mono mt-1">{planData.totalAvailableMinutes} mins total</span>
            </div>

            <div className="card-panel p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase">Planned Work</span>
              <span className="text-2xl font-black text-indigo-300 font-mono mt-1">{Math.floor(planData.plannedMinutes / 60)}h {planData.plannedMinutes % 60}m</span>
              <span className="text-[10px] text-zinc-500 font-mono mt-1">{planData.scheduledTasksCount} priority tasks</span>
            </div>

            <div className="card-panel p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase">Buffer Time</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1">{Math.floor(planData.bufferMinutes / 60)}h {planData.bufferMinutes % 60}m</span>
              <span className="text-[10px] text-emerald-400 font-mono mt-1">Rest & Flexibility</span>
            </div>

            <div className="card-panel p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase">Plan Health</span>
              <div className="mt-1">
                <span className={`px-2.5 py-1 text-xs font-bold font-mono rounded border uppercase ${
                  planData.planHealth === 'ON TRACK' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  planData.planHealth === 'SLIGHTLY BEHIND' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                  'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  🟢 {planData.planHealth}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono mt-1">Real-time status</span>
            </div>
          </div>

          {/* NEXT BEST ACTION BANNER */}
          {planData.nextBestAction && (
            <div className="card-panel nba-glow p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
                  <Zap className="w-5 h-5 text-indigo-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-ai px-2 py-0.5 text-[10px] font-bold rounded uppercase">
                      NEXT BEST ACTION NOW
                    </span>
                    <span className="text-[11px] font-mono text-indigo-300">{planData.nextBestAction.timeWindow}</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-100">{planData.nextBestAction.title}</h3>
                  <p className="text-xs text-zinc-300 mt-0.5">{planData.nextBestAction.why}</p>
                </div>
              </div>

              <Button
                variant="ai"
                size="md"
                onClick={() => handleStartFocus({ taskId: planData.nextBestAction.taskId, title: planData.nextBestAction.title })}
                icon={Play}
              >
                Start Focus ({planData.nextBestAction.durationMinutes}m)
              </Button>
            </div>
          )}

          {/* Timeline Schedule & Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Today's Execution Timeline ({planData.schedule.length} Slots)
              </h3>

              {planData.schedule.map((slot, idx) => (
                <div
                  key={slot.id}
                  className="card-panel p-4 card-hover flex items-center justify-between gap-4 border-zinc-800/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveSlot(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 text-zinc-500 hover:text-indigo-400 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveSlot(idx, 1)}
                        disabled={idx === planData.schedule.length - 1}
                        className="p-1 text-zinc-500 hover:text-indigo-400 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-zinc-900 text-indigo-300 rounded font-mono text-[10px] font-bold border border-zinc-800">
                          {slot.timeWindow}
                        </span>
                        <Badge variant={slot.priority === 'High' || slot.priority === 'Critical' ? 'danger' : 'primary'} size="sm">
                          {slot.priority}
                        </Badge>
                      </div>

                      <h4 className="text-xs font-bold text-zinc-100">{slot.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{slot.whyReason}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setRescheduleTaskModal(slot)}
                    >
                      Reschedule
                    </Button>

                    <Button
                      variant="ai"
                      size="xs"
                      onClick={() => handleStartFocus(slot)}
                      icon={Play}
                    >
                      Focus ({slot.durationMinutes}m)
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Cards: Why This Plan & Daily Review */}
            <div className="space-y-4">
              {/* WHY THIS PLAN */}
              <div className="card-panel p-5 space-y-3 border-indigo-500/30">
                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Why This Plan?
                </h3>
                <ul className="space-y-2">
                  {(planData.whyThisPlan || []).map((reason, idx) => (
                    <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* END OF DAY DAILY REVIEW */}
              {planData.dailyReview && (
                <div className="card-panel p-5 space-y-3 bg-zinc-900/60 border-zinc-800">
                  <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-emerald-400" />
                    Daily Performance Review
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                      <span className="text-base font-black text-emerald-400 font-mono">{planData.dailyReview.completedCount}</span>
                      <span className="text-[10px] text-zinc-400 block">Completed</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                      <span className="text-base font-black text-indigo-400 font-mono">{planData.dailyReview.completionRate}%</span>
                      <span className="text-[10px] text-zinc-400 block">Completion</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                    "{planData.dailyReview.summary}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Reschedule Confirmation Modal */}
      {rescheduleTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Reschedule Task: "{rescheduleTaskModal.title}"
            </h3>

            <p className="text-xs text-zinc-300">Choose optimal rescheduling target:</p>

            <div className="space-y-2">
              {[
                { id: 'later_today', label: '🌆 Later Today (Next Free Slot)' },
                { id: 'tomorrow', label: '🌅 Tomorrow Morning' },
                { id: 'next_available', label: '📅 Next Available Focus Slot' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleRescheduleConfirm(opt.label)}
                  className="w-full p-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-zinc-200 text-left transition-colors cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setRescheduleTaskModal(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
