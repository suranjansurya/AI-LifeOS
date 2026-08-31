import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { sendCopilotPromptAi } from '../services/aiService';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Send,
  Workflow,
  Target,
  Sliders,
  BarChart3,
  BookOpen,
  Zap,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
  X,
  History,
  MessageSquare,
  ArrowRight,
  Layers,
  Cpu
} from 'lucide-react';

export const Copilot = () => {
  const navigate = useNavigate();
  const {
    tasks,
    goals,
    notes,
    memories,
    showToast
  } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  // Recent Copilot Conversations Log
  const [conversations, setConversations] = useState([
    { id: 'conv-1', title: 'Evening Daily Planning', time: '10 mins ago', agent: 'PLANNING' },
    { id: 'conv-2', title: 'React Goal Diagnostic', time: '2 hours ago', agent: 'GOAL' }
  ]);

  const quickActions = [
    { label: 'Plan My Day', prompt: 'Plan my evening around my priority tasks.', agent: 'Planning' },
    { label: 'Review My Goals', prompt: 'Why is my React goal behind pace?', agent: 'Goal' },
    { label: 'Analyze Productivity', prompt: 'How productive was I this week?', agent: 'Productivity' },
    { label: 'Search Knowledge', prompt: 'Search my notes about DBMS and React.', agent: 'Knowledge' },
    { label: 'Start Focus Session', prompt: 'Start a focus session for React Hooks.', agent: 'Focus' },
    { label: 'Create Automation', prompt: 'Every morning prepare my daily plan.', agent: 'Automation' }
  ];

  const handleSend = async (customPrompt = null) => {
    const p = customPrompt || inputPrompt;
    if (!p.trim()) return;

    setLoading(true);
    try {
      const res = await sendCopilotPromptAi(p, { tasks, goals, notes, memories });
      if (res.copilot) {
        setCopilotResponse(res.copilot);
        if (res.copilot.requiresConfirmation) {
          setPendingAction(res.copilot.actionDetails);
        } else {
          setPendingAction(null);
        }
        setConversations(prev => [
          { id: `conv-${Date.now()}`, title: p.slice(0, 30) + '...', time: 'Just now', agent: res.copilot.primaryAgent },
          ...prev
        ]);
      }
    } catch (err) {
      showToast('Error communicating with AI Copilot.', 'error');
    } finally {
      setLoading(false);
      setInputPrompt('');
    }
  };

  const handleConfirmAction = () => {
    showToast(`Action "${pendingAction?.type}" confirmed & executed.`, 'success');
    setPendingAction(null);
  };

  const handleCancelAction = () => {
    showToast('Action cancelled by user.', 'info');
    setPendingAction(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Personal Copilot & Multi-Agent Workspace"
        subtitle="Central AI Copilot routing requests across 10 specialized internal agents with multi-agent collaboration and action controls."
        action={
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Copilot Ready
            </span>
          </div>
        }
      />

      {/* QUICK ACTION PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {quickActions.map((qa, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qa.prompt)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900/80 hover:bg-indigo-600/20 border border-zinc-800 hover:border-indigo-500/40 text-zinc-300 hover:text-indigo-300 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{qa.label}</span>
          </button>
        ))}
      </div>

      {/* COPILOT CHAT INPUT CARD */}
      <div className="card-panel p-5 space-y-4 border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              ✦
            </div>
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Ask anything about your LifeOS...</h3>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">Unified Multi-Agent Architecture</span>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder='e.g., "Plan my day", "Why is my React goal behind?", or "Start a focus session"...'
            className="flex-1 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
          />
          <Button type="submit" variant="ai" size="md" disabled={loading} icon={Send}>
            {loading ? 'Routing...' : 'Send'}
          </Button>
        </form>
      </div>

      {/* MULTI-AGENT COLLABORATION ROUTER BAR */}
      {copilotResponse && (
        <div className="card-panel p-4 border-indigo-500/30 bg-zinc-950 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              SPECIALIZED AGENT ROUTING CHAIN
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              Intent: {copilotResponse.intent} ({Math.round(copilotResponse.confidence * 100)}% Confidence)
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto text-xs py-1">
            {(copilotResponse.activeAgentChain || ['General Agent']).map((agentName, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ArrowRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />}
                <span className="px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 font-mono font-bold text-[11px] shrink-0">
                  {agentName}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ACTION CONFIRMATION INTERCEPTOR BANNER */}
      {pendingAction && (
        <div className="card-panel p-5 border-amber-500/50 bg-amber-950/20 space-y-3 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>CONFIRM ACTION — Explicit User Approval Required</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/90 border border-amber-500/30 space-y-2 text-xs">
            <span className="font-bold text-zinc-100 block">Action: {pendingAction.type}</span>
            <p className="text-zinc-300 leading-relaxed">{JSON.stringify(pendingAction)}</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="success" size="sm" onClick={handleConfirmAction} icon={Check}>
              Confirm Action
            </Button>
            <Button variant="danger" size="sm" onClick={handleCancelAction} icon={X}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* COPILOT RESPONSE CARD */}
      {copilotResponse && (
        <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950 animate-in fade-in duration-200">
          <div className="prose prose-invert max-w-none text-xs leading-relaxed text-zinc-200 space-y-3">
            <div dangerouslySetInnerHTML={{
              __html: copilotResponse.responseText.replace(/\n/g, '<br/>')
            }} />
          </div>

          {/* DATA LINEAGE CITATIONS */}
          {copilotResponse.sources && copilotResponse.sources.length > 0 && (
            <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-zinc-500 font-mono uppercase">DATA SOURCES:</span>
              {copilotResponse.sources.map((src, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
                  {src.type}: {src.name} {src.progress ? `(${src.progress})` : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
