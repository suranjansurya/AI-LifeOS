import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Bell, Sparkles, Command } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const TopBar = ({ onOpenQuickAdd, onOpenNotifications, onOpenCommandCenter }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, notifications } = useApp();
  const { user } = useAuth();
  const unreadCount = notifications.filter(n => n.unread).length;

  const routeTitles = {
    '/': 'Home Dashboard',
    '/ai': 'AI Copilot Assistant',
    '/planner': 'AI Daily Planner & Smart Scheduler',
    '/tasks': 'Smart Tasks',
    '/goals': 'Goals & Milestones',
    '/calendar': 'AI Adaptive Calendar',
    '/focus': 'Focus Mode',
    '/insights': 'AI Insights & Analytics',
    '/reports': 'AI Report Center',
    '/notes': 'Notes & Ideas',
    '/settings': 'Settings',
    '/profile': 'User Profile & Account'
  };

  const currentTitle = routeTitles[location.pathname] || 'AI LifeOS';
  const displayName = profile.name || user?.user_metadata?.name || 'Suranjan';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 md:px-8">
      {/* Title & Mobile Brand */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-zinc-100">AI LifeOS</span>
        </div>

        <h2 className="hidden md:block text-sm font-semibold text-zinc-300">
          {currentTitle}
        </h2>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        {/* Command Center Trigger Button */}
        <button
          onClick={onOpenCommandCenter}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition-all cursor-pointer shadow-sm shadow-indigo-500/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>AI Command Center</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[10px] text-zinc-400">
            ⌘K
          </span>
        </button>

        <Button
          variant="ai"
          size="sm"
          onClick={onOpenQuickAdd}
          icon={Plus}
        >
          <span className="hidden sm:inline">Quick Add</span>
          <span className="sm:hidden">Add</span>
        </Button>

        {/* Notifications Icon (Desktop & Mobile) */}
        <button
          onClick={onOpenNotifications}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-zinc-800 relative transition-colors cursor-pointer"
          aria-label="Notifications"
          title="Notifications Center"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold font-mono">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs hover:ring-2 hover:ring-indigo-400 transition-all cursor-pointer shadow-md shadow-indigo-500/20"
          title="User Profile & Account"
          aria-label="User Profile & Account"
        >
          {userInitial}
        </button>
      </div>
    </header>
  );
};
