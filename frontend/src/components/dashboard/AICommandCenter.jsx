import React, { useState, useEffect } from 'react';
import { Sparkles, Play, ArrowRight, Bot, Clock, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { TaskDetailModal } from '../modals/TaskDetailModal';
import { aiService } from '../../services/aiService';

export const AICommandCenter = () => {
  const navigate = useNavigate();
  const {
    profile,
    tasks,
    goals,
    nextBestAction,
    startFocusOnTask,
    toggleTaskComplete
  } = useApp();

  const [selectedTaskModal, setSelectedTaskModal] = useState(null);
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-fetch intelligence breakdown when tasks change
  useEffect(() => {
    aiService.getIntelligenceSummary(tasks, goals).then(res => {
      if (res && res.success) {
        setIntelligenceData(res);
      }
    });
  }, [tasks.length, tasks]);

  const workload = intelligenceData?.workload || {
    totalActive: tasks.filter(t => t.status !== 'Completed').length,
    criticalCount: tasks.filter(t => t.status !== 'Completed' && t.priority === 'Critical').length,
    importantCount: tasks.filter(t => t.status !== 'Completed' && (t.priority === 'High' || t.priority === 'Medium')).length,
    lowCount: tasks.filter(t => t.status !== 'Completed' && t.priority === 'Low').length,
    overdueCount: tasks.filter(t => t.status !== 'Completed' && (t.dueDate || '').toLowerCase().includes('overdue')).length
  };

  const topNba = intelligenceData?.nextBestAction?.task || nextBestAction?.task;
  const whyNowText = intelligenceData?.nextBestAction?.whyNow || nextBestAction?.reasoning || 'Task prioritized based on close deadline and high impact.';
  const aiScore = intelligenceData?.nextBestAction?.scores?.totalScore || 94;

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-4">
      {/* AI Command Center Header Banner */}
      <div className="card-panel p-6 border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-ai px-2.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                AI Command Center
              </span>
              <span className="text-xs text-zinc-500 font-mono">Real-Time Proactive Intelligence</span>
            </div>

            <h1 className="text-xl md:text-2xl font-extrabold text-zinc-100 tracking-tight">
              {getGreetingTime()}, {profile.name || 'User'}.
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              I analyzed your current workload ({workload.totalActive} active items). Here is your optimal next action to maintain peak progress.
            </p>
          </div>

          {/* Workload Pills */}
          <div className="flex flex-wrap gap-2 shrink-0">
            {workload.overdueCount > 0 && (
              <span className="px-3 py-1.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 font-bold flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                {workload.overdueCount} Overdue
              </span>
            )}
            <span className="px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300 font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {workload.criticalCount} Critical
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              {workload.importantCount} Important
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-medium">
              {workload.lowCount} Low Priority
            </span>
          </div>
        </div>
      </div>

      {/* NEXT BEST ACTION Spotlight Card */}
      {topNba ? (
        <div className="card-panel p-6 border-indigo-500/40 relative overflow-hidden bg-gradient-to-b from-indigo-950/20 via-zinc-900 to-zinc-900 shadow-xl shadow-indigo-950/20">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="badge-ai px-2.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                Next Best Action
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                {topNba.category || 'General'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">AI Score</span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold shadow-md shadow-indigo-500/20">
                {aiScore}/100
              </span>
            </div>
          </div>

          <h2 className="text-lg md:text-xl font-bold text-zinc-100 mb-2">
            {topNba.title}
          </h2>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mb-4 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {topNba.estimatedMinutes || topNba.durationMinutes || 35} mins
            </span>
            <span>•</span>
            <Badge variant={topNba.priority === 'Critical' ? 'high' : topNba.priority === 'High' ? 'high' : 'medium'} size="sm">
              {topNba.priority} Priority
            </Badge>
            <span>•</span>
            <span className="text-zinc-300">
              Due: {topNba.dueDate || topNba.deadline || 'Today'}
            </span>
          </div>

          {/* WHY NOW Box */}
          <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 mb-5 leading-relaxed flex items-start gap-2.5">
            <Bot className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-300 block mb-0.5">WHY NOW?</span>
              <span>{whyNowText}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ai"
              size="md"
              onClick={() => {
                startFocusOnTask(topNba);
                navigate('/focus');
              }}
              icon={Play}
            >
              Start Focus Session
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={() => setSelectedTaskModal(topNba)}
            >
              View Details
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/ai')}
              icon={Bot}
            >
              Ask AI Assistant
            </Button>
          </div>
        </div>
      ) : (
        <div className="card-panel p-8 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
          <h3 className="text-base font-bold text-zinc-100">All Tasks Clear!</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            You have completed all active workload tasks. Take a rest or add a new goal!
          </p>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTaskModal && (
        <TaskDetailModal
          isOpen={Boolean(selectedTaskModal)}
          onClose={() => setSelectedTaskModal(null)}
          task={selectedTaskModal}
        />
      )}
    </div>
  );
};
