import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { useApp } from '../context/AppContext';
import { Calendar as CalendarIcon, RefreshCw, Clock, Sparkles } from 'lucide-react';

export const Calendar = () => {
  const { plan, rebuildScheduleAi } = useApp();
  const [view, setView] = useState('day'); // 'day' | 'week'

  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Adaptive Calendar"
        subtitle="Dynamic time-blocking that adapts to interruptions and energy shifts."
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-zinc-800">
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  view === 'day' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Day View
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  view === 'week' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Week View
              </button>
            </div>

            <Button
              variant="ai"
              size="sm"
              onClick={rebuildScheduleAi}
              icon={RefreshCw}
            >
              Re-balance Schedule
            </Button>
          </div>
        }
      />

      {/* Calendar Grid Container */}
      <div className="card-panel p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-zinc-100">
              Today — Monday, August 24
            </h3>
          </div>

          <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            AI Auto-balanced
          </span>
        </div>

        {/* Hour Slots Timeline */}
        <div className="space-y-4">
          {hours.map((hour) => {
            const matchedPlan = plan.find(p => p.time === hour);
            return (
              <div key={hour} className="flex items-start gap-4 group">
                <span className="font-mono text-xs font-semibold text-zinc-500 w-14 pt-2 shrink-0">
                  {hour}
                </span>

                <div className="flex-1 min-h-[3rem] p-3 rounded-xl border border-zinc-800/60 bg-zinc-900/30 group-hover:border-zinc-700 transition-all flex items-center justify-between">
                  {matchedPlan ? (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 rounded-full bg-indigo-500 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200">{matchedPlan.title}</h4>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {matchedPlan.duration} · {matchedPlan.category}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-600 italic">Available focus window</span>
                  )}

                  {matchedPlan && (
                    <span className="text-xs font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-800">
                      {matchedPlan.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
