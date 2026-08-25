import React from 'react';
import { Clock, CheckCircle, Play, Circle, ArrowRight, Sliders, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

export const TodayPlan = () => {
  const navigate = useNavigate();
  const { dailyPlan, plan } = useApp();

  const activePlanSlots = Array.isArray(dailyPlan?.schedule)
    ? dailyPlan.schedule
    : (Array.isArray(plan) ? plan : []);

  const taskSlots = activePlanSlots.filter(s => s && typeof s === 'object' && (s.type === 'task' || s.title));
  const completedCount = taskSlots.filter(s => s.status === 'completed' || s.status === 'Completed').length;
  const progressPercent = taskSlots.length > 0 ? Math.round((completedCount / taskSlots.length) * 100) : 0;

  const currentSlot = taskSlots.find(s => s.status === 'scheduled' || s.status === 'current') || taskSlots[0];
  const nextSlot = taskSlots.find(s => s.id !== currentSlot?.id && s.status !== 'completed');

  return (
    <div className="card-panel p-5 space-y-4 border-indigo-500/30">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            AI DAILY PLAN
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">Real-time schedule aligned with your peak focus hours</p>
        </div>

        <Button
          variant="ai"
          size="sm"
          onClick={() => navigate('/planner')}
          icon={ArrowRight}
        >
          Open Full Plan
        </Button>
      </div>

      {/* Today's Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-zinc-400">Today's Plan Progress</span>
          <span className="text-indigo-400 font-mono font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Highlights: Current & Next */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Current */}
        <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
            CURRENT TASK
          </span>
          <h4 className="text-xs font-bold text-zinc-100 truncate">
            {currentSlot ? currentSlot.title : 'No active task scheduled'}
          </h4>
          <span className="text-[10px] text-zinc-400 font-mono block">
            {currentSlot ? (currentSlot.timeWindow || currentSlot.time || '35 mins') : 'Ready'}
          </span>
        </div>

        {/* Next */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
            UPCOMING NEXT
          </span>
          <h4 className="text-xs font-bold text-zinc-200 truncate">
            {nextSlot ? nextSlot.title : 'End of daily schedule'}
          </h4>
          <span className="text-[10px] text-zinc-500 font-mono block">
            {nextSlot ? (nextSlot.timeWindow || nextSlot.time || 'Next block') : 'Complete'}
          </span>
        </div>
      </div>
    </div>
  );
};
