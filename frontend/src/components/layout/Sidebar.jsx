import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Bot,
  Sliders,
  CheckSquare,
  Target,
  Calendar as CalendarIcon,
  Zap,
  BarChart3,
  FileText,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Command,
  PieChart,
  Brain,
  Cpu,
  Workflow,
  BookOpen,
  Wallet,
  GraduationCap,
  Flame,
  Heart,
  FolderKanban,
  Users,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ onOpenNotifications, onOpenCommandCenter }) => {
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar, profile, notifications } = useApp();
  const { user } = useAuth();
  const unreadCount = notifications.filter(n => n.unread).length;

  const navGroups = [
    {
      group: 'CORE',
      items: [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Executive OS', path: '/executive-dashboard', icon: BarChart3, badge: 'V4' },
        { name: 'Personal OS', path: '/personal-os', icon: Cpu, badge: 'OS' },
        { name: 'Optimization', path: '/optimization-engine', icon: Sliders, badge: 'AI' }
      ]
    },
    {
      group: 'WORK',
      items: [
        { name: 'Projects', path: '/projects', icon: FolderKanban },
        { name: 'Tasks', path: '/tasks', icon: CheckSquare },
        { name: 'Goals', path: '/goals', icon: Target },
        { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
        { name: 'Missions', path: '/missions', icon: Activity, badge: 'NEW' }
      ]
    },
    {
      group: 'INTELLIGENCE',
      items: [
        { name: 'Research AI', path: '/research-engine', icon: BookOpen, badge: '3.0' },
        { name: 'Knowledge Engine', path: '/knowledge-engine', icon: FileText, badge: 'AI' },
        { name: 'Predictive Risk', path: '/predictive-engine', icon: Zap, badge: 'AI' },
        { name: 'Digital Twin', path: '/digital-twin', icon: Bot, badge: '3D' },
        { name: 'AI Copilot', path: '/copilot', icon: Sparkles }
      ]
    },
    {
      group: 'LIFE',
      items: [
        { name: 'Study Center', path: '/study', icon: GraduationCap },
        { name: 'Focus Sprint', path: '/focus', icon: Zap },
        { name: 'Wellness', path: '/wellness', icon: Heart },
        { name: 'Habits', path: '/habits', icon: Flame },
        { name: 'Finance', path: '/finance', icon: Wallet }
      ]
    },
    {
      group: 'SYSTEM',
      items: [
        { name: 'Automations', path: '/automations-engine', icon: Workflow, badge: 'V3' },
        { name: 'Memory 2.0', path: '/memory-engine', icon: Brain, badge: '2.0' },
        { name: 'Master System Hub', path: '/master-hub', icon: Cpu, badge: '50' }
      ]
    }
  ];

  const displayName = profile.name || user?.user_metadata?.name || 'Suranjan';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 bg-zinc-950/90 backdrop-blur-md border-r border-zinc-800/80 transition-all duration-300 z-30 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-zinc-100 leading-none">
                AI LifeOS
              </span>
              <span className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase mt-1">
                Personal OS 4.0
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

      {/* Command Center Quick Trigger */}
      <div className="px-3 pt-3">
        <button
          onClick={onOpenCommandCenter}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 transition-all cursor-pointer shadow-sm shadow-indigo-500/10 ${
            sidebarCollapsed ? 'justify-center px-0' : ''
          }`}
          title="AI Command Center (Ctrl+K)"
        >
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
          {!sidebarCollapsed && <span className="truncate flex-1 text-left">Command Center</span>}
          {!sidebarCollapsed && (
            <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[9px] text-zinc-400">
              ⌘K
            </span>
          )}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 py-3 px-3 space-y-4 overflow-y-auto">
        {navGroups.map((grp) => (
          <div key={grp.group} className="space-y-1">
            {!sidebarCollapsed && (
              <span className="px-3 text-[10px] font-bold text-zinc-500 tracking-wider uppercase block mb-1 font-mono">
                {grp.group}
              </span>
            )}
            {grp.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group relative ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                      {!sidebarCollapsed && (
                        <span className="truncate flex-1">{item.name}</span>
                      )}
                      {!sidebarCollapsed && item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
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
