import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Bot,
  CheckSquare,
  Zap,
  Target,
  MoreHorizontal,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  X
} from 'lucide-react';

export const MobileNavigation = () => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const primaryNav = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'AI', path: '/ai', icon: Bot },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Focus', path: '/focus', icon: Zap },
    { name: 'Goals', path: '/goals', icon: Target }
  ];

  const secondaryNav = [
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Insights', path: '/insights', icon: BarChart3 },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <>
      {/* More Menu Drawer */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in">
          <div className="bg-zinc-950 border-t border-zinc-800 rounded-t-2xl p-4 space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-semibold uppercase text-zinc-400">More Tools</span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMoreMenu(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-zinc-900/60 text-zinc-300 border border-zinc-800/80 hover:bg-zinc-800'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-lg flex items-center justify-around px-2">
        {primaryNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-indigo-400 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </NavLink>
          );
        })}

        {/* More Trigger */}
        <button
          onClick={() => setShowMoreMenu(prev => !prev)}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
            showMoreMenu ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </nav>
    </>
  );
};
