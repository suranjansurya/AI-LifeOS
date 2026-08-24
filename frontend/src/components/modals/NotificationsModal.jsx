import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCheck, AlertTriangle, Info, Sparkles } from 'lucide-react';

export const NotificationsModal = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'success':
        return <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400 shrink-0" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI LifeOS Notifications">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Recent Intelligence Alerts
          </span>
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markNotificationRead(item.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                item.unread
                  ? 'bg-zinc-900/90 border-indigo-500/30'
                  : 'bg-zinc-900/40 border-zinc-800/60 opacity-70'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-zinc-200 truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-zinc-500 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <Button variant="secondary" size="sm" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
