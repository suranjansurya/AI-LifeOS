import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Profile } from './pages/auth/Profile';

import { Home } from './pages/Home';
import { AiAssistant } from './pages/AiAssistant';
import { Planner } from './pages/Planner';
import { Tasks } from './pages/Tasks';
import { Goals } from './pages/Goals';
import { Calendar } from './pages/Calendar';
import { Focus } from './pages/Focus';
import { Insights } from './pages/Insights';
import { Notes } from './pages/Notes';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected App Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AppShell />}>
                <Route index element={<Home />} />
                <Route path="ai" element={<AiAssistant />} />
                <Route path="planner" element={<Planner />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="goals" element={<Goals />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="focus" element={<Focus />} />
                <Route path="insights" element={<Insights />} />
                <Route path="notes" element={<Notes />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
