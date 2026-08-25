import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { generateDailySchedule, generateTaskBreakdown } from '../services/aiService';
import { TaskBreakdownModal } from '../components/modals/TaskBreakdownModal';
import {
  Sparkles,
  Calendar,
  Clock,
  Coffee,
  Play,
  CheckCircle2,
  RefreshCw,
  Edit2,
  Sliders,
  Layers,
  HelpCircle
} from 'lucide-react';

export const Planner = () => {
  const navigate = useNavigate();
  const {
    tasks,
    calendarEvents,
    profile,
    userMemories,
    setActiveFocusTask,
    saveDailyPlan,
    showToast
  } = useApp();

  const [availableHours, setAvailableHours] = useState(4);
  const [startHour, setStartHour] = useState(9);
  const [breakMins, setBreakMins] = useState(10);
  const [focusDuration, setFocusDuration] = useState(35);
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [selectedTaskForBreakdown, setSelectedTaskForBreakdown] = useState(null);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);

  useEffect(() => {
    // Generate initial plan draft on page load
    handleGeneratePlan();
  }, []);

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const res = await generateDailySchedule(tasks, availableHours, startHour, calendarEvents, { breakDuration: breakMins }, userMemories);
      if (res && res.schedule) {
        setCurrentPlan(res);
      }
    } catch (err) {
      console.error('[Planner] Schedule generation error:', err);
      showToast('Failed to generate AI schedule. Operating in fallback mode.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPlan = () => {
    if (!currentPlan) return;
    saveDailyPlan(currentPlan);
    showToast('🏆 AI Daily Plan accepted and saved to database!', 'success');
  };

  const handleStartFocus = (taskSlot) => {
    const matchedTask = tasks.find(t => t.id === taskSlot.taskId) || {
      id: taskSlot.taskId || 'task-scheduled',
      title: taskSlot.title,
      priority: taskSlot.priority || 'High',
      estimatedMinutes: taskSlot.durationMinutes || focusDuration
    };

    setActiveFocusTask(matchedTask);
    navigate('/focus');
  };

  const handleOpenBreakdown = (task) => {
    setSelectedTaskForBreakdown(task);
    setIsBreakdownModalOpen(true);
  };

  const activeTasks = tasks.filter(t => t.status !== 'Completed');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Daily Planner & Smart Scheduler"
        subtitle="Context-aware scheduling engine balancing workload, deadlines, and calendar commitments."
        action={
          <Button
            variant="ai"
            size="sm"
            onClick={handleGeneratePlan}
            disabled={loading}
            icon={loading ? RefreshCw : Sparkles}
          >
            {loading ? 'Optimizing Plan...' : 'Regenerate Schedule'}
          </Button>
        }
      />

      {/* Available Time & Preference Bar */}
      <div className="card-panel p-5 border-indigo-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Scheduling Controls & Preferences
          </h3>
          <span className="text-xs text-zinc-500 font-mono">
            {activeTasks.length} Active Tasks · {calendarEvents.length} Calendar Events
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Available Hours */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
              Available Focus Hours
            </label>
            <div className="flex items-center gap-1.5">
              {[2, 4, 5, 6, 8].map(h => (
                <button
                  key={h}
                  onClick={() => setAvailableHours(h)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    availableHours === h
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
              Start Hour
            </label>
            <select
              value={startHour}
              onChange={(e) => setStartHour(parseInt(e.target.value, 10))}
              className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none cursor-pointer font-mono"
            >
              <option value={8}>08:00 AM</option>
              <option value={9}>09:00 AM (Default)</option>
              <option value={10}>10:00 AM</option>
              <option value={14}>02:00 PM</option>
              <option value={18}>06:00 PM</option>
            </select>
          </div>

          {/* Break Preference */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
              Rest Buffer Break
            </label>
            <div className="flex items-center gap-1.5">
              {[5, 10, 15].map(b => (
                <button
                  key={b}
                  onClick={() => setBreakMins(b)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    breakMins === b
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {b}m
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Sprint Duration */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
              Target Sprint Duration
            </label>
            <div className="flex items-center gap-1.5">
              {[25, 35, 50].map(d => (
                <button
                  key={d}
                  onClick={() => setFocusDuration(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    focusDuration === d
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Schedule Timeline & AI Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Column (Col 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Generated Daily Timeline
            </h3>
            {currentPlan && (
              <div className="flex items-center gap-2">
                <Button variant="ai" size="sm" onClick={handleAcceptPlan} icon={CheckCircle2}>
                  Accept Plan
                </Button>
                <Button variant="outline" size="sm" onClick={handleGeneratePlan} icon={RefreshCw}>
                  Regenerate
                </Button>
              </div>
            )}
          </div>

          {/* Schedule List */}
          <div className="space-y-3">
            {currentPlan?.schedule?.map((slot, idx) => (
              <div
                key={slot.id || idx}
                className={`p-4 rounded-xl border transition-all ${
                  slot.type === 'break'
                    ? 'bg-zinc-900/40 border-dashed border-zinc-800 text-zinc-400'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                        {slot.timeWindow}
                      </span>
                      {slot.type === 'task' && slot.priorityScore && (
                        <Badge variant="ai" size="sm">
                          Score: {slot.priorityScore}/100
                        </Badge>
                      )}
                      {slot.type === 'break' && (
                        <Badge variant="secondary" size="sm">
                          Rest Buffer
                        </Badge>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      {slot.type === 'break' ? (
                        <Coffee className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-indigo-400" />
                      )}
                      {slot.title}
                    </h4>

                    {slot.whyReason && (
                      <p className="text-xs text-zinc-400 italic">
                        "{slot.whyReason}"
                      </p>
                    )}
                  </div>

                  {slot.type === 'task' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => {
                          const t = tasks.find(item => item.id === slot.taskId);
                          if (t) handleOpenBreakdown(t);
                        }}
                        icon={Layers}
                      >
                        Breakdown
                      </Button>
                      <Button
                        variant="ai"
                        size="xs"
                        onClick={() => handleStartFocus(slot)}
                        icon={Play}
                      >
                        Start Focus
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Reasoning Sidebar */}
        <div className="space-y-6">
          <div className="card-panel p-5 space-y-4 border-indigo-500/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              WHY THIS PLAN?
            </h3>

            <div className="space-y-3">
              {currentPlan?.whyThisPlan?.map((reason, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Breakdown Modal */}
      {selectedTaskForBreakdown && (
        <TaskBreakdownModal
          isOpen={isBreakdownModalOpen}
          onClose={() => setIsBreakdownModalOpen(false)}
          task={selectedTaskForBreakdown}
        />
      )}
    </div>
  );
};
