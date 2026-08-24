import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { Play, Trash2, Sparkles, Clock, AlertCircle, Save } from 'lucide-react';
import { generateWhyNowReasoning } from '../../services/nbaEngine';

export const TaskDetailModal = ({ isOpen, onClose, task }) => {
  const navigate = useNavigate();
  const { updateTask, deleteTask, startFocusOnTask } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Todo');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('Today');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'Medium');
      setStatus(task.status || 'Todo');
      setCategory(task.category || 'General');
      setDueDate(task.dueDate || task.deadline || 'Today');
      setEstimatedMinutes(task.estimatedMinutes || task.durationMinutes || 30);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = (e) => {
    e.preventDefault();
    updateTask(task.id, {
      title,
      description,
      priority,
      status,
      category,
      dueDate,
      deadline: dueDate,
      estimatedMinutes: parseInt(estimatedMinutes, 10),
      durationMinutes: parseInt(estimatedMinutes, 10)
    });
    onClose();
  };

  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  const handleStartFocus = () => {
    startFocusOnTask(task);
    onClose();
    navigate('/focus');
  };

  const reasoning = generateWhyNowReasoning(task);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Intelligence Details" maxWidth="max-w-xl">
      <form onSubmit={handleSave} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Task Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        {/* Priority & Status Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="Critical">Critical (40 pts)</option>
              <option value="High">High (30 pts)</option>
              <option value="Medium">Medium (20 pts)</option>
              <option value="Low">Low (10 pts)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Task Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Category & Due Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Due Date / Deadline
            </label>
            <input
              type="text"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Description & Context Notes
          </label>
          <textarea
            rows={3}
            placeholder="Add detailed sub-steps or context..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none resize-none"
          />
        </div>

        {/* AI Scoring Reasoning Box */}
        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-indigo-500/25">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            AI Recommendation Reasoning
          </span>
          <p className="text-xs text-zinc-300 italic">
            "{reasoning}"
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            icon={Trash2}
          >
            Delete
          </Button>

          <div className="flex items-center gap-2">
            {status !== 'Completed' && (
              <Button
                variant="ai"
                size="sm"
                onClick={handleStartFocus}
                icon={Play}
              >
                Start Focus
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              type="submit"
              icon={Save}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
