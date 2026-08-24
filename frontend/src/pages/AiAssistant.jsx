import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { TaskBreakdownModal } from '../components/modals/TaskBreakdownModal';
import { Bot, Send, Sparkles, User, RefreshCw, Trash2, Loader2, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const AiAssistant = () => {
  const {
    chatMessages,
    sendChatMessage,
    clearChatHistory,
    rebuildScheduleAi,
    aiStatus,
    aiThinking
  } = useApp();

  const [input, setInput] = useState('');
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);

  const suggestions = [
    'What should I do now?',
    'Plan my day',
    'Break down my DBMS assignment',
    'Review my goals',
    'What is overdue?',
    'How productive am I?'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || aiThinking) return;

    sendChatMessage(input);
    setInput('');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <PageHeader
        title="AI Copilot Assistant"
        subtitle="Conversational intelligence with live context awareness & tool execution."
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsBreakdownModalOpen(true)} icon={Sparkles}>
              Break Down Task
            </Button>
            <Button variant="outline" size="sm" onClick={clearChatHistory} icon={Trash2}>
              Clear Chat
            </Button>
          </div>
        }
      />

      {/* AI Status Indicator Bar */}
      <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${aiStatus.configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-semibold text-zinc-300">
            Engine: {aiStatus.provider}
          </span>
          <span className="text-zinc-500 hidden sm:inline">
            — {aiStatus.message}
          </span>
        </div>

        {!aiStatus.configured && (
          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Local Fallback Active
          </span>
        )}
      </div>

      {/* Chat Messages Window */}
      <div className="flex-1 card-panel p-4 md:p-6 overflow-y-auto space-y-4 flex flex-col">
        {chatMessages.length === 0 ? (
          <div className="my-auto text-center space-y-3 p-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-200">Start a Conversation</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Ask AI LifeOS to recommend your next action, plan your day, or decompose a project into subtasks.
            </p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isAi ? 'self-start' : 'self-end flex-row-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    isAi
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isAi
                      ? 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-xs'
                      : 'bg-indigo-600 text-white rounded-tr-xs shadow-md shadow-indigo-600/20'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <div className={`flex items-center justify-between gap-4 text-[10px] mt-2 font-mono ${isAi ? 'text-zinc-500' : 'text-indigo-200'}`}>
                    <span>{msg.timestamp}</span>
                    {isAi && (
                      <span className="opacity-75">
                        {msg.provider || 'gemini-1.5-flash'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* AI Thinking Indicator */}
        {aiThinking && (
          <div className="flex gap-3 max-w-xl self-start animate-in fade-in">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>AI LifeOS Context Engine is analyzing your live data...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => sendChatMessage(chip)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-indigo-950/40 border border-zinc-800 hover:border-indigo-500/30 text-xs text-zinc-300 hover:text-indigo-300 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            {chip}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          placeholder="Ask AI LifeOS anything (e.g., 'What should I do now?')"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={aiThinking}
          className="w-full pl-4 pr-12 py-3.5 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-2xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors shadow-inner disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || aiThinking}
          className="absolute right-2 top-2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white transition-all cursor-pointer"
        >
          {aiThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>

      {/* Task Breakdown Modal */}
      <TaskBreakdownModal
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
      />
    </div>
  );
};
