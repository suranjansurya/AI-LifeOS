import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { getHubIntelligenceAi } from '../services/aiService';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Sliders,
  Calendar,
  Target,
  BarChart2,
  Bell,
  X,
  Play
} from 'lucide-react';

export const Hub = () => {
  const navigate = useNavigate();
  const {
    tasks,
    goals,
    milestones,
    calendarEvents,
    focusSessions,
    memories,
    notifications,
    setActiveFocusTask,
    showToast
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'insight' | 'risk' | 'opportunity'
  const [hubData, setHubData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);

  const fetchHubData = async () => {
    setLoading(true);
    try {
      const res = await getHubIntelligenceAi({
        tasks,
        goals,
        milestones,
        calendarEvents,
        focusSessions,
        memories,
        notifications
      });
      setHubData(res);
    } catch (e) {
      showToast('Intelligence Hub data sync error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubData();
  }, [tasks, goals, notifications]);

  const handleDismiss = (id) => {
    setDismissedIds(prev => [...prev, id]);
    showToast('Dismissed intelligence card.', 'info');
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

  const filteredFeed = (hubData?.intelligenceFeed || []).filter(item => {
    if (dismissedIds.includes(item.id)) return false;
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI LifeOS Intelligence Hub"
        subtitle="Central context engine synthesizing tasks, goals, calendar commitments, focus patterns, and personal memory."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHubData}
            disabled={loading}
            icon={RefreshCw}
          >
            {loading ? 'Syncing Hub...' : 'Refresh Hub'}
          </Button>
        }
      />

      {hubData && (
        <>
          {/* LifeOS Health Score & Status Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SCORE GAUGE CARD */}
            <div className="card-panel p-6 border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-900 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    LifeOS Health Score
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                    REAL-TIME
                  </span>
                </div>

                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-mono">
                    {hubData.lifeOSScore}
                  </span>
                  <span className="text-sm text-zinc-500 font-mono">/ 100</span>
                </div>

                <p className="text-xs text-zinc-300">
                  Unified productivity state score calculated deterministically across active workload, goal health, and focus adherence.
                </p>
              </div>

              {/* Status Summary Grid */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-800">
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center">
                  <span className="text-xs font-bold text-zinc-200 block">{hubData.statusSummary?.activeTasksCount} Active Tasks</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{hubData.statusSummary?.completedTasksCount} completed</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center">
                  <span className="text-xs font-bold text-emerald-300 block">{hubData.statusSummary?.activeGoalsCount} Goals Active</span>
                  <span className="text-[10px] text-rose-400 font-mono">{hubData.statusSummary?.goalsAtRiskCount} at risk</span>
                </div>
              </div>
            </div>

            {/* SCORE BREAKDOWN METRICS TABLE */}
            <div className="lg:col-span-2 card-panel p-6 space-y-4">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                Score Breakdown & Formula Weights
              </h3>

              <div className="space-y-3">
                {Object.values(hubData.scoreBreakdown || {}).map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-zinc-300">{item.label} ({item.weight})</span>
                      <span className="font-mono text-indigo-300 font-bold">{item.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TOP PRIORITY ACTION CARD */}
          {hubData.topPriority && (
            <div className="card-panel nba-glow p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
                  <Zap className="w-5 h-5 text-indigo-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-ai px-2 py-0.5 text-[10px] font-bold rounded uppercase">
                      CURRENT TOP SYSTEM PRIORITY
                    </span>
                    <Badge variant="danger" size="sm">{hubData.topPriority.priority}</Badge>
                  </div>
                  <h3 className="text-base font-bold text-zinc-100">{hubData.topPriority.title}</h3>
                  <p className="text-xs text-zinc-300 mt-0.5">{hubData.topPriority.reason}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ai"
                  size="md"
                  onClick={() => handleActionClick({ actionType: 'focus', entityId: hubData.topPriority.taskId })}
                  icon={Play}
                >
                  Start Focus Sprint
                </Button>
              </div>
            </div>
          )}

          {/* CROSS-MODULE INTELLIGENCE FEED */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" />
                Cross-Module Intelligence Feed ({filteredFeed.length})
              </h3>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'insight', label: '💡 Insights' },
                  { id: 'risk', label: '⚠️ Risks' },
                  { id: 'opportunity', label: '⚡ Opportunities' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      activeFilter === cat.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFeed.length > 0 ? (
                filteredFeed.map(item => (
                  <div
                    key={item.id}
                    className={`card-panel p-5 card-hover flex flex-col justify-between space-y-3 border-zinc-800/80 ${
                      item.type === 'risk' ? 'border-rose-500/30' :
                      item.type === 'opportunity' ? 'border-indigo-500/30' : 'border-zinc-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
                          item.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                          item.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        }`}>
                          {item.type.toUpperCase()} • {item.priority}
                        </span>

                        <button
                          onClick={() => handleDismiss(item.id)}
                          className="p-1 text-zinc-500 hover:text-zinc-300 rounded cursor-pointer"
                          title="Dismiss Item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-zinc-100">{item.title}</h4>
                      <p className="text-xs text-zinc-300 leading-relaxed mt-1">{item.description}</p>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 font-mono">Entity: {item.entityType || 'system'}</span>
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
                <div className="col-span-full py-12 text-center text-xs text-zinc-500 space-y-2">
                  <Brain className="w-8 h-8 text-zinc-700 mx-auto" />
                  <p>No intelligence items matching this filter.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
