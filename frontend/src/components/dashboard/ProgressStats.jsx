import React from 'react';
import { CheckCircle2, Clock, Target, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProgressStats = () => {
  const { stats } = useApp();

  const cards = [
    {
      title: 'Tasks Completed',
      value: `${stats.completedTasks} / ${stats.totalTasks}`,
      subtext: `${stats.totalTasks - stats.completedTasks} pending today`,
      icon: CheckCircle2,
      color: 'text-indigo-400',
      progress: (stats.completedTasks / stats.totalTasks) * 100
    },
    {
      title: 'Focus Time',
      value: stats.focusTime,
      subtext: 'Target: 3h 00m',
      icon: Clock,
      color: 'text-emerald-400',
      progress: (stats.focusMinutes / 180) * 100
    },
    {
      title: 'Goal Progress',
      value: `${stats.goalProgress}%`,
      subtext: 'Active: 3 Goals',
      icon: Target,
      color: 'text-purple-400',
      progress: stats.goalProgress
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      subtext: '+4% vs last week',
      icon: TrendingUp,
      color: 'text-amber-400',
      progress: stats.completionRate
    }
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Today's Progress
        </h3>
        <span className="text-xs text-zinc-500 font-mono">Live Velocity</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="card-panel p-4 card-hover flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-zinc-400 truncate">
                  {card.title}
                </span>
                <Icon className={`w-4 h-4 ${card.color} shrink-0`} />
              </div>

              <div>
                <div className="text-xl md:text-2xl font-bold text-zinc-100 font-mono tracking-tight">
                  {card.value}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1 truncate">
                  {card.subtext}
                </div>
              </div>

              {/* Progress mini indicator */}
              <div className="w-full bg-zinc-800/80 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-emerald-500' : idx === 2 ? 'bg-purple-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, card.progress))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
