import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const Toast = ({ toast }) => {
  if (!toast) return null;

  const icons = {
    success: CheckCircle2,
    warning: AlertTriangle,
    info: Info,
    ai: Sparkles
  };

  const Icon = icons[toast.type] || Info;

  const typeStyles = {
    success: 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40',
    warning: 'bg-amber-950/90 text-amber-200 border-amber-500/40',
    info: 'bg-zinc-900/95 text-zinc-200 border-zinc-700/80',
    ai: 'bg-indigo-950/95 text-indigo-200 border-indigo-500/50 shadow-indigo-500/10'
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-sm font-medium ${typeStyles[toast.type] || typeStyles.info}`}>
        <Icon className="w-4 h-4 shrink-0 text-indigo-400" />
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
