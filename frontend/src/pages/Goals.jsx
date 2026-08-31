import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { GoalModal } from '../components/modals/GoalModal';
import { GoalBreakdownModal } from '../components/modals/GoalBreakdownModal';
import { useApp } from '../context/AppContext';
import { analyzeGoalAi } from '../services/aiService';
import {
  Target,
  Plus,
  Calendar,
  Sparkles,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  BarChart3,
  Bot,
  Trash2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const Goals = () => {
  const { goals, setGoals, tasks, deleteTask, deleteGoal, showToast } = useApp();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [selectedGoalForBreakdown, setSelectedGoalForBreakdown] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [analyzingGoalId, setAnalyzingGoalId] = useState(null);
  const [deleteWarningGoal, setDeleteWarningGoal] = useState(null);

  const handleOpenNewGoal = () => {
    setSelectedGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleOpenEditGoal = (goal) => {
    setSelectedGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleOpenBreakdown = (goal) => {
    setSelectedGoalForBreakdown(goal);
    setIsBreakdownModalOpen(true);
  };

  const handleAnalyzeGoal = async (goal) => {
    setAnalyzingGoalId(goal.id);
    try {
      const linkedTasks = tasks.filter(t => t.goalId === goal.id || (t.category || '').toLowerCase() === (goal.category || '').toLowerCase());
      const res = await analyzeGoalAi(goal, linkedTasks, goal.milestones || []);
      if (res && res.analysis) {
        setAnalysisData({ goal, ...res.analysis });
      }
    } catch (err) {
      console.error('[Goals] Error analyzing goal:', err);
      showToast('Failed to run AI goal analysis.', 'error');
    } finally {
      setAnalyzingGoalId(null);
    }
  };

  const calculateGoalHealthBadge = (goal) => {
    const linkedTasks = tasks.filter(t => t.goalId === goal.id);
    let progress = goal.progress || 0;
    if (linkedTasks.length > 0) {
      const done = linkedTasks.filter(t => t.status === 'Completed').length;
      progress = Math.round((done / linkedTasks.length) * 100);
    }

    if (progress >= 100) return { label: 'COMPLETED', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: CheckCircle2 };
    if (progress < 30) return { label: 'BEHIND', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: AlertTriangle };
    if (progress < 60) return { label: 'AT RISK', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: Clock };
    return { label: 'ON TRACK', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: CheckCircle2 };
  };

  const toggleMilestone = (goalId, milestoneId) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const updatedMilestones = (g.milestones || []).map(m =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = updatedMilestones.filter(m => m.completed).length;
        const newProgress = updatedMilestones.length > 0 ? Math.round((completedCount / updatedMilestones.length) * 100) : g.progress;

        return {
          ...g,
          progress: newProgress,
          milestones: updatedMilestones
        };
      }
      return g;
    }));
  };

  // Dashboard Stats Calculations
  const totalGoals = goals.length;
  const activeGoals = goals.filter(g => g.progress < 100).length;
  const completedGoals = goals.filter(g => g.progress >= 100).length;
  const atRiskGoals = goals.filter(g => g.progress < 50 && g.progress > 0).length;
  const avgProgress = totalGoals > 0 ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / totalGoals) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Goal & Milestone OS"
        subtitle="Hierarchy goal management connecting strategic roadmaps to daily tasks and focus sessions."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="ai"
              size="sm"
              onClick={() => handleOpenBreakdown(null)}
              icon={Sparkles}
            >
              AI Break Down Goal
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenNewGoal}
              icon={Plus}
            >
              New Goal
            </Button>
          </div>
        }
      />

      {/* Goal Dashboard Stats Header */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="card-panel p-4 flex flex-col justify-between">
          <span className="text-xs text-zinc-400 font-medium">Total Goals</span>
          <div className="text-2xl font-bold text-zinc-100 font-mono mt-1">{totalGoals}</div>
        </div>

        <div className="card-panel p-4 flex flex-col justify-between">
          <span className="text-xs text-emerald-400 font-medium">Active Goals</span>
          <div className="text-2xl font-bold text-emerald-300 font-mono mt-1">{activeGoals}</div>
        </div>

        <div className="card-panel p-4 flex flex-col justify-between">
          <span className="text-xs text-blue-400 font-medium">Completed</span>
          <div className="text-2xl font-bold text-blue-300 font-mono mt-1">{completedGoals}</div>
        </div>

        <div className="card-panel p-4 flex flex-col justify-between">
          <span className="text-xs text-rose-400 font-medium">At Risk / Behind</span>
          <div className="text-2xl font-bold text-rose-300 font-mono mt-1">{atRiskGoals}</div>
        </div>

        <div className="card-panel p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-xs text-indigo-400 font-medium">Avg Progress</span>
          <div className="text-2xl font-bold text-indigo-300 font-mono mt-1">{avgProgress}%</div>
        </div>
      </div>

      {/* AI Diagnostic Analysis Spotlight */}
      {analysisData && (
        <div className="card-panel p-5 border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="badge-ai px-2.5 py-0.5 text-[10px] font-bold rounded uppercase flex items-center gap-1">
                <Bot className="w-3 h-3 text-indigo-400 animate-pulse" />
                AI Diagnostic Report: {analysisData.goal.title}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${
                analysisData.currentStatus === 'ON TRACK' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {analysisData.currentStatus}
              </span>
            </div>
            <button onClick={() => setAnalysisData(null)} className="text-zinc-500 hover:text-zinc-300">
              <X className="w-4 h-4" opacity={0} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="font-bold text-emerald-400 block">✓ WHAT'S GOING WELL</span>
              <p className="text-zinc-300">{analysisData.goingWell}</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="font-bold text-amber-400 block">⚠️ BOTTLENECK ANALYSIS</span>
              <p className="text-zinc-300">{analysisData.bottlenecks}</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="font-bold text-indigo-300 block">💡 RECOMMENDED ACTIONS</span>
              <ul className="list-disc pl-4 space-y-0.5 text-zinc-300">
                {analysisData.recommendedActions?.map((act, idx) => (
                  <li key={idx}>{act}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const health = calculateGoalHealthBadge(goal);
          const Icon = health.icon;
          const linkedTasks = tasks.filter(t => t.goalId === goal.id);

          return (
            <div key={goal.id} className="card-panel p-6 card-hover flex flex-col justify-between group relative border-zinc-800/80 hover:border-indigo-500/40">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      {goal.category}
                    </Badge>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase flex items-center gap-1 ${health.color}`}>
                      <Icon className="w-3 h-3" />
                      {health.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      {goal.targetDate}
                    </div>
                    <button
                      onClick={() => handleOpenEditGoal(goal)}
                      className="p-1 text-zinc-500 hover:text-indigo-400 rounded transition-colors cursor-pointer"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteWarningGoal(goal)}
                      className="p-1 text-zinc-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-zinc-100 mb-2">
                  {goal.title}
                </h3>

                {goal.description && (
                  <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                    {goal.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="space-y-1.5 mb-6">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-400">Roadmap Progress</span>
                    <span className="text-indigo-400 font-mono">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones Breakdown */}
                <div className="space-y-2 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                    Key Milestones ({(goal.milestones || []).filter(m => m.completed).length}/{(goal.milestones || []).length})
                  </span>
                  {(goal.milestones || []).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => toggleMilestone(goal.id, m.id)}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={m.completed}
                        onChange={() => {}}
                        className="rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className={`text-xs ${m.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ai"
                    size="xs"
                    onClick={() => handleAnalyzeGoal(goal)}
                    disabled={analyzingGoalId === goal.id}
                    icon={analyzingGoalId === goal.id ? Clock : Bot}
                  >
                    {analyzingGoalId === goal.id ? 'Analyzing...' : 'AI Analyze'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => handleOpenBreakdown(goal)}
                    icon={Layers}
                  >
                    AI Break Down
                  </Button>
                </div>

                <span className="font-mono text-[11px] text-zinc-500">
                  {linkedTasks.length} Linked Tasks
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Safety Warning Modal */}
      {deleteWarningGoal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-950 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <h3 className="text-base font-bold text-zinc-100">Confirm Goal Deletion</h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-zinc-100">"{deleteWarningGoal.title}"</strong>?
              This goal has {(deleteWarningGoal.milestones || []).length} milestones and {tasks.filter(t => t.goalId === deleteWarningGoal.id).length} linked tasks.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  deleteGoal(deleteWarningGoal.id);
                  setDeleteWarningGoal(null);
                  showToast(`Goal "${deleteWarningGoal.title}" deleted.`, 'info');
                }}
              >
                Delete Goal Only
              </Button>
              <Button
                variant="ai"
                size="sm"
                onClick={() => {
                  const linked = tasks.filter(t => t.goalId === deleteWarningGoal.id);
                  linked.forEach(t => deleteTask(t.id));
                  deleteGoal(deleteWarningGoal.id);
                  setDeleteWarningGoal(null);
                  showToast(`Goal and ${linked.length} linked tasks deleted.`, 'info');
                }}
              >
                Delete Goal + All Linked Data
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteWarningGoal(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goal={selectedGoal}
      />

      {/* Goal Breakdown Modal */}
      <GoalBreakdownModal
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        goal={selectedGoalForBreakdown}
      />
    </div>
  );
};
