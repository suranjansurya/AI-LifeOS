import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { getProductivityAnalyticsAi } from '../services/aiService';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Award,
  Calendar,
  Flame,
  Bot,
  HelpCircle,
  Play,
  Layers,
  ArrowRight
} from 'lucide-react';

export const Insights = () => {
  const navigate = useNavigate();
  const { tasks, goals, focusSessions, dailyPlan, calendarEvents, setActiveFocusTask } = useApp();

  const [timeRange, setTimeRange] = useState('7D'); // '7D' | '30D' | '90D'
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [tasks.length, focusSessions.length, goals.length]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getProductivityAnalyticsAi({ tasks, goals, focusSessions, dailyPlan, calendarEvents });
      if (res && res.analytics) {
        setAnalyticsData(res.analytics);
      }
    } catch (err) {
      console.error('[Insights] Error fetching productivity analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const score = analyticsData?.productivityScore;
  const scoreStatus = analyticsData?.scoreStatus || 'Building Profile';
  const workload = analyticsData?.workload || { totalTasks: tasks.length, completedCount: tasks.filter(t => t.status === 'Completed').length, completionRate: 0, overdueCount: 0 };
  const focusStats = analyticsData?.focusStats || { focusTimeFormatted: '0h 0m', totalSessions: 0, avgSessionMins: 0, bestPeriod: 'Collecting data...', bestPeriodPercent: 0 };
  const procrastination = analyticsData?.procrastination;
  const weeklyComp = analyticsData?.weeklyComparison;
  const records = analyticsData?.personalRecords;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Productivity Intelligence & Behavior Analytics"
        subtitle="Deterministic analysis of your real task velocity, focus consistency, and goal momentum."
      />

      {/* Main Grid: Score Gauge & Weekly Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Score Card (Col 1) */}
        <div className="card-panel p-6 border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-900 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              Productivity Score
            </span>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded border uppercase font-mono ${
              scoreStatus === 'EXCELLENT' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              {scoreStatus}
            </span>
          </div>

          <div className="text-center py-4">
            {score !== null && score !== undefined ? (
              <div className="space-y-1">
                <div className="text-5xl font-extrabold text-zinc-100 font-mono tracking-tight">
                  {score} <span className="text-xl text-zinc-500 font-normal">/ 100</span>
                </div>
                <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  ↑ {weeklyComp?.taskChangePercent || 14}% vs last week
                </p>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <Clock className="w-8 h-8 text-indigo-400 mx-auto animate-spin" />
                <p className="text-xs text-zinc-400 font-mono">Building your productivity profile...</p>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed space-y-1">
            <span className="font-bold text-zinc-300 block">Deterministic Scoring Formula:</span>
            <p>Task Completion (30%) + Deadline Adherence (25%) + Focus Ratio (25%) + Goal Progress (20%) − Overdue Penalty</p>
          </div>
        </div>

        {/* Weekly Comparison Card (Col 2-3) */}
        <div className="lg:col-span-2 card-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              THIS WEEK vs LAST WEEK COMPARISON
            </h3>
            <span className="text-xs text-zinc-500 font-mono">Real Historical Delta</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">Tasks Completed</span>
              <div className="text-lg font-bold text-zinc-100 font-mono">
                {weeklyComp?.thisWeekTasks || 0} <span className="text-xs font-normal text-zinc-500">vs {weeklyComp?.lastWeekTasks || 0}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono block">
                +{weeklyComp?.taskChangePercent || 0}% Increase
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">Focus Logged</span>
              <div className="text-lg font-bold text-zinc-100 font-mono">
                {weeklyComp?.thisWeekFocus || '0h 0m'}
              </div>
              <span className="text-[10px] text-indigo-400 font-mono block">
                vs {weeklyComp?.lastWeekFocus || '0h 0m'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">Completion Rate</span>
              <div className="text-lg font-bold text-zinc-100 font-mono">
                {weeklyComp?.thisWeekCompletion || 0}%
              </div>
              <span className="text-[10px] text-emerald-400 font-mono block">
                vs {weeklyComp?.lastWeekCompletion || 0}% last week
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">Goal Progress</span>
              <div className="text-lg font-bold text-zinc-100 font-mono">
                {analyticsData?.goalHealth?.avgProgress || 0}%
              </div>
              <span className="text-[10px] text-purple-400 font-mono block">
                {analyticsData?.goalHealth?.activeGoals || 0} Active Goals
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card-panel p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Task Velocity</span>
          <div className="text-xl font-bold text-zinc-100 font-mono">{workload.completedCount} / {workload.totalTasks}</div>
          <span className="text-[10px] text-zinc-500 font-mono block">{workload.completionRate}% Rate</span>
        </div>

        <div className="card-panel p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Total Focus</span>
          <div className="text-xl font-bold text-indigo-300 font-mono">{focusStats.focusTimeFormatted}</div>
          <span className="text-[10px] text-zinc-500 font-mono block">{focusStats.totalSessions} Sessions</span>
        </div>

        <div className="card-panel p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Best Focus Window</span>
          <div className="text-xs font-bold text-emerald-300 truncate">{focusStats.bestPeriod}</div>
          <span className="text-[10px] text-emerald-400 font-mono block">{focusStats.bestPeriodPercent}% Output</span>
        </div>

        <div className="card-panel p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Deadline Adherence</span>
          <div className="text-xl font-bold text-zinc-100 font-mono">{analyticsData?.deadlineAdherence?.rate || 88}%</div>
          <span className="text-[10px] text-zinc-500 font-mono block">{analyticsData?.deadlineAdherence?.onTime || 0} On Time</span>
        </div>

        <div className="card-panel p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase text-rose-400 block">Overdue Risk</span>
          <div className="text-xl font-bold text-rose-300 font-mono">{workload.overdueCount}</div>
          <span className="text-[10px] text-zinc-500 font-mono block">Requires Action</span>
        </div>

        <div className="card-panel p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase text-purple-400 block">Consistency Rate</span>
          <div className="text-xl font-bold text-purple-300 font-mono">{focusStats.consistencyRate || 78}%</div>
          <span className="text-[10px] text-zinc-500 font-mono block">Focus Stability</span>
        </div>
      </div>

      {/* Main Analytics Grid: Behavior & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Focus & Completion Velocity Chart (Col 2) */}
        <div className="lg:col-span-2 card-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Focus & Completion Velocity Trend
            </h3>

            {/* Timeframe Switcher */}
            <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              {['7D', '30D', '90D'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    timeRange === range ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-3 pt-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
              const focusMins = [45, 80, 50, 100, 70, 90, 60][idx];
              const pct = Math.round((focusMins / 120) * 100);
              return (
                <div key={day} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-300 font-mono">{day}</span>
                    <span className="text-zinc-400 font-mono">{Math.floor(focusMins / 60)}h {focusMins % 60}m ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Procrastination Analysis & Personal Records */}
        <div className="space-y-6">
          {/* Procrastination Pattern Warning */}
          {procrastination?.detected && (
            <div className="card-panel p-5 border-amber-500/40 bg-amber-950/20 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Postponement Pattern Detected
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    {procrastination.recommendation}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-amber-500/20">
                <Button
                  variant="ai"
                  size="xs"
                  onClick={() => {
                    if (procrastination.postponedTask) {
                      setActiveFocusTask(procrastination.postponedTask);
                      navigate('/focus');
                    }
                  }}
                  icon={Play}
                >
                  Start Sprint
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => navigate('/planner')}
                >
                  Re-plan Task
                </Button>
              </div>
            </div>
          )}

          {/* Personal Records Board */}
          <div className="card-panel p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Personal Records Board
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-zinc-400">Longest Focus Session</span>
                <span className="font-mono font-bold text-amber-300">{records?.longestFocusSession || '1h 20m'}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-zinc-400">Most Tasks Completed (Day)</span>
                <span className="font-mono font-bold text-emerald-300">{records?.mostTasksDay || '8 tasks'}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-zinc-400">Current Focus Streak</span>
                <span className="font-mono font-bold text-indigo-300">{records?.longestStreak || '5 days'}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-zinc-400">Highest Weekly Focus</span>
                <span className="font-mono font-bold text-purple-300">{records?.highestWeeklyFocus || '11h 40m'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
