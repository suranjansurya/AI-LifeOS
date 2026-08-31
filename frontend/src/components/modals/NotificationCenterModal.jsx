import React, { useState } from 'react';
import { X, Bell, CheckCheck, Trash2, Calendar, Target, Zap, Clock, ShieldAlert, Settings, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const NotificationCenterModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    setActiveFocusTask,
    preferences,
    updatePreferences,
    showToast
  } = useApp();

  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'unread' | 'task' | 'goal' | 'calendar' | 'ai'
  const [showSettings, setShowSettings] = useState(false);
  const [browserPermission, setBrowserPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  if (!isOpen) return null;

  const requestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      setBrowserPermission(res);
      if (res === 'granted') {
        showToast('🔔 Browser notifications enabled for AI LifeOS!', 'success');
      } else {
        showToast('Browser notification permission was denied.', 'warning');
      }
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === 'unread') return n.unread;
    if (activeCategory === 'task') return n.type?.includes('TASK');
    if (activeCategory === 'goal') return n.type?.includes('GOAL');
    if (activeCategory === 'calendar') return n.type?.includes('CALENDAR');
    if (activeCategory === 'ai') return n.type?.includes('AI') || n.type?.includes('FREE');
    return true;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleActionClick = (notif, actionItem) => {
    markNotificationAsRead(notif.id);
    if (actionItem.action === 'focus' && actionItem.taskId) {
      const targetTask = { id: actionItem.taskId, title: notif.title.replace(/^[^:]+:\s*/, '') };
      setActiveFocusTask(targetTask);
      navigate('/focus');
    } else if (actionItem.link || notif.link) {
      navigate(actionItem.link || notif.link);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/50 via-zinc-900 to-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-100">Smart Notification Center</h2>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">Context-aware reminders with smart cooldowns & quiet hours</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${showSettings ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'}`}
              title="Notification Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SETTINGS DRAWER */}
        {showSettings ? (
          <div className="p-5 space-y-4 overflow-y-auto flex-1 bg-zinc-900/40">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-indigo-400" />
              Notification & Quiet Hours Preferences
            </h3>

            {/* Browser Permission Banner */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-300 block">Browser Notifications</span>
                <span className="text-[11px] text-zinc-400">Status: {browserPermission}</span>
              </div>
              {browserPermission !== 'granted' && (
                <Button variant="ai" size="xs" onClick={requestBrowserPermission}>
                  Enable Permission
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-200 block">Quiet Hours (Mute Non-Critical)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.quietHoursEnabled !== false}
                    onChange={(e) => updatePreferences({ quietHoursEnabled: e.target.checked })}
                    className="rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs text-zinc-300">Enable 11:00 PM – 07:00 AM</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-200 block">Notification Intensity</span>
                <select
                  value={preferences.frequency || 'Normal'}
                  onChange={(e) => updatePreferences({ frequency: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none"
                >
                  <option value="Low">Low (Critical Only)</option>
                  <option value="Normal">Normal (Balanced Cooldowns)</option>
                  <option value="High">High (Instant Alerts)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setShowSettings(false)}>
                Back to Notifications
              </Button>
            </div>
          </div>
        ) : (
          /* NOTIFICATIONS MAIN VIEW */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Category Filter Pills & Controls */}
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: `Unread (${unreadCount})` },
                  { id: 'task', label: 'Tasks' },
                  { id: 'goal', label: 'Goals' },
                  { id: 'calendar', label: 'Calendar' },
                  { id: 'ai', label: 'AI' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={markAllNotificationsAsRead}
                  className="p-1 text-zinc-400 hover:text-emerald-400 rounded transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="p-1 text-zinc-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                  title="Clear history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification Cards List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col space-y-2 ${
                      notif.unread
                        ? 'bg-zinc-900/90 border-indigo-500/40 shadow-sm'
                        : 'bg-zinc-950/60 border-zinc-800/80 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
                          notif.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                          notif.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        }`}>
                          {notif.priority || 'MEDIUM'}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-100">{notif.title}</h4>
                      </div>

                      <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                        {new Date(notif.createdAt || notif.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed pl-1">{notif.message}</p>

                    {/* Action Buttons */}
                    {notif.actions && notif.actions.length > 0 && (
                      <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800/60">
                        {notif.actions.map((act, actIdx) => (
                          <Button
                            key={actIdx}
                            variant={act.action === 'focus' ? 'ai' : 'outline'}
                            size="xs"
                            onClick={() => handleActionClick(notif, act)}
                            icon={ArrowRight}
                          >
                            {act.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-zinc-500 space-y-2">
                  <Bell className="w-8 h-8 text-zinc-700 mx-auto" />
                  <p>No notifications matching this category.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
