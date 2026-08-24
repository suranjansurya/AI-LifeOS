import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { TaskItem } from '../components/dashboard/TaskItem';
import { QuickTaskInput } from '../components/dashboard/QuickTaskInput';
import { useApp } from '../context/AppContext';
import { Plus, Search, Filter } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export const Tasks = () => {
  const { tasks } = useApp();
  const outletContext = useOutletContext();
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'todo' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredTasks = tasks.filter(task => {
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'todo'
        ? task.status !== 'Completed'
        : task.status === 'Completed';

    const matchesCategory =
      categoryFilter === 'all' ? true : task.category === categoryFilter;

    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Smart Tasks"
        subtitle="Intelligent task manager with automated priority scoring."
        action={
          <Button
            variant="ai"
            size="sm"
            onClick={outletContext?.onOpenQuickAdd}
            icon={Plus}
          >
            Create Task
          </Button>
        }
      />

      {/* Quick Task Bar */}
      <div className="card-panel p-4">
        <QuickTaskInput />
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-panel p-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
          {['all', 'todo', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Category */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Academics">Academics</option>
              <option value="Career">Career</option>
              <option value="Development">Development</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))
        ) : (
          <div className="card-panel p-12 text-center text-zinc-500">
            <p className="text-sm">No tasks found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
