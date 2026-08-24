import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Play, Trash2, Edit2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import { TaskDetailModal } from '../modals/TaskDetailModal';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const TaskItem = ({ task }) => {
  const navigate = useNavigate();
  const { toggleTaskComplete, deleteTask, startFocusOnTask } = useApp();
  const [showDetailModal, setShowDetailModal] = useState(false);

  const isCompleted = task.status === 'Completed';

  const handleStartFocus = (e) => {
    e.stopPropagation();
    startFocusOnTask(task);
    navigate('/focus');
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteTask(task.id);
  };

  return (
    <>
      <div
        onClick={() => setShowDetailModal(true)}
        className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
          isCompleted
            ? 'bg-zinc-900/40 border-zinc-800/50 opacity-60'
            : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskComplete(task.id);
            }}
            className="text-zinc-500 hover:text-emerald-400 transition-colors shrink-0 cursor-pointer p-0.5"
            aria-label={isCompleted ? "Mark task incomplete" : "Mark task complete"}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/10" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <h4 className={`text-sm font-semibold truncate ${isCompleted ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
              {task.title}
            </h4>

            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-zinc-400 font-medium">
              <span className="flex items-center gap-1 font-mono text-zinc-400">
                <Clock className="w-3 h-3 text-indigo-400" />
                {task.estimatedMinutes || task.durationMinutes || 30}m
              </span>
              <span>•</span>
              <span className="text-zinc-400">{task.category || 'General'}</span>
              <span>•</span>
              <span className="text-amber-400">{task.dueDate || task.deadline || 'Today'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          <Badge
            variant={task.priority === 'Critical' ? 'critical' : task.priority === 'High' ? 'high' : 'medium'}
            size="sm"
          >
            {task.priority || 'Normal'}
          </Badge>

          {!isCompleted && (
            <button
              type="button"
              onClick={handleStartFocus}
              className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-950/50 hover:text-indigo-300 transition-colors cursor-pointer"
              title="Start Focus on Task"
            >
              <Play className="w-4 h-4 fill-indigo-400/20" />
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <TaskDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        task={task}
      />
    </>
  );
};
