import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-md transition-colors';
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const variantStyles = {
    default: 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/50',
    ai: 'badge-ai',
    primary: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/25',
    critical: 'bg-rose-950/60 text-rose-300 border border-rose-600/40 animate-pulse',
    high: 'bg-amber-950/60 text-amber-300 border border-amber-500/40',
    medium: 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/40',
    low: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
    outline: 'bg-transparent text-zinc-400 border border-zinc-800'
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.default} ${className}`}>
      {children}
    </span>
  );
};
