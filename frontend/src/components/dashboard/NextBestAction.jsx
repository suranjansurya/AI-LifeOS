import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, AlertCircle, Play, Eye, Bot, Info } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { TaskDetailModal } from '../modals/TaskDetailModal';
import { useApp } from '../../context/AppContext';

export const NextBestAction = () => {
  const navigate = useNavigate();
  const { nextBestAction, startFocusOnTask, sendChatMessage } = useApp();
  const [showReasoningModal, setShowReasoningModal] = useState(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);

  const isAllDone = !nextBestAction || !nextBestAction.id;

  const handleStartFocus = () => {
    if (isAllDone) return;
    startFocusOnTask(nextBestAction);
    navigate('/focus');
  };

  const handleViewTask = () => {
    if (isAllDone) {
      navigate('/tasks');
    } else {
      setShowTaskDetailModal(true);
    }
  };

  const handleAskAi = () => {
    sendChatMessage(`Explain why "${nextBestAction.title}" is my Next Best Action right now.`);
    navigate('/ai');
  };

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl nba-glow p-6 md:p-8 transition-all">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="badge-ai px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              NEXT BEST ACTION
            </span>
            {nextBestAction.score && (
              <span className="hidden sm:inline-block text-xs text-zinc-400 font-mono">
                Score: {nextBestAction.score} pts
              </span>
            )}
          </div>

          <Badge variant={nextBestAction.priority === 'Critical' ? 'critical' : nextBestAction.priority === 'High' ? 'high' : 'medium'} size="sm">
            {nextBestAction.priority || 'Normal'} Priority
          </Badge>
        </div>

        {/* Task Main Details */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight leading-tight mb-2">
            {nextBestAction.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Clock className="w-4 h-4 text-indigo-400" />
              {nextBestAction.durationMinutes || 35} min
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <AlertCircle className="w-4 h-4" />
              {nextBestAction.deadline || 'Today'}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs">
              {nextBestAction.category || 'General'}
            </span>
          </div>
        </div>

        {/* Why Now Box */}
        <div className="p-4 rounded-xl bg-zinc-950/70 border border-indigo-500/20 mb-6 backdrop-blur-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              WHY NOW?
            </span>
            <button
              onClick={() => setShowReasoningModal(true)}
              className="text-xs text-zinc-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              View Scoring Breakdown
            </button>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed italic">
            "{nextBestAction.reasoning}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {!isAllDone && (
            <Button
              variant="ai"
              size="lg"
              onClick={handleStartFocus}
              icon={Play}
            >
              Start Focus
            </Button>
          )}

          <Button
            variant="secondary"
            size="lg"
            onClick={handleViewTask}
            icon={Eye}
          >
            View Task Details
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={handleAskAi}
            icon={Bot}
          >
            Ask AI
          </Button>
        </div>
      </section>

      {/* Reasoning Breakdown Modal */}
      <Modal
        isOpen={showReasoningModal}
        onClose={() => setShowReasoningModal(false)}
        title="Local Recommendation Scoring Engine"
      >
        <div className="space-y-4 text-xs text-zinc-300">
          <p className="text-zinc-400 leading-relaxed">
            The local deterministic scoring engine ranks active tasks using priority weights, deadline proximity, and estimated effort to determine what you should do right now.
          </p>

          <div className="space-y-2 border-t border-b border-zinc-800 py-3">
            <div className="flex justify-between items-center py-1">
              <span className="text-zinc-400">Priority Weight ({nextBestAction.priority || 'Medium'})</span>
              <span className="font-mono text-indigo-400 font-bold">
                +{nextBestAction.priority === 'Critical' ? 40 : nextBestAction.priority === 'High' ? 30 : 20} pts
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-zinc-400">Deadline Proximity ({nextBestAction.deadline || 'Today'})</span>
              <span className="font-mono text-emerald-400 font-bold">+25 pts</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-zinc-400">Ideal Effort Slot ({nextBestAction.durationMinutes || 35} mins)</span>
              <span className="font-mono text-purple-400 font-bold">+10 pts</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-1 text-sm font-bold text-zinc-100">
            <span>Total Task Score:</span>
            <span className="font-mono text-indigo-400">{nextBestAction.score || 75} pts</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="w-full mt-2"
            onClick={() => setShowReasoningModal(false)}
          >
            Got it
          </Button>
        </div>
      </Modal>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={showTaskDetailModal}
        onClose={() => setShowTaskDetailModal(false)}
        task={nextBestAction}
      />
    </>
  );
};
