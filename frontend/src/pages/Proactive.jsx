import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { getProactiveInsightsAi } from '../services/aiService';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  AlertTriangle,
  Clock,
  Sun,
  Moon,
  Calendar,
  CheckCircle2,
  X,
  Power,
  Settings,
  ArrowRight,
  ShieldCheck,
  Play,
  RotateCcw,
  BellOff,
  HelpCircle,
  Check
} from 'lucide-react';

export const Proactive = () => {
  const navigate = useNavigate();
  const {
    tasks,
    goals,
    calendarEvents,
    focusSessions,
    preferences,
    updatePreferences,
    setActiveFocusTask,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('insights'); // 'insights' | 'brief' | 'evening' | 'tomorrow'
  const [proactiveData, setProactiveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);
  const [snoozedIds, setSnoozedIds] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  // Settings State
  const [allowTasks, setAllowTasks] = useState(true);
  const [allowCalendar, setAllowCalendar] = useState(true);
  const [allowStudy, setAllowStudy] = useState(true);
  const [allowGoals, setAllowGoals] = useState(true);
  const [allowNotifs, setAllowNotifs] = useState(true);

  const isProactiveEnabled = preferences.proactiveAiEnabled !== false;

  const fetchProactiveData = async () => {
    setLoading(true);
    try {
      const res = await getProactiveInsightsAi({
        tasks,
        goals,
        calendarEvents,
        focusSessions,
        preferences
      });
      setProactiveData(res);
    } catch (e) {
      showToast('Proactive AI data sync failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProactiveData();
  }, [tasks, goals]);

  const handleDismiss = (id) => {
    setDismissedIds(prev => [...prev, id]);
    showToast('Dismissed proactive recommendation.', 'info');
  };

  const handleSnooze = (id) => {
    setSnoozedIds(prev => [...prev, id]);
    showToast('Snoozed recommendation for 1 hour.', 'info');
  };

  const handleActionClick = (item) => {
    if (item.actionType === 'focus' && item.entityId) {
      const targetTask = tasks.find(t => t.id === item.entityId) || { id: item.entityId, title: item.title };
      setActiveFocusTask(targetTask);
      navigate('/focus');
    } else if (item.link) {
      navigate(item.link);
    }
  };

  const handleMoveTaskTomorrow = () => {
    showToast('Task reschedule proposed for tomorrow! Requires planner confirmation.', 'success');
    navigate('/planner');
  };

  const activeInsights = (proactiveData?.insights || []).filter(item => !dismissedIds.includes(item.id) && !snoozedIds.includes(item.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Proactive AI Intelligence Engine 3.0"
        subtitle="Context-aware proactive assistant identifying upcoming deadlines, free focus windows, and goal milestones with transparent explainable AI reasoning."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextState = !isProactiveEnabled;
                updatePreferences({ proactiveAiEnabled: nextState });
                showToast(nextState ? 'Proactive AI Engine: ENABLED' : 'Proactive AI Engine: DISABLED (Global Switch Active)', 'info');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isProactiveEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              Proactive Engine: {isProactiveEnabled ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl border border-zinc-800 transition-colors cursor-pointer ${showSettings ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'}`}
              title="Proactive AI Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchProactiveData}
              disabled={loading}
              icon={RotateCcw}
            >
              {loading ? 'Analyzing...' : 'Refresh Insights'}
            </Button>
          </div>
        }
      />

      {/* PRIVACY & TRANSPARENCY DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Transparent AI disclaimer: Proactive insights utilize objective data signals (deadlines, calendar gaps, task priorities). No automated changes without explicit user approval.</span>
        </div>
      </div>

      {/* SETTINGS PANEL DRAWER */}
      {showSettings && (
        <div className="card-panel p-5 space-y-4 border-indigo-500/40 bg-zinc-900/80 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-indigo-400" />
            Proactive AI Intelligence Settings & Module Toggles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <label className="flex items-center gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={allowTasks}
                onChange={(e) => setAllowTasks(e.target.checked)}
                className="rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Task & Deadline Intelligence</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={allowCalendar}
                onChange={(e) => setAllowCalendar(e.target.checked)}
                className="rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Calendar & Free Window Detection</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={allowStudy}
                onChange={(e) => setAllowStudy(e.target.checked)}
                className="rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Study & Revision Intelligence</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={allowGoals}
                onChange={(e) => setAllowGoals(e.target.checked)}
                className="rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Goal Pace & Milestone Tracking</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={allowNotifs}
                onChange={(e) => setAllowNotifs(e.target.checked)}
                className="rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Proactive Notifications</span>
            </label>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'insights', label: `Proactive Insights (${activeInsights.length})`, icon: Sparkles },
          { id: 'brief', label: 'Morning Brief', icon: Sun },
          { id: 'evening', label: 'Evening Review', icon: Moon },
          { id: 'tomorrow', label: 'Tomorrow Preview', icon: Calendar }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {proactiveData && (
        <>
          {/* TAB 1: EXPLAINABLE PROACTIVE RECOMMENDATIONS */}
          {activeTab === 'insights' && (
            <div className="space-y-4">
              {activeInsights.length > 0 ? (
                activeInsights.map(item => (
                  <div
                    key={item.id}
                    className={`card-panel p-5 card-hover space-y-3 border-zinc-800 ${
                      item.type === 'deadline_risk' ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/20 via-zinc-900 to-zinc-900' :
                      item.type === 'goal_risk' ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-zinc-900 to-zinc-900' :
                      'border-indigo-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="badge-ai px-2 py-0.5 text-[10px] font-bold rounded uppercase">
                          PROACTIVE RECOMMENDATION
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                          {item.confidenceLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSnooze(item.id)}
                          className="px-2 py-0.5 text-[10px] font-mono font-bold bg-zinc-900 text-zinc-400 hover:text-zinc-200 rounded border border-zinc-800 cursor-pointer flex items-center gap-1"
                        >
                          <BellOff className="w-3 h-3" /> Snooze 1h
                        </button>

                        <button
                          onClick={() => handleDismiss(item.id)}
                          className="p-1 text-zinc-500 hover:text-zinc-300 rounded cursor-pointer"
                          title="Dismiss Recommendation"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">{item.title}</h4>
                      <p className="text-xs text-zinc-300 leading-relaxed mt-1">{item.description}</p>
                    </div>

                    {/* EXPLAINABLE AI REASON BOX */}
                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                      <span className="font-bold text-indigo-300 uppercase text-[10px] tracking-wider flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-indigo-400" /> WHY IS THIS RECOMMENDED?
                      </span>
                      <p className="leading-relaxed">{item.reason}</p>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800/60">
                      {item.actionLabel && (
                        <Button
                          variant={item.actionType === 'focus' ? 'ai' : 'outline'}
                          size="xs"
                          onClick={() => handleActionClick(item)}
                          icon={ArrowRight}
                        >
                          {item.actionLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="card-panel p-12 text-center text-xs text-zinc-500 space-y-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-zinc-300 font-semibold">Your AI intelligence layer is active & learning!</p>
                  <p className="text-zinc-500">Add tasks, goals, or calendar events to unlock more proactive recommendations.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MORNING BRIEF */}
          {activeTab === 'brief' && (
            <div className="card-panel p-6 space-y-4 border-indigo-500/30">
              <div className="flex items-center gap-3">
                <Sun className="w-6 h-6 text-amber-400 animate-pulse" />
                <div>
                  <h3 className="text-base font-bold text-zinc-100">{proactiveData.morningBrief?.title}</h3>
                  <p className="text-xs text-zinc-400">{proactiveData.morningBrief?.subtitle}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">3 THINGS THAT MATTER TODAY</span>
                <p className="text-xs text-zinc-200 leading-relaxed">"{proactiveData.morningBrief?.recommendation}"</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ai" size="sm" onClick={() => navigate('/planner')}>
                  Open Daily Planner
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: EVENING REVIEW WITH ACTION CONFIRMATION */}
          {activeTab === 'evening' && (
            <div className="card-panel p-6 space-y-4 border-purple-500/30">
              <div className="flex items-center gap-3">
                <Moon className="w-6 h-6 text-purple-400" />
                <h3 className="text-base font-bold text-zinc-100">{proactiveData.eveningReview?.title}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xl font-black text-emerald-400 font-mono">{proactiveData.eveningReview?.completedCount}</span>
                  <span className="text-[10px] text-zinc-400 block">Tasks Completed</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xl font-black text-indigo-400 font-mono">{proactiveData.eveningReview?.focusMinutes}m</span>
                  <span className="text-[10px] text-zinc-400 block">Focus Logged</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <p className="text-xs text-zinc-300 leading-relaxed">"{proactiveData.eveningReview?.summary}"</p>

                <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 flex justify-between items-center text-xs">
                  <span className="text-indigo-200 font-medium">Move unfinished task "{proactiveData.eveningReview?.suggestedTaskMove}" to tomorrow?</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="xs" onClick={() => showToast('Kept task date.', 'info')}>Keep</Button>
                    <Button variant="ai" size="xs" onClick={handleMoveTaskTomorrow} icon={Check}>Move</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TOMORROW PREVIEW */}
          {activeTab === 'tomorrow' && (
            <div className="card-panel p-6 space-y-4 border-indigo-500/30">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-indigo-400" />
                <h3 className="text-base font-bold text-zinc-100">{proactiveData.tomorrowPreview?.title}</h3>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-200 block">Tomorrow's #1 Recommended Priority:</span>
                <span className="text-sm font-black text-indigo-300 block">{proactiveData.tomorrowPreview?.firstPriority}</span>
                <span className="text-[11px] text-zinc-400 block">Reason: {proactiveData.tomorrowPreview?.reason}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
