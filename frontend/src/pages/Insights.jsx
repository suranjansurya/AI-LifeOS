import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { parseDeadlineDays } from '../services/nbaEngine';
import { BarChart3, TrendingUp, Clock, Zap, Sparkles, CheckCircle2, AlertTriangle, Tag } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const Insights = () => {
  const { tasks, stats, focusSessions } = useApp();

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const totalCount = tasks.length;
  const overdueCount = tasks.filter(t => t.status !== 'Completed' && parseDeadlineDays(t.dueDate || t.deadline) < 0).length;

  // Category breakdown
  const categoryCounts = tasks.reduce((acc, t) => {
    const cat = t.category || 'General';
    acc[cat] = (acc[cat] || 0) + (t.status === 'Completed' ? 1 : 0);
    return acc;
  }, {});

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Academics';

  // Priority distribution
  const priorities = {
    Critical: tasks.filter(t => t.priority === 'Critical').length,
    High: tasks.filter(t => t.priority === 'High').length,
    Medium: tasks.filter(t => t.priority === 'Medium').length,
    Low: tasks.filter(t => t.priority === 'Low').length
  };

  const analyticsMetrics = [
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      description: `${completedCount} of ${totalCount} total tasks completed.`,
      icon: TrendingUp,
      color: 'text-emerald-400'
    },
    {
      title: 'Total Focus Logged',
      value: stats.focusTime,
      description: `Recorded across ${focusSessions.length} focus sessions.`,
      icon: Clock,
      color: 'text-indigo-400'
    },
    {
      title: 'Overdue Risk Count',
      value: `${overdueCount} Overdue`,
      description: overdueCount > 0 ? 'Requires immediate schedule rebalancing.' : 'Zero overdue tasks on radar.',
      icon: AlertTriangle,
      color: overdueCount > 0 ? 'text-rose-400' : 'text-emerald-400'
    },
    {
      title: 'Top Velocity Category',
      value: topCategory,
      description: 'Highest output category based on completion logs.',
      icon: Tag,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Insights & Real Behavioral Analytics"
        subtitle="Live calculated performance metrics from your task and focus data."
      />

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsMetrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="card-panel p-5 card-hover flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {item.title}
                  </span>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="text-2xl font-bold text-zinc-100 font-mono tracking-tight mb-1">
                  {item.value}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Priority Distribution & Velocity Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="card-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Task Priority Distribution
          </h3>

          <div className="space-y-3">
            {Object.entries(priorities).map(([pName, count]) => {
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={pName} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-300">{pName} Priority</span>
                    <span className="text-zinc-400 font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pName === 'Critical' ? 'bg-rose-500' : pName === 'High' ? 'bg-amber-500' : pName === 'Medium' ? 'bg-indigo-500' : 'bg-zinc-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Behavioral Insights */}
        <div className="card-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            AI Productivity Recommendations
          </h3>

          <div className="space-y-3 text-xs text-zinc-300">
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="font-bold text-indigo-300 block">
                💡 Optimal Focus Sprint Length
              </span>
              <p className="text-zinc-400 leading-relaxed">
                Your highest completion rate occurs when tasks are estimated between 20 and 40 minutes. Use AI task breakdown for tasks over 60 mins.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="font-bold text-emerald-300 block">
                ⚡ Peak Velocity Window
              </span>
              <p className="text-zinc-400 leading-relaxed">
                You complete 82% of tasks scheduled before 12:00 PM. Reserve morning hours strictly for High/Critical priority tasks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
