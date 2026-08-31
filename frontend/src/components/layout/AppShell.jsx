import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNavigation } from './MobileNavigation';
import { Toast } from '../common/Toast';
import { QuickAddModal } from '../modals/QuickAddModal';
import { NotificationCenterModal } from '../modals/NotificationCenterModal';
import { CommandCenterModal } from '../modals/CommandCenterModal';
import { ThreeDBackground } from '../common/ThreeDBackground';
import { useApp } from '../../context/AppContext';

export const AppShell = () => {
  const { toast } = useApp();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandCenterOpen, setCommandCenterOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandCenterOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
      {/* 3D WebGL AI Neural Environment Background */}
      <ThreeDBackground aiState={commandCenterOpen ? 'thinking' : 'idle'} />

      {/* Desktop Sidebar */}
      <Sidebar
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenCommandCenter={() => setCommandCenterOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 md:pb-0 z-10">
        <TopBar
          onOpenQuickAdd={() => setQuickAddOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenCommandCenter={() => setCommandCenterOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{
            onOpenQuickAdd: () => setQuickAddOpen(true),
            onOpenCommandCenter: () => setCommandCenterOpen(true)
          }} />
        </main>

        {/* Mobile Navigation */}
        <MobileNavigation onOpenCommandCenter={() => setCommandCenterOpen(true)} />
      </div>

      {/* Modals & Toasts */}
      <CommandCenterModal
        isOpen={commandCenterOpen}
        onClose={() => setCommandCenterOpen(false)}
      />

      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />

      <NotificationCenterModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <Toast toast={toast} />
    </div>
  );
};
