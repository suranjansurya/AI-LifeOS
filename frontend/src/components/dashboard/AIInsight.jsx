import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const AIInsight = () => {
  const navigate = useNavigate();
  const { aiInsight } = useApp();

  return (
    <div className="card-panel p-5 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-zinc-900/60 border-indigo-500/25 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="badge-ai px-2.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
          {aiInsight.title}
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">Updated 10m ago</span>
      </div>

      <p className="text-xs md:text-sm text-zinc-200 leading-relaxed font-medium mt-2">
        "{aiInsight.message}"
      </p>

      <div className="mt-3 flex justify-end">
        <button
          onClick={() => navigate('/insights')}
          className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 transition-colors"
        >
          View Diagnostics
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
