import React, { useState } from 'react';
import { Sparkles, X, CheckCircle2, RefreshCw, Layers, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { breakdownGoalAi } from '../../services/aiService';

export const GoalBreakdownModal = ({ isOpen, onClose, goal = null, onAccepted }) => {
  const { addGoal, addTask, showToast } = useApp();

  const [goalTitle, setGoalTitle] = useState(goal?.title || 'Learn React & Build Projects');
  const [timeframeText, setTimeframeText] = useState(goal?.targetDate || '30 Days');
  const [loading, setLoading] = useState(false);
  const [breakdownData, setBreakdownData] = useState(null);

  if (!isOpen) return null;

  const handleGenerateBreakdown = async () => {
    if (!goalTitle.trim()) return;
    setLoading(true);
    try {
      const res = await breakdownGoalAi(goalTitle, timeframeText);
      if (res && res.milestones) {
        setBreakdownData(res);
      }
    } catch (err) {
      console.error('[GoalBreakdownModal] Error generating breakdown:', err);
      showToast('Failed to generate AI goal breakdown.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMilestones = () => {
    if (!breakdownData || !breakdownData.milestones) return;

    // 1. Create or Update Goal
    const targetGoalId = goal?.id || `goal-${Date.now()}`;
    if (!goal) {
      addGoal({
        title: goalTitle,
        category: 'Career',
        targetDate: timeframeText,
        progress: 0,
        milestones: breakdownData.milestones.map((m, idx) => ({
          id: `m-${Date.now()}-${idx}`,
          title: m.title,
          timeframe: m.timeframe,
          completed: false
        }))
      });
    }

    // 2. Insert Linked Tasks for each milestone
    let addedCount = 0;
    breakdownData.milestones.forEach((m, mIdx) => {
      (m.tasks || []).forEach(t => {
        addTask({
          title: t.title,
          category: 'Goal Milestone',
          priority: t.priority || 'High',
          estimatedMinutes: t.estimatedMinutes || 35,
          dueDate: m.timeframe || 'This Week',
          goalId: targetGoalId
        });
        addedCount++;
      });
    });

    showToast(`🏆 Accepted AI Goal Breakdown! Created milestones & ${addedCount} linked tasks.`, 'success');
    if (onAccepted) onAccepted(breakdownData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/50 via-zinc-900 to-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">AI Goal Milestone Breakdown</h2>
              <p className="text-[11px] text-zinc-400">Decompose high-level goals into milestone stages & daily tasks</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Goal Objective</label>
              <input
                type="text"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g. Learn React & Build Projects"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Timeframe</label>
              <input
                type="text"
                value={timeframeText}
                onChange={(e) => setTimeframeText(e.target.value)}
                placeholder="e.g. 30 Days"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="ai"
              size="sm"
              onClick={handleGenerateBreakdown}
              disabled={loading || !goalTitle.trim()}
              icon={loading ? RefreshCw : Sparkles}
            >
              {loading ? 'Decomposing Goal...' : 'Generate Milestones'}
            </Button>
          </div>

          {/* Breakdown Results Preview */}
          {breakdownData && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Generated Milestone Blueprint ({breakdownData.milestones.length} Phases)
                </span>
                <Badge variant="ai" size="sm">
                  Preview State
                </Badge>
              </div>

              <div className="space-y-3">
                {breakdownData.milestones.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 text-[10px] font-mono font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-100">{m.title}</h4>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                        {m.timeframe}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed pl-7">{m.description}</p>

                    {m.tasks && m.tasks.length > 0 && (
                      <div className="pl-7 pt-1 space-y-1">
                        <span className="text-[10px] font-semibold uppercase text-zinc-500 block">Generated Action Items:</span>
                        {m.tasks.map((t, tIdx) => (
                          <div key={tIdx} className="text-xs text-zinc-300 flex items-center justify-between p-2 rounded bg-zinc-950/60 border border-zinc-800/60">
                            <span>{t.title}</span>
                            <span className="text-[10px] font-mono text-zinc-500">{t.estimatedMinutes}m · {t.priority}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <Button variant="outline" size="sm" onClick={() => setBreakdownData(null)}>
                  Discard
                </Button>
                <Button variant="ai" size="sm" onClick={handleAcceptMilestones} icon={CheckCircle2}>
                  Accept & Save Goal Blueprint
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
