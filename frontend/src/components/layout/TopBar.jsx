import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Bell, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const TopBar = ({ onOpenQuickAdd, onOpenNotifications }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, notifications } = useApp();
  const { user } = useAuth();
  const unreadCount = notifications.filter(n => n.unread).length;

  const routeTitles = {
    '/': 'Home Dashboard',
    '/ai': 'AI Copilot Assistant',
    '/tasks': 'Smart Tasks',
    '/goals': 'Goals & Milestones',
    '/calendar': 'AI Adaptive Calendar',
    '/focus': 'Focus Mode',
    '/insights': 'AI Insights & Analytics',
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
        <Button
          variant="ai"
          size="sm"
          onClick={onOpenQuickAdd}
          icon={Plus}
        >
          <span className="hidden sm:inline">Quick Add</span>
          <span className="sm:hidden">Add</span>
        </Button>

        {/* Notifications Icon (Mobile) */}
        <button
          onClick={onOpenNotifications}
          className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-zinc-800 relative transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
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
