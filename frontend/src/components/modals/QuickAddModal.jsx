import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { CheckSquare, FileText, Sparkles } from 'lucide-react';

export const QuickAddModal = ({ isOpen, onClose }) => {
  const { addTask, addNote } = useApp();
  const [tab, setTab] = useState('task'); // 'task' | 'note'

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('Academics');
  const [taskPriority, setTaskPriority] = useState('High');
  const [taskDeadline, setTaskDeadline] = useState('Tomorrow');
  const [taskDuration, setTaskDuration] = useState('35');

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTag, setNoteTag] = useState('AI');

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle,
      category: taskCategory,
      priority: taskPriority,
      deadline: taskDeadline,
      durationMinutes: taskDuration
    });

    setTaskTitle('');
    onClose();
  };

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    addNote({
      title: noteTitle,
      content: noteContent,
      tags: [noteTag]
    });

    setNoteTitle('');
    setNoteContent('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI LifeOS — Quick Create">
      {/* Type selector */}
      <div className="flex p-1 mb-5 bg-zinc-900 rounded-xl border border-zinc-800">
        <button
          type="button"
          onClick={() => setTab('task')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            tab === 'task'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Smart Task
        </button>
        <button
          type="button"
          onClick={() => setTab('note')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            tab === 'note'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Quick Note
        </button>
      </div>

      {tab === 'task' ? (
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              placeholder="e.g. Complete DBMS Assignment"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Category
              </label>
              <select
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="Academics">Academics</option>
                <option value="Career">Career</option>
                <option value="Development">Development</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Deadline
              </label>
              <input
                type="text"
                placeholder="e.g. Tomorrow or Friday"
                value={taskDeadline}
                onChange={(e) => setTaskDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Est. Duration (Mins)
              </label>
              <input
                type="number"
                placeholder="35"
                value={taskDuration}
                onChange={(e) => setTaskDuration(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800/80">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="ai" size="sm" type="submit" icon={Sparkles}>
              Create Smart Task
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleNoteSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Note Title
            </label>
            <input
              type="text"
              placeholder="e.g. DBMS Lecture Summary"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Tag / Category
            </label>
            <input
              type="text"
              placeholder="e.g. AI, Ideas, Architecture"
              value={noteTag}
              onChange={(e) => setNoteTag(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Content / Details
            </label>
            <textarea
              rows={4}
              placeholder="Write down key points or ideas..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800/80">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Note
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
