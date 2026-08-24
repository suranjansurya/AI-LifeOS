import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { Sparkles, CheckSquare, Plus, Loader2 } from 'lucide-react';

export const TaskBreakdownModal = ({ isOpen, onClose }) => {
  const { addTask, profile, tasks, goals, focusSessions, stats } = useApp();

  const [taskTitle, setTaskTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setLoading(true);
    setSubtasks([]);
    setSelectedIndices([]);

    const contextData = { profile, tasks, goals, focusStats: stats };
    const generated = await aiService.getTaskBreakdown(taskTitle, contextData);

    setSubtasks(generated);
    setSelectedIndices(generated.map((_, i) => i)); // Select all by default
    setLoading(false);
  };

  const toggleSelect = (index) => {
    setSelectedIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleAddSelected = () => {
    selectedIndices.forEach(i => {
      const sub = subtasks[i];
      if (sub) {
        addTask({
          title: sub.title,
          description: `Subtask generated for: ${taskTitle}`,
          priority: sub.priority || 'High',
          estimatedMinutes: sub.estimatedMinutes || 25,
          category: 'Subtask',
          deadline: 'Today'
        });
      }
    });

    onClose();
    setTaskTitle('');
    setSubtasks([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Smart Task Breakdown Generator" maxWidth="max-w-xl">
      <div className="space-y-5">
        <form onSubmit={handleGenerate} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Main Task or Project Title
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Build AI LifeOS backend or DBMS Normalization Lab"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                required
              />
              <Button variant="ai" size="sm" type="submit" disabled={loading} icon={loading ? Loader2 : Sparkles}>
                {loading ? "Decomposing..." : "Break Down"}
              </Button>
            </div>
          </div>
        </form>

        {loading && (
          <div className="p-8 text-center space-y-3 card-panel">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs text-zinc-400 font-medium">
              AI Brain is analyzing context and generating optimal focus subtasks...
            </p>
          </div>
        )}

        {subtasks.length > 0 && !loading && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Generated Subtasks ({selectedIndices.length}/{subtasks.length} selected)
              </span>
              <span className="text-xs text-indigo-400 font-mono">User Confirmation Required</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {subtasks.map((sub, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleSelect(idx)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedIndices.includes(idx)
                      ? 'bg-indigo-950/40 border-indigo-500/40'
                      : 'bg-zinc-900/40 border-zinc-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIndices.includes(idx)}
                      onChange={() => {}}
                      className="rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">{sub.title}</h4>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {sub.estimatedMinutes} mins · Priority: {sub.priority}
                      </span>
                    </div>
                  </div>

                  <Badge variant={sub.priority === 'High' ? 'high' : 'medium'} size="sm">
                    {sub.priority}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>

              <Button
                variant="ai"
                size="sm"
                onClick={handleAddSelected}
                disabled={selectedIndices.length === 0}
                icon={Plus}
              >
                Add {selectedIndices.length} Selected Subtask(s)
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
