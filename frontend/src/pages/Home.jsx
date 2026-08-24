import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/common/PageHeader';
import { AICommandCenter } from '../components/dashboard/AICommandCenter';
import { ProgressStats } from '../components/dashboard/ProgressStats';
import { TodayPlan } from '../components/dashboard/TodayPlan';
import { UpcomingList } from '../components/dashboard/UpcomingList';
import { AIInsight } from '../components/dashboard/AIInsight';
import { AIEntry } from '../components/dashboard/AIEntry';
import { QuickTaskInput } from '../components/dashboard/QuickTaskInput';
import { TaskItem } from '../components/dashboard/TaskItem';
import { Button } from '../components/common/Button';
import { SmartSchedulerModal } from '../components/modals/SmartSchedulerModal';
import { Sparkles, Calendar } from 'lucide-react';

export const Home = () => {
  const { tasks } = useApp();
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);

  const activeTasks = tasks.filter(t => t.status !== 'Completed').slice(0, 4);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-200">
      {/* AI Command Center (Greeting, Workload, Spotlight Action) */}
      <AICommandCenter />

      {/* Progress Statistics */}
      <ProgressStats />

      {/* Main Grid: Plan & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Timeline & Smart Scheduler Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Daily Focus Timeline
              </span>
              <Button
                variant="ai"
                size="sm"
                onClick={() => setIsSchedulerOpen(true)}
                icon={Sparkles}
              >
                Plan My Day
              </Button>
            </div>

            <TodayPlan />
          </div>

          {/* Quick Task Entry & Tasks Preview */}
          <div className="card-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100">
                Action Items & Pending Tasks
              </h3>
              <span className="text-xs text-zinc-500 font-mono">
                {activeTasks.length} Active Items
              </span>
            </div>

            <div className="mb-4">
              <QuickTaskInput />
            </div>

            <div className="space-y-2.5">
              {activeTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* AI Insight */}
          <AIInsight />

          {/* AI Assistant Quick Entry */}
          <AIEntry />

          {/* Upcoming Items */}
          <UpcomingList />
        </div>
      </div>

      {/* Smart Scheduler Modal */}
      <SmartSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
      />
    </div>
  );
};
