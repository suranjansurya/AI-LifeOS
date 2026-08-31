import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';

export const WeeklyReportWidget = () => {
  const navigate = useNavigate();
  const { tasks, focusSessions } = useApp();

  const completed = tasks.filter(t => t.status === 'Completed').length;
  const totalFocusMins = focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const focusTime = `${Math.floor(totalFocusMins / 60)}h ${totalFocusMins % 60}m`;

  return (
    <div className="card-panel p-5 border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="badge-ai px-2 py-0.5 text-[10px] font-bold rounded uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
            WEEKLY AI REPORT
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">Aug 17 – Aug 23</span>
        </div>

        <span className="text-sm font-bold text-zinc-100 font-mono">
          82 <span className="text-[10px] text-zinc-500 font-normal">/ 100</span>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 py-1 text-center">
        <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Score</span>
          <span className="text-xs font-bold text-emerald-300 font-mono">+14%</span>
        </div>

        <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Tasks</span>
          <span className="text-xs font-bold text-zinc-100 font-mono">{completed} Done</span>
        </div>

        <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Focus</span>
          <span className="text-xs font-bold text-indigo-300 font-mono">{focusTime}</span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="ai"
          size="xs"
          onClick={() => navigate('/reports')}
          icon={ArrowRight}
        >
          View Full AI Report
        </Button>
      </div>
    </div>
  );
};
