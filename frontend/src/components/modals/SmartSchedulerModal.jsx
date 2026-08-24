import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { Sparkles, Calendar, Clock, Check, RefreshCw, Loader2, Coffee } from 'lucide-react';

export const SmartSchedulerModal = ({ isOpen, onClose }) => {
  const { tasks, showToast } = useApp();

  const [availableHours, setAvailableHours] = useState(4);
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);

  const handleGenerate = async (hours = availableHours) => {
    setLoading(true);
    setScheduleData(null);

    const result = await aiService.generateDailySchedule(tasks, hours);
    setScheduleData(result);
    setLoading(false);
  };

  const handleAccept = () => {
    showToast('AI Daily Schedule accepted! Assigned focus windows to your calendar.', 'success');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Smart AI Daily Scheduler" maxWidth="max-w-2xl">
      <div className="space-y-5">
        {/* Input & Presets */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">How much time do you have today?</span>
            <span className="text-xs font-mono text-indigo-400 font-bold">{availableHours} Hours</span>
          </div>

          <div className="flex items-center gap-2">
            {[2, 4, 6, 8].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  setAvailableHours(h);
                  handleGenerate(h);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  availableHours === h
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {h} Hours
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        {!scheduleData && !loading && (
          <div className="text-center py-6">
            <Button
              variant="ai"
              size="lg"
              onClick={() => handleGenerate(availableHours)}
              icon={Sparkles}
            >
              Generate AI Daily Plan
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-8 text-center space-y-3 card-panel">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs text-zinc-400 font-medium">
              AI Scheduler is balancing task priorities, effort durations, and buffer breaks...
            </p>
          </div>
        )}

        {/* Schedule Output */}
        {scheduleData && scheduleData.schedule && !loading && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Generated Non-Overlapping Timeline ({scheduleData.scheduledTasksCount} Tasks)
              </span>
              <button
                onClick={() => handleGenerate(availableHours)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {scheduleData.schedule.map((slot) => {
                const isBreak = slot.type === 'break';
                return (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                      isBreak
                        ? 'bg-amber-950/20 border-amber-500/20 text-amber-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isBreak ? (
                        <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                      )}
                      <div>
                        <h4 className="font-bold text-zinc-100">{slot.title}</h4>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {slot.durationMinutes} mins · {slot.category || 'Break'}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 font-mono text-[10px] text-zinc-300 font-bold">
                      {slot.timeWindow}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>

              <Button variant="ai" size="sm" onClick={handleAccept} icon={Check}>
                Accept Schedule
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
