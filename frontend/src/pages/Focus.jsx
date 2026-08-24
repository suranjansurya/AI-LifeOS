import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useApp } from '../context/AppContext';
import { Zap, Play, Pause, RotateCcw, AlertCircle, Sparkles, CheckCircle2, History, Check } from 'lucide-react';

export const Focus = () => {
  const {
    activeFocusTask,
    tasks,
    focusSessions,
    completeFocusSession,
    toggleTaskComplete,
    showToast
  } = useApp();

  const [selectedTask, setSelectedTask] = useState(activeFocusTask || tasks[0]);
  const [initialMinutes, setInitialMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [distractionNote, setDistractionNote] = useState('');
  const [distractionsList, setDistractionsList] = useState([]);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      handleFinishSession(true);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const toggleTimer = () => {
    setIsActive(prev => !prev);
  };

  const handleFinishSession = (markTaskDone = false) => {
    setIsActive(false);
    const elapsedMins = Math.max(1, Math.floor((initialMinutes * 60 - secondsLeft) / 60));

    if (selectedTask) {
      completeFocusSession(elapsedMins, selectedTask);
      if (markTaskDone && selectedTask.status !== 'Completed') {
        toggleTaskComplete(selectedTask.id);
      }
      showToast(`🏆 ${elapsedMins}-minute focus session completed! "${selectedTask.title}" updated.`, 'success');
    }

    setSecondsLeft(initialMinutes * 60);
  };

  const resetTimer = (mins = 25) => {
    setIsActive(false);
    setInitialMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const handleAddDistraction = (e) => {
    e.preventDefault();
    if (!distractionNote.trim()) return;

    setDistractionsList(prev => [distractionNote, ...prev]);
    setDistractionNote('');
    showToast('Distraction thought logged. Back to deep work!', 'info');
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.round(((initialMinutes * 60 - secondsLeft) / (initialMinutes * 60)) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Focus Intelligence Engine"
        subtitle="Distraction-free deep work environment tied directly to your tasks."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer Display (Col 2) */}
        <div className="lg:col-span-2 card-panel p-8 flex flex-col items-center justify-center text-center space-y-6 border-indigo-500/30">
          <Badge variant="ai" size="md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            {isActive ? "FOCUS SESSION IN PROGRESS" : "FOCUS ENGINE READY"}
          </Badge>

          {/* Selected Task Spotlight */}
          {selectedTask && (
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 max-w-md w-full">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Active Focus Target
              </span>
              <h3 className="text-base font-bold text-zinc-100 mt-1">
                {selectedTask.title}
              </h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant={selectedTask.priority === 'High' ? 'high' : 'medium'} size="sm">
                  {selectedTask.priority || 'High'}
                </Badge>
                <span className="text-xs text-zinc-400 font-mono">
                  {selectedTask.estimatedMinutes || 30}m estimated
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Timer Clock */}
          <div className="text-6xl md:text-8xl font-extrabold font-mono text-zinc-100 tracking-tighter my-4">
            {formatTime(secondsLeft)}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant={isActive ? "secondary" : "ai"}
              size="lg"
              onClick={toggleTimer}
              icon={isActive ? Pause : Play}
            >
              {isActive ? "Pause Session" : "Start Session"}
            </Button>

            {isActive && (
              <Button
                variant="ai"
                size="lg"
                onClick={() => handleFinishSession(true)}
                icon={Check}
              >
                Complete & Finish Task
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              onClick={() => resetTimer(initialMinutes)}
              icon={RotateCcw}
            >
              Reset
            </Button>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-2 pt-4 border-t border-zinc-800/80">
            <span className="text-xs text-zinc-500">Presets:</span>
            {[25, 35, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => resetTimer(mins)}
                className={`px-3 py-1 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                  initialMinutes === mins ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {mins}m Focus
              </button>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Task Selector & Focus History */}
        <div className="space-y-6">
          {/* Task Selector */}
          <div className="card-panel p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Select Task for Focus Target
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {tasks.filter(t => t.status !== 'Completed').map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTask(t);
                    setInitialMinutes(t.estimatedMinutes || 30);
                    setSecondsLeft((t.estimatedMinutes || 30) * 60);
                  }}
                  className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                    selectedTask?.id === t.id
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="truncate font-bold">{t.title}</div>
                  <div className="text-[10px] text-zinc-500 mt-1">{t.category || 'General'} · {t.priority}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Distraction Logger */}
          <div className="card-panel p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Distraction Thought Logger
            </h3>
            <form onSubmit={handleAddDistraction} className="space-y-2">
              <input
                type="text"
                placeholder="Log a thought to review after session..."
                value={distractionNote}
                onChange={(e) => setDistractionNote(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
              <Button variant="secondary" size="sm" type="submit" className="w-full">
                Log Thought
              </Button>
            </form>

            {distractionsList.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <span className="text-[10px] text-zinc-500">Logged thoughts:</span>
                {distractionsList.map((d, i) => (
                  <div key={i} className="text-xs text-zinc-300 p-2 rounded bg-zinc-900/80 italic">
                    "{d}"
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Focus Sessions History */}
          <div className="card-panel p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              Session History
            </h3>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {focusSessions.map((session) => (
                <div key={session.id} className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs flex items-center justify-between">
                  <div className="truncate min-w-0 pr-2">
                    <span className="text-zinc-200 font-medium block truncate">{session.taskTitle}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                    +{session.durationMinutes}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
