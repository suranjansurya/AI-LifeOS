import React from 'react';
import { Clock, CheckCircle, Play, Circle, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';

export const TodayPlan = () => {
  const { plan, rebuildScheduleAi } = useApp();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'current':
        return <Play className="w-4 h-4 text-indigo-400 shrink-0 fill-indigo-400 animate-pulse" />;
      default:
        return <Circle className="w-4 h-4 text-zinc-600 shrink-0" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
            Completed
          </span>
        );
      case 'current':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/40 animate-pulse">
            In Progress
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
            Upcoming
          </span>
        );
    }
  };

  return (
    <div className="card-panel p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Today's AI Schedule Plan
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">Adaptive schedule aligned with your peak focus hours</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={rebuildScheduleAi}
          icon={RefreshCw}
        >
          Re-balance
        </Button>
      </div>

      <div className="space-y-3 relative before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-800">
        {(plan || []).map((item) => {
          const isCurrent = item.status === 'current';
          const isCompleted = item.status === 'completed';

          return (
            <div
              key={item.id}
              className={`relative flex items-center justify-between p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-indigo-950/30 border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                  : isCompleted
                  ? 'bg-zinc-900/30 border-zinc-800/50 opacity-70'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-3.5 z-10">
                <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                  {getStatusIcon(item.status)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-400">
                      {item.time}
                    </span>
                    <span className="text-xs font-semibold text-zinc-200">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {item.duration} · {item.category}
                  </span>
                </div>
              </div>

              <div>{getStatusBadge(item.status)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
