import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Bot,
  CheckSquare,
  Target,
  Calendar as CalendarIcon,
  Zap,
  BarChart3,
  FileText,
  Bell,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ onOpenNotifications }) => {
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar, profile, notifications } = useApp();
  const { user } = useAuth();
  const unreadCount = notifications.filter(n => n.unread).length;

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'AI Assistant', path: '/ai', icon: Bot, badge: 'AI' },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { name: 'Focus', path: '/focus', icon: Zap },
    { name: 'Insights', path: '/insights', icon: BarChart3 },
    { name: 'Notes', path: '/notes', icon: FileText }
  ];

  const displayName = profile.name || user?.user_metadata?.name || 'Suranjan';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 bg-zinc-950 border-r border-zinc-800/80 transition-all duration-300 z-30 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-zinc-100 leading-none">
                AI LifeOS
              </span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase mt-1">
                Personal OS
              </span>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors cursor-pointer"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                  {!sidebarCollapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}
                  {!sidebarCollapsed && item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-zinc-800/60 space-y-1">
        {/* Notifications trigger */}
        <button
          onClick={onOpenNotifications}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 transition-colors relative cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-zinc-400 shrink-0" />
          {!sidebarCollapsed && <span className="truncate flex-1 text-left">Notifications</span>}
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-bold bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent'
            }`
          }
          title="Settings"
        >
          <Settings className="w-5 h-5 text-zinc-400 shrink-0" />
          {!sidebarCollapsed && <span className="truncate">Settings</span>}
        </NavLink>

        {/* User Profile */}
        <div
          onClick={() => navigate('/profile')}
          className="pt-2 border-t border-zinc-800/40 cursor-pointer"
        >
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/50 hover:border-indigo-500/30 transition-all">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
              {userInitial}
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-zinc-200 truncate">{displayName}</span>
                <span className="text-[10px] text-zinc-500 truncate">{profile.role || 'Student & Engineer'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
