import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { generateReportAi } from '../services/aiService';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  TrendingUp,
  Award,
  AlertTriangle,
  Target,
  Clock,
  Calendar,
  Layers,
  RefreshCw,
  ArrowRight,
  Bot,
  History,
  CheckCircle2
} from 'lucide-react';

export const Reports = () => {
  const navigate = useNavigate();
  const { tasks, goals, focusSessions, dailyPlan, calendarEvents, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' | 'monthly' | 'history'
  const [report, setReport] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleGenerateReport(activeTab === 'monthly' ? 'monthly' : 'weekly');
  }, [activeTab]);

  const handleGenerateReport = async (type = 'weekly') => {
    if (type === 'history') return;
    setLoading(true);
    try {
      const res = await generateReportAi(type, { tasks, goals, focusSessions, dailyPlan, calendarEvents });
      if (res && res.metrics) {
        setReport(res);

        // Save to Report History
        setReportHistory(prev => {
          const exists = prev.some(r => r.id === res.id);
          if (exists) return prev;
          return [res, ...prev];
        });
      }
    } catch (err) {
      console.error('[Reports] Error generating report:', err);
      showToast('Failed to generate AI report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const metrics = report?.metrics || {};
  const isWeekly = activeTab === 'weekly';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Report Center & Executive Intelligence"
        subtitle="Empirical performance snapshots, historical velocity, and AI-synthesized executive summaries."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="ai"
              size="sm"
              onClick={() => handleGenerateReport(activeTab === 'monthly' ? 'monthly' : 'weekly')}
              disabled={loading}
              icon={loading ? RefreshCw : Sparkles}
            >
              {loading ? 'Compiling Report...' : 'Regenerate Report'}
            </Button>
          </div>
        }
      />

      {/* Report Center Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'weekly'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Weekly Report
        </button>

        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'monthly'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Monthly Report
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <History className="w-4 h-4" />
          Report History ({reportHistory.length})
        </button>
      </div>

      {/* REPORT CONTENT VIEW */}
      {activeTab !== 'history' && report && (
        <div className="space-y-6">
          {/* Executive Header Banner */}
          <div className="card-panel p-6 border-indigo-500/40 bg-gradient-to-r from-indigo-950/50 via-zinc-900 to-zinc-900 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-ai px-2.5 py-0.5 text-[10px] font-bold rounded uppercase flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    {isWeekly ? 'Weekly Executive Report' : 'Monthly Executive Report'}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">Period: {metrics.periodLabel}</span>
                </div>
                <h2 className="text-xl font-bold text-zinc-100">
                  Productivity Intelligence Snapshot
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-zinc-100 font-mono">
                    {metrics.productivityScore} <span className="text-xs text-zinc-500 font-normal">/ 100</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                    ↑ 14% vs previous period
                  </span>
                </div>
              </div>
            </div>

            {/* AI Executive Summary Narrative */}
            {report.aiSummary && (
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-indigo-500/30 text-xs text-zinc-300 space-y-1.5">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  AI Executive Summary
                </span>
                <p className="leading-relaxed text-zinc-300">{report.aiSummary}</p>
              </div>
            )}
          </div>

          {/* Core Metrics Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="card-panel p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">Tasks Completed</span>
              <div className="text-2xl font-bold text-zinc-100 font-mono">{metrics.tasksCompleted}</div>
              <span className="text-[10px] text-zinc-500 font-mono block">{metrics.completionRate}% Completion Rate</span>
            </div>

            <div className="card-panel p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">Focus Logged</span>
              <div className="text-2xl font-bold text-indigo-300 font-mono">{metrics.focusTimeFormatted}</div>
              <span className="text-[10px] text-zinc-500 font-mono block">Deep Work Duration</span>
            </div>

            <div className="card-panel p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">Goal Progress</span>
              <div className="text-2xl font-bold text-purple-300 font-mono">{metrics.goalProgressAvg}%</div>
              <span className="text-[10px] text-zinc-500 font-mono block">{metrics.activeGoalsCount} Active Goals</span>
            </div>

            <div className="card-panel p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">Deadline Adherence</span>
              <div className="text-2xl font-bold text-emerald-300 font-mono">{metrics.deadlineAdherenceRate}%</div>
              <span className="text-[10px] text-emerald-400 font-mono block">On-Time Ratio</span>
            </div>

            <div className="card-panel p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase text-rose-400 block">Overdue Tasks</span>
              <div className="text-2xl font-bold text-rose-300 font-mono">{metrics.overdueTasks}</div>
              <span className="text-[10px] text-zinc-500 font-mono block">Requires Attention</span>
            </div>

            <div className="card-panel p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">Best Focus Period</span>
              <div className="text-xs font-bold text-indigo-300 truncate">{metrics.bestFocusPeriod}</div>
              <span className="text-[10px] text-zinc-500 font-mono block">Peak Energy Window</span>
            </div>
          </div>

          {/* Wins & Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wins Card */}
            <div className="card-panel p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                🏆 {isWeekly ? "THIS WEEK'S WINS" : "THIS MONTH'S WINS"}
              </h3>

              <div className="space-y-2.5">
                {(report.wins || []).map((win, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{win}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Challenges Card */}
            <div className="card-panel p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                ⚠️ {isWeekly ? "THIS WEEK'S CHALLENGES" : "THIS MONTH'S CHALLENGES"}
              </h3>

              <div className="space-y-2.5">
                {(report.challenges || []).map((chal, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{chal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Actionable Recommendations */}
          {report.recommendations && report.recommendations.length > 0 && (
            <div className="card-panel p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                🎯 {isWeekly ? "NEXT WEEK RECOMMENDATIONS" : "NEXT MONTH RECOMMENDATIONS"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {report.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase block mb-1">
                        Recommendation #{idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-100">{rec.title}</h4>
                    </div>

                    <Button
                      variant="ai"
                      size="xs"
                      onClick={() => navigate(rec.link || '/goals')}
                      icon={ArrowRight}
                    >
                      {rec.action || 'Execute'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Reports: Goal, Focus & Planner Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-panel p-5 space-y-3">
              <span className="text-xs font-bold uppercase text-indigo-400 block">Goal Performance</span>
              <div className="text-2xl font-bold text-zinc-100 font-mono">{metrics.goalProgressAvg}%</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {metrics.activeGoalsCount} active goals currently tracked across milestones.
              </p>
            </div>

            <div className="card-panel p-5 space-y-3">
              <span className="text-xs font-bold uppercase text-purple-400 block">Focus Performance</span>
              <div className="text-2xl font-bold text-purple-300 font-mono">{metrics.focusTimeFormatted}</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Peak energy window: <strong className="text-zinc-200">{metrics.bestFocusPeriod}</strong>.
              </p>
            </div>

            <div className="card-panel p-5 space-y-3">
              <span className="text-xs font-bold uppercase text-emerald-400 block">Planner Effectiveness</span>
              <div className="text-2xl font-bold text-emerald-300 font-mono">81%</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Smart Daily Planner schedules achieve optimal completion rate under 6 daily tasks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* REPORT HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="card-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            REPORT HISTORY LOGS
          </h3>

          {reportHistory.length > 0 ? (
            <div className="space-y-3">
              {reportHistory.map((rep) => (
                <div key={rep.id} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-xs">
                      {rep.metrics?.productivityScore || 80}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-100 uppercase">
                        {rep.metrics?.reportType} Report ({rep.metrics?.periodLabel})
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        Generated on {new Date(rep.createdAt).toLocaleDateString()} · {rep.metrics?.tasksCompleted} tasks completed
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      setReport(rep);
                      setActiveTab(rep.metrics?.reportType || 'weekly');
                    }}
                  >
                    View Report
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-400 space-y-1">
              <FileText className="w-8 h-8 text-zinc-600 mx-auto" />
              <p>No historical reports saved yet. Click "Generate Report" above to compile a snapshot.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
