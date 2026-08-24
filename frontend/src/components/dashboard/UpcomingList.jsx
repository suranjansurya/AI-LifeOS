import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const UpcomingList = () => {
  const navigate = useNavigate();
  const { upcoming } = useApp();

  return (
    <div className="card-panel p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            Upcoming Deadlines & Milestones
          </h3>
          <button
            onClick={() => navigate('/calendar')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
          >
            Full Calendar
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-3">
          {(upcoming || []).map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1 rounded-lg bg-zinc-800 text-[11px] font-semibold text-indigo-300 font-mono shrink-0">
                  {item.dateLabel}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">{item.title}</h4>
                  <span className="text-[11px] text-zinc-500">{item.due}</span>
                </div>
              </div>

              <Badge
                variant={item.priority === 'Critical' ? 'critical' : item.priority === 'High' ? 'high' : 'medium'}
                size="sm"
              >
                {item.priority}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500 flex items-center justify-between">
        <span>3 Key items on radar</span>
        <span className="font-mono text-indigo-400">Zero Overdue Tasks</span>
      </div>
    </div>
  );
};
