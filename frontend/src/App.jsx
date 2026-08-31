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
import { Copilot } from './pages/Copilot';
import { Research } from './pages/Research';
import { People } from './pages/People';
import { Projects } from './pages/Projects';
import { Wellness } from './pages/Wellness';
import { Habits } from './pages/Habits';
import { Study } from './pages/Study';
import { Finance } from './pages/Finance';
import { Planner } from './pages/Planner';
import { Tasks } from './pages/Tasks';
import { Goals } from './pages/Goals';
import { Calendar } from './pages/Calendar';
import { Focus } from './pages/Focus';
import { Insights } from './pages/Insights';
import { Reports } from './pages/Reports';
import { Memory } from './pages/Memory';
import { Knowledge } from './pages/Knowledge';
import { Hub } from './pages/Hub';
import { Proactive } from './pages/Proactive';
import { Automations } from './pages/Automations';
import { LifeGraph } from './pages/LifeGraph';
import { Decisions } from './pages/Decisions';
import { Execution } from './pages/Execution';
import { KnowledgeEngine } from './pages/KnowledgeEngine';
import { Personalization } from './pages/Personalization';
import { Multimodal } from './pages/Multimodal';
import { Agents } from './pages/Agents';
import { MemoryEngine } from './pages/MemoryEngine';
import { PredictiveEngine } from './pages/PredictiveEngine';
import { Missions } from './pages/Missions';
import { DigitalTwin } from './pages/DigitalTwin';
import { Automations2 } from './pages/Automations2';
import { PersonalOS } from './pages/PersonalOS';
import { ExecutiveDashboard } from './pages/ExecutiveDashboard';
import { OptimizationEngine } from './pages/OptimizationEngine';
import { ResearchEngine } from './pages/ResearchEngine';
import { MasterSystemHub } from './pages/MasterSystemHub';
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
                <Route path="research" element={<Research />} />
                <Route path="people" element={<People />} />
                <Route path="projects" element={<Projects />} />
                <Route path="wellness" element={<Wellness />} />
                <Route path="habits" element={<Habits />} />
                <Route path="study" element={<Study />} />
                <Route path="finance" element={<Finance />} />
                <Route path="graph" element={<LifeGraph />} />
                <Route path="decisions" element={<Decisions />} />
                <Route path="execution" element={<Execution />} />
                <Route path="knowledge-engine" element={<KnowledgeEngine />} />
                <Route path="personalization" element={<Personalization />} />
                <Route path="multimodal" element={<Multimodal />} />
                <Route path="agents" element={<Agents />} />
                <Route path="memory-engine" element={<MemoryEngine />} />
                <Route path="predictive-engine" element={<PredictiveEngine />} />
                <Route path="missions" element={<Missions />} />
                <Route path="digital-twin" element={<DigitalTwin />} />
                <Route path="automations-engine" element={<Automations2 />} />
                <Route path="personal-os" element={<PersonalOS />} />
                <Route path="executive-dashboard" element={<ExecutiveDashboard />} />
                <Route path="optimization-engine" element={<OptimizationEngine />} />
                <Route path="research-engine" element={<ResearchEngine />} />
                <Route path="master-hub" element={<MasterSystemHub />} />
                <Route path="copilot" element={<Copilot />} />
                <Route path="ai" element={<AiAssistant />} />
                <Route path="knowledge" element={<Knowledge />} />
                <Route path="hub" element={<Hub />} />
                <Route path="proactive" element={<Proactive />} />
                <Route path="automations" element={<Automations />} />
                <Route path="planner" element={<Planner />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="goals" element={<Goals />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="focus" element={<Focus />} />
                <Route path="insights" element={<Insights />} />
                <Route path="reports" element={<Reports />} />
                <Route path="memory" element={<Memory />} />
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
