import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Target, Save, Trash2, Plus, X } from 'lucide-react';

export const GoalModal = ({ isOpen, onClose, goal }) => {
  const { addGoal, updateGoal, deleteGoal } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [targetDate, setTargetDate] = useState('30 Days');
  const [progress, setProgress] = useState(0);
  const [milestones, setMilestones] = useState([
    { id: 'm-1', title: 'Phase 1 Setup', completed: false },
    { id: 'm-2', title: 'Core Implementation', completed: false }
  ]);
  const [newMilestoneText, setNewMilestoneText] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setCategory(goal.category || 'Personal');
      setTargetDate(goal.targetDate || '30 Days');
      setProgress(goal.progress || 0);
      setMilestones(goal.milestones || []);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Personal');
      setTargetDate('30 Days');
      setProgress(0);
      setMilestones([
        { id: 'm-1', title: 'Phase 1 Setup', completed: false },
        { id: 'm-2', title: 'Core Implementation', completed: false }
      ]);
    }
  }, [goal, isOpen]);

  const handleAddMilestone = () => {
    if (!newMilestoneText.trim()) return;
    setMilestones(prev => [
      ...prev,
      { id: `m-${Date.now()}`, title: newMilestoneText, completed: false }
    ]);
    setNewMilestoneText('');
  };

  const handleRemoveMilestone = (mId) => {
    setMilestones(prev => prev.filter(m => m.id !== mId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (goal) {
      updateGoal(goal.id, {
        title,
        description,
        category,
        targetDate,
        progress: parseInt(progress, 10),
        milestones
      });
    } else {
      addGoal({
        title,
        description,
        category,
        targetDate,
        progress: parseInt(progress, 10),
        milestones
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (goal) {
      deleteGoal(goal.id);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goal ? "Edit Goal" : "Create New Goal"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Goal Title
          </label>
          <input
            type="text"
            placeholder="e.g. Master React & LLM Architecture"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="Academics">Academics</option>
              <option value="Career">Career</option>
              <option value="Development">Development</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Target Timeframe
            </label>
            <input
              type="text"
              placeholder="e.g. 30 Days or 6 Months"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Outline your goal objective..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none resize-none"
          />
        </div>

        {/* Milestones Manager */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Milestones Breakdown
          </label>
          <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
            {milestones.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                <span className="text-zinc-200">{m.title}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(m.id)}
                  className="text-zinc-500 hover:text-rose-400 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add milestone item..."
              value={newMilestoneText}
              onChange={(e) => setNewMilestoneText(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
            />
            <Button variant="secondary" size="sm" onClick={handleAddMilestone} icon={Plus}>
              Add
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          {goal ? (
            <Button variant="danger" size="sm" onClick={handleDelete} icon={Trash2}>
              Delete
            </Button>
          ) : <div />}

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="ai" size="sm" type="submit" icon={Save}>
              {goal ? "Save Changes" : "Create Goal"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
