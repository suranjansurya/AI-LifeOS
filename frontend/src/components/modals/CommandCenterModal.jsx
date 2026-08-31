import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Bot,
  Play,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
  History
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { sendAICommand } from '../../services/aiService';
import { useNavigate } from 'react-router-dom';

export const CommandCenterModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    tasks,
    addTask,
    deleteTask,
    toggleTaskComplete,
    goals,
    addGoal,
    notes,
    addNote,
    calendarEvents,
    setCalendarEvents,
    setActiveFocusTask,
    dailyPlan,
    showToast,
    aiActionHistory = [],
    logAiAction,
    undoAiAction
  } = useApp();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePreview, setActivePreview] = useState(null);
  const [activeConflict, setActiveConflict] = useState(null);
  const [commandResponse, setCommandResponse] = useState(null);
  const [activeTab, setActiveTab] = useState('command'); // 'command' | 'history'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const suggestions = [
    'Plan my day',
    'Add DBMS Lab assignment for tomorrow',
    'Schedule DSA Practice at 7 PM tomorrow',
    'Show my overdue tasks',
    'What should I work on now?',
    'Start a 50 minute focus session',
    'Create a goal to learn React'
  ];

  const handleSendCommand = async (commandText) => {
    const query = commandText || prompt;
    if (!query.trim()) return;

    setLoading(true);
    setCommandResponse(null);
    setActivePreview(null);
    setActiveConflict(null);

    try {
      const res = await sendAICommand(query, { tasks, goals, calendarEvents, notes });

      if (res.intent === 'schedule_conflict') {
        setActiveConflict(res);
      } else if (res.requires_confirmation) {
        setActivePreview(res);
      } else {
        await executeAction(res);
      }
    } catch (err) {
      console.error('[CommandCenter] Command error:', err);
      showToast('AI Command Center temporarily offline.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (actionObj) => {
    const { intent, data, responseMessage } = actionObj;

    switch (intent) {
      case 'create_task': {
        const newTask = addTask({
          title: data.title || 'New AI Task',
          priority: data.priority || 'Medium',
          estimatedMinutes: data.estimatedMinutes || 35,
          dueDate: data.dueDate || 'Today',
          category: data.category || 'General'
        });

        logAiAction({
          type: 'CREATE_TASK',
          description: `Created task "${newTask.title}"`,
          data: newTask,
          reversible: true
        });

        setCommandResponse({
          type: 'success',
          title: 'Task Created Successfully ✓',
          message: responseMessage || `Task "${newTask.title}" added to your backlog.`,
          actionType: 'create_task',
          data: newTask
        });
        break;
      }

      case 'delete_task': {
        const matched = tasks.find(t => t.id === data.taskId || t.title.toLowerCase().includes((data.taskTitle || '').toLowerCase()));
        if (matched) {
          deleteTask(matched.id);
          logAiAction({
            type: 'DELETE_TASK',
            description: `Deleted task "${matched.title}"`,
            data: matched,
            reversible: true
          });

          setCommandResponse({
            type: 'warning',
            title: 'Task Deleted',
            message: `Deleted "${matched.title}". You can undo this action.`,
            actionType: 'delete_task',
            data: matched
          });
        } else {
          showToast('Task not found in active list.', 'info');
        }
        break;
      }

      case 'create_calendar_event': {
        const newEvent = {
          id: `evt-${Date.now()}`,
          title: data.title || 'Scheduled Event',
          date: data.date || 'Tomorrow',
          time: data.time || '08:00 PM',
          durationMinutes: data.durationMinutes || 45,
          createdAt: new Date().toISOString()
        };

        logAiAction({
          type: 'CREATE_EVENT',
          description: `Scheduled "${newEvent.title}" for ${newEvent.date} at ${newEvent.time}`,
          data: newEvent,
          reversible: true
        });

        setCommandResponse({
          type: 'success',
          title: 'Calendar Event Scheduled ✓',
          message: responseMessage || `Scheduled "${newEvent.title}" at ${newEvent.time}.`,
          actionType: 'create_calendar_event',
          data: newEvent
        });
        break;
      }

      case 'start_focus_session': {
        const targetTask = tasks[0] || { title: data.taskTitle || 'Focus Session', estimatedMinutes: data.durationMinutes || 50 };
        setActiveFocusTask(targetTask);
        onClose();
        navigate('/focus');
        break;
      }

      case 'generate_daily_plan': {
        onClose();
        navigate('/planner');
        break;
      }

      case 'get_next_best_action':
      default: {
        const topTask = tasks.find(t => t.status !== 'Completed') || tasks[0];
        setCommandResponse({
          type: 'info',
          title: 'Next Best Action Recommendation',
          message: topTask ? `Top Priority: "${topTask.title}" (${topTask.estimatedMinutes || 35} mins, ${topTask.priority} priority).` : 'All tasks cleared!',
          actionType: 'recommendation',
          data: topTask
        });
        break;
      }
    }

    setActivePreview(null);
    setActiveConflict(null);
    setPrompt('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                AI Command Center
                <span className="text-[10px] font-mono font-normal text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                  Ctrl + K
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">Natural Language Productivity Control Layer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              <button
                onClick={() => setActiveTab('command')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'command' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Command
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <History className="w-3 h-3" />
                History
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Body */}
        {activeTab === 'command' ? (
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            {/* Input Bar */}
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendCommand();
                }}
                placeholder="What would you like to do? (e.g. 'Plan my day', 'Add task for tomorrow', 'Schedule DSA at 7 PM')"
                className="w-full pl-4 pr-24 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60 font-medium"
                autoFocus
              />
              <button
                onClick={() => handleSendCommand()}
                disabled={loading || !prompt.trim()}
                className="absolute right-2 top-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/20"
              >
                {loading ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send</span>
              </button>
            </div>

            {/* Suggestions */}
            {!activePreview && !activeConflict && !commandResponse && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Suggested Commands
                </span>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setPrompt(s);
                        handleSendCommand(s);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/80 hover:border-indigo-500/40 text-xs text-zinc-300 transition-all text-left cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conflict Warning Box */}
            {activeConflict && (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Schedule Conflict Warning
                    </h4>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      {activeConflict.responseMessage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-amber-500/20">
                  <Button
                    variant="ai"
                    size="xs"
                    onClick={() => {
                      executeAction({
                        intent: 'create_calendar_event',
                        data: {
                          ...activeConflict.originalData,
                          time: activeConflict.suggestedTime || '08:00 PM'
                        },
                        responseMessage: `Event scheduled at ${activeConflict.suggestedTime || '08:00 PM'}.`
                      });
                    }}
                  >
                    Schedule at {activeConflict.suggestedTime || '08:00 PM'}
                  </Button>

                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setActiveConflict(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Action Preview Card (Confirmation Required) */}
            {activePreview && (
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-indigo-400" />
                    Confirmation Required
                  </span>
                  <Badge variant="warning" size="sm">
                    Action Preview
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-200">
                  <p className="font-semibold">{activePreview.responseMessage}</p>
                  {activePreview.data && (
                    <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 font-mono text-[11px] space-y-1 text-zinc-300">
                      <div><strong className="text-zinc-400">Target:</strong> {activePreview.data.matchedTitle || activePreview.data.taskTitle || activePreview.data.title}</div>
                      {activePreview.data.dueDate && <div><strong className="text-zinc-400">Due:</strong> {activePreview.data.dueDate}</div>}
                      {activePreview.data.priority && <div><strong className="text-zinc-400">Priority:</strong> {activePreview.data.priority}</div>}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="ai"
                    size="xs"
                    onClick={() => executeAction(activePreview)}
                  >
                    Confirm Action
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setActivePreview(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Success / Feedback Card */}
            {commandResponse && (
              <div className={`p-4 rounded-xl border space-y-3 animate-in fade-in ${
                commandResponse.type === 'success'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : commandResponse.type === 'warning'
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                  : 'bg-indigo-950/30 border-indigo-500/40 text-indigo-300'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {commandResponse.title}
                  </h4>
                  {commandResponse.actionType === 'delete_task' && (
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => {
                        if (commandResponse.data) {
                          addTask(commandResponse.data);
                          showToast('Restored deleted task!', 'success');
                          setCommandResponse(null);
                        }
                      }}
                      icon={RotateCcw}
                    >
                      Undo Action
                    </Button>
                  )}
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {commandResponse.message}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* AI Action History Tab */
          <div className="p-5 flex-1 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Recent AI Actions
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {aiActionHistory.length} Logged Actions
              </span>
            </div>

            {aiActionHistory.length > 0 ? (
              <div className="space-y-2">
                {aiActionHistory.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-300"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-zinc-200">{item.description}</div>
                      <div className="text-[10px] font-mono text-zinc-500">{item.timestamp || 'Just now'}</div>
                    </div>

                    {item.reversible && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          undoAiAction(item);
                          showToast(`Undid action: "${item.description}"`, 'info');
                        }}
                        icon={RotateCcw}
                      >
                        Undo
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-zinc-500">
                No recent AI actions logged yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
