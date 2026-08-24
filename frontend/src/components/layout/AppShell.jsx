import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNavigation } from './MobileNavigation';
import { Toast } from '../common/Toast';
import { QuickAddModal } from '../modals/QuickAddModal';
import { NotificationsModal } from '../modals/NotificationsModal';
import { useApp } from '../../context/AppContext';

export const AppShell = () => {
  const { toast } = useApp();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Desktop Sidebar */}
      <Sidebar onOpenNotifications={() => setNotificationsOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 md:pb-0">
        <TopBar
          onOpenQuickAdd={() => setQuickAddOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ onOpenQuickAdd: () => setQuickAddOpen(true) }} />
        </main>

        {/* Mobile Navigation */}
        <MobileNavigation />
      </div>

      {/* Modals & Toasts */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />

      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <Toast toast={toast} />
    </div>
  );
};
