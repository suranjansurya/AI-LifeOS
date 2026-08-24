import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, Send, Compass } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AIEntry = () => {
  const navigate = useNavigate();
  const { sendChatMessage } = useApp();
  const [prompt, setPrompt] = useState('');

  const suggestions = [
    'What should I do now?',
    'Plan my day',
    'Break down a task',
    'Review my goals'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    sendChatMessage(prompt);
    setPrompt('');
    navigate('/ai');
  };

  const handleSuggestionClick = (text) => {
    sendChatMessage(text);
    navigate('/ai');
  };

  return (
    <div className="card-panel p-5 border-indigo-500/20 bg-zinc-900/60">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Bot className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold text-zinc-200">
          AI Copilot Assistant
        </span>
      </div>

      <form onSubmit={handleSubmit} className="relative mb-3">
        <input
          type="text"
          placeholder="Ask AI LifeOS anything..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full pl-4 pr-12 py-3 bg-zinc-950 border border-zinc-800 focus:border-indigo-500/60 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={!prompt.trim()}
          className="absolute right-2 top-2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white transition-all cursor-pointer"
          aria-label="Send prompt to AI"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
          <Compass className="w-3 h-3 text-zinc-500" />
          Suggested:
        </span>
        {suggestions.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSuggestionClick(chip)}
            className="px-2.5 py-1 rounded-lg bg-zinc-950/80 hover:bg-indigo-950/40 border border-zinc-800 hover:border-indigo-500/30 text-xs text-zinc-300 hover:text-indigo-300 transition-all cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-indigo-400 opacity-60" />
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
};
