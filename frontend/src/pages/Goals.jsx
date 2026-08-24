import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { GoalModal } from '../components/modals/GoalModal';
import { useApp } from '../context/AppContext';
import { Target, Plus, Calendar, Sparkles, Edit2 } from 'lucide-react';

export const Goals = () => {
  const { goals, setGoals } = useApp();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const handleOpenNewGoal = () => {
    setSelectedGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleOpenEditGoal = (goal) => {
    setSelectedGoal(goal);
    setIsGoalModalOpen(true);
  };

  const toggleMilestone = (goalId, milestoneId) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const updatedMilestones = g.milestones.map(m =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = updatedMilestones.filter(m => m.completed).length;
        const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);

        return {
          ...g,
          progress: newProgress,
          milestones: updatedMilestones
        };
      }
      return g;
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Goals & Milestones"
        subtitle="Long-term roadmaps automatically decomposed into daily action items."
        action={
          <Button
            variant="ai"
            size="sm"
            onClick={handleOpenNewGoal}
            icon={Plus}
          >
            New Goal
          </Button>
        }
      />

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <div key={goal.id} className="card-panel p-6 card-hover flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <Badge variant="primary" size="sm">
                  {goal.category}
                </Badge>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Target: {goal.targetDate}
                  </div>
                  <button
                    onClick={() => handleOpenEditGoal(goal)}
                    className="p-1 text-zinc-500 hover:text-indigo-400 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Edit Goal"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
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
                  Key Milestones
                </span>
                {goal.milestones.map((m) => (
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

            <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                AI Auto-decomposing
              </span>
              <span className="font-mono text-indigo-400">{goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} Done</span>
            </div>
          </div>
        ))}
      </div>

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goal={selectedGoal}
      />
    </div>
  );
};
