import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  calculatePredictiveForecasts,
  simulateWhatIfScenario2
} from '../services/predictiveEngineService2';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Calendar as CalendarIcon,
  HelpCircle,
  Play,
  History,
  Clock,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Check,
  CheckCircle2,
  Sliders,
  Folder
} from 'lucide-react';

export const PredictiveEngine = () => {
  const navigate = useNavigate();
  const { tasks, goals, calendarEvents, focusSessions, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'radar' | 'timeline' | 'whatif' | 'history'
  const [timelineFilter, setTimelineFilter] = useState('This Week'); // 'Today' | 'Tomorrow' | 'This Week' | 'Next Week' | 'This Month'
  const [whatIfInput, setWhatIfInput] = useState('What if I postpone my DBMS assignment by 2 days?');
  const [whatIfResult, setWhatIfResult] = useState(null);

  const forecasts = calculatePredictiveForecasts({ tasks, goals, calendarEvents });

  // Prediction History
  const [historyLog, setHistoryLog] = useState([
    { id: 'pred-hist-1', date: '2026-08-30', prediction: 'Deadline Risk for DBMS Joins', confidence: '89%', outcome: 'Completed before deadline', status: 'Verified Correct' },
    { id: 'pred-hist-2', date: '2026-08-28', prediction: 'Heavy Calendar Load on Wednesday', confidence: '92%', outcome: 'Verified 4 events logged', status: 'Verified Correct' }
  ]);

  const handleSimulateScenario = (e) => {
    e.preventDefault();
    if (!whatIfInput.trim()) return;
    const res = simulateWhatIfScenario2(whatIfInput);
    setWhatIfResult(res);
    showToast('Executed hypothetical scenario simulation.', 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Predictive Intelligence & Future Planner 3.0"
        subtitle="Explainable forecasting engine calculating deadline risks, workload forecasts, study readiness, future timelines, and hypothetical What-If scenario simulations."
        action={
          <div className="flex items-center gap-2">
            <Button variant="ai" size="sm" onClick={() => navigate('/decisions')} icon={Sparkles}>
              Decision Center
            </Button>
          </div>
        }
      />

      {/* PRIVACY & TRANSPARENCY DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Explainable Predictions: All predictions display confidence levels and exact source context. Uncertain forecasts are never presented as guaranteed facts.</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">Last Updated: {forecasts.lastUpdated}</span>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Forecast Overview & Brief', icon: TrendingUp },
          { id: 'radar', label: 'Risk Radar & Opportunities', icon: AlertTriangle },
          { id: 'timeline', label: 'Future Planner Timeline', icon: Clock },
          { id: 'whatif', label: 'What-If Simulator', icon: HelpCircle },
          { id: 'history', label: `Prediction History (${historyLog.length})`, icon: History }
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

      {/* TAB 1: FORECAST OVERVIEW & DAILY BRIEF */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* WORKLOAD FORECAST CARDS */}
          <div className="card-panel p-5 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              3-Day Workload Forecast & Focus Pressure
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {forecasts.workloadForecast.map((wf, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-zinc-100">{wf.day}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
                      wf.load === 'High' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                      wf.load === 'Moderate' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {wf.load} Load
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-[11px] text-zinc-400">
                    <div>Active Tasks: <strong className="text-zinc-200">{wf.taskCount}</strong></div>
                    <div>Focus Needed: <strong className="text-indigo-300">{wf.focusNeeded}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STUDY READINESS ESTIMATE */}
          <div className="card-panel p-5 space-y-3 border-purple-500/40 bg-zinc-950">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Study Readiness Forecast: {forecasts.studyReadiness.subject}
              </h3>
              <Badge variant="purple" size="sm">{forecasts.studyReadiness.readinessLevel}</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-1 text-zinc-300">
              <p>Recent Quiz Accuracy: <strong className="text-emerald-400">{forecasts.studyReadiness.recentQuizScore}</strong></p>
              <p>Recommended Review Focus: <strong className="text-indigo-300">{forecasts.studyReadiness.recommendedReview}</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RISK RADAR & OPPORTUNITIES */}
      {activeTab === 'radar' && (
        <div className="space-y-6">
          {/* DEADLINE RISKS */}
          <div className="card-panel p-5 space-y-4 border-amber-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
              Deadline Risk Radar ({forecasts.deadlineRisks.length})
            </h3>

            <div className="space-y-3 text-xs">
              {forecasts.deadlineRisks.map(r => (
                <div key={r.id} className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-100">{r.title}</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                        {r.confidence}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">{r.reason}</p>
                    <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Source: {r.sourceData}</span>
                  </div>

                  <Button variant="ai" size="xs" onClick={() => navigate('/focus')} icon={Play}>
                    {r.suggestedAction}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* PROJECT RISKS */}
          <div className="card-panel p-5 space-y-3 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Folder className="w-4 h-4 text-indigo-400" />
              Active Project Risk & Velocity Ratings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {forecasts.projectRisks.map((pr, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-zinc-100 block">{pr.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Status: {pr.status}</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                    {pr.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FUTURE PLANNER TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            {['Today', 'Tomorrow', 'This Week', 'Next Week', 'This Month'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimelineFilter(tf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  timelineFilter === tf ? 'bg-indigo-600 text-white shadow-md' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-sm font-bold text-zinc-100">Future Timeline Forecast ({timelineFilter})</h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-zinc-100 block">DBMS Joins & Normalization Review</span>
                  <span className="text-[10px] text-purple-300 font-mono">Target Deadline: Tomorrow 05:00 PM</span>
                </div>
                <Badge variant="purple" size="sm">Study Priority</Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-zinc-100 block">AI-LifeOS Production RLS Security Audit</span>
                  <span className="text-[10px] text-indigo-300 font-mono">Target Deadline: In 3 Days</span>
                </div>
                <Badge variant="primary" size="sm">Project Priority</Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WHAT-IF SIMULATOR */}
      {activeTab === 'whatif' && (
        <div className="space-y-6">
          <div className="card-panel p-5 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              What-If Scenario Simulator
            </h3>

            <form onSubmit={handleSimulateScenario} className="flex gap-2 text-xs">
              <input
                type="text"
                value={whatIfInput}
                onChange={(e) => setWhatIfInput(e.target.value)}
                placeholder='e.g., "What if I postpone my DBMS assignment by 2 days?"'
                className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:border-indigo-500 focus:outline-none font-medium"
              />
              <Button type="submit" variant="ai" size="sm">Simulate Impact</Button>
            </form>
          </div>

          {whatIfResult && (
            <div className="card-panel p-6 space-y-4 border-indigo-500/30 bg-zinc-950">
              <div className="flex justify-between items-center">
                <span className="badge-ai px-2.5 py-0.5 text-[10px] font-bold rounded uppercase">
                  {whatIfResult.label}
                </span>
                <span className="text-[10px] text-rose-400 font-mono font-bold">Projected Risk: {whatIfResult.riskLevel}</span>
              </div>

              <h4 className="text-sm font-bold text-zinc-100">Scenario Analysis: "{whatIfResult.query}"</h4>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs text-zinc-300">
                <p className="text-zinc-100 font-medium">{whatIfResult.projectedImpact}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 block">DEADLINE CHANGE</span>
                    <span className="text-amber-400 font-bold">{whatIfResult.deadlineChange}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 block">WORKLOAD SHIFT</span>
                    <span className="text-indigo-300 font-bold">{whatIfResult.workloadShift}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PREDICTION HISTORY LOG */}
      {activeTab === 'history' && (
        <div className="card-panel p-5 space-y-3 bg-zinc-950 border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Prediction Audit Trail & Verification Log
          </h3>

          <div className="divide-y divide-zinc-800 text-xs">
            {historyLog.map(rec => (
              <div key={rec.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-500">{rec.date}</span>
                    <span className="font-bold text-zinc-100">{rec.prediction}</span>
                  </div>
                  <p className="text-zinc-300 mt-1">Verified Outcome: <strong className="text-emerald-400">{rec.outcome}</strong></p>
                </div>
                <Badge variant="success" size="sm">{rec.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
