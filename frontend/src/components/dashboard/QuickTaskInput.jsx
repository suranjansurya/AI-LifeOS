import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QuickTaskInput = () => {
  const { addTask } = useApp();
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title,
      category: 'General',
      priority: 'Medium',
      deadline: 'Today',
      durationMinutes: 30
    });

    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        placeholder="Add a task... (Press Enter)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full pl-4 pr-10 py-2.5 bg-zinc-900/80 border border-zinc-800 focus:border-indigo-500/60 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
      />
      <button
        type="submit"
        disabled={!title.trim()}
        className="absolute right-2 top-2 p-1 rounded-lg text-zinc-400 hover:text-indigo-400 disabled:opacity-30 transition-colors"
        title="Add task"
      >
        <Plus className="w-4 h-4" />
      </button>
    </form>
  );
};
