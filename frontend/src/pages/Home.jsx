import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { sendAICommand } from '../services/aiService';
import {
  Sparkles,
  Zap,
  Target,
  BookOpen,
  Bot,
  Play,
  Mic,
  ArrowRight,
  Calendar as CalendarIcon,
  CheckSquare,
  Clock,
  Folder,
  Activity,
  Cpu,
  Layers,
  ShieldAlert,
  X,
  Command,
  HelpCircle,
  ImageIcon,
  FileText,
  Plus,
  Search,
  CheckCircle2
} from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const { profile, tasks, goals, focusSessions, calendarEvents, showToast, focusSecondsLeft } = useApp();

  const [aiPrompt, setAiPrompt] = useState('');
  const [isCoreHovered, setIsCoreHovered] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Cycling Placeholder State
  const placeholders = [
    'Plan my day...',
    'Show my priorities...',
    'Research AI agent patterns...',
    'Create a task...',
    'Start a 25m focus sprint...'
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const canvasRef = useRef(null);

  // Compute Context Metrics
  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasksCount = tasks.length - activeTasks.length;
  const topTask = activeTasks[0] || null;

  const totalFocusMins = focusSessions.reduce((acc, s) => acc + Number(s.durationMinutes || s.duration_minutes || 0), 0);
  const focusHours = Math.floor(totalFocusMins / 60);
  const focusMins = totalFocusMins % 60;
  const focusFormatted = `${focusHours}h ${focusMins}m`;

  const avgGoalProgress = goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / goals.length) : 72;

  // Cycle Placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  // Keyboard Command Palette Listener (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Format Timer
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Handle AI Command Submission
  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const query = aiPrompt.trim();
    setAiPrompt('');

    showToast(`Command Center processing: "${query}"`, 'info');

    try {
      const res = await sendAICommand(query, { tasks, goals, profile });
      if (res.responseMessage) {
        showToast(res.responseMessage, 'success');
      }

      const q = query.toLowerCase();
      if (q.includes('plan')) navigate('/planner');
      else if (q.includes('focus')) navigate('/focus');
      else if (q.includes('task')) navigate('/tasks');
      else if (q.includes('study')) navigate('/study');
      else if (q.includes('goal')) navigate('/goals');
      else if (q.includes('calendar')) navigate('/calendar');
      else navigate('/copilot');
    } catch (err) {
      navigate('/copilot');
    }
  };

  // 3D CANVAS BACKGROUND & NEURAL CORE RENDERER
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 2 + 0.5,
      radius: Math.random() * 1.8 + 0.5,
      alpha: Math.random() * 0.4 + 0.15,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25
    }));

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.32;

      // Soft Ambient Radial Gradient
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, width * 0.55);
      bgGrad.addColorStop(0, 'rgba(99, 102, 241, 0.18)');
      bgGrad.addColorStop(0.4, 'rgba(139, 92, 246, 0.06)');
      bgGrad.addColorStop(1, 'rgba(9, 9, 11, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.z, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 180, 252, ${p.alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#6366f1';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 85) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - dist / 85)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      angle += 0.006;
      const coreRadius = isCoreHovered ? 64 : 56;

      // Orbital Ring 1
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.scale(1, 0.32);
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius * 1.75, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Orbital Ring 2
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-angle * 1.3);
      ctx.scale(0.38, 1);
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius * 2.05, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.28)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // Core Sphere Gradient
      const coreGrad = ctx.createRadialGradient(cx - 14, cy - 14, 4, cx, cy, coreRadius);
      coreGrad.addColorStop(0, '#c7d2fe');
      coreGrad.addColorStop(0.3, '#6366f1');
      coreGrad.addColorStop(0.75, '#3730a3');
      coreGrad.addColorStop(1, '#1e1b4b');

      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.shadowBlur = isCoreHovered ? 40 : 26;
      ctx.shadowColor = '#6366f1';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Specular Highlight
      ctx.beginPath();
      ctx.arc(cx - coreRadius * 0.3, cy - coreRadius * 0.3, coreRadius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isCoreHovered]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 p-4 sm:p-6 lg:p-8 bg-zinc-950 text-zinc-100 overflow-hidden select-none">
      {/* 3D CANVAS BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* TOP DECORATIVE GRID PATTERN */}
      <div className="absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none z-0" />

      {/* HERO & CENTRAL AI CORE SECTION */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-6 pt-2 pb-6">
        {/* HERO TITLE & PERSONAL GREETING */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>AI Personal Operating System 4.0</span>
            <span className="text-[10px] text-zinc-500 font-mono pl-1 border-l border-zinc-700">Press Ctrl+K</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
            Good morning, {profile?.name || 'Suranjan'}.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto font-medium">
            What would you like to accomplish today?
          </p>
        </div>

        {/* 3D INTERACTIVE AI CORE SPHERE CONTAINER */}
        <div className="relative h-36 flex items-center justify-center my-2">
          <div
            onMouseEnter={() => setIsCoreHovered(true)}
            onMouseLeave={() => setIsCoreHovered(false)}
            onClick={() => navigate('/copilot')}
            className="w-32 h-32 rounded-full cursor-pointer flex items-center justify-center group transition-all duration-300 transform hover:scale-105"
            title="Open Interactive AI Copilot"
          >
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl group-hover:bg-indigo-500/40 transition-all duration-300" />
            <div className="relative text-center space-y-0.5">
              <Bot className="w-8 h-8 text-indigo-200 mx-auto transition-transform duration-300 group-hover:rotate-12" />
              <span className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest block opacity-90">
                LIFE AI CORE
              </span>
            </div>
          </div>
        </div>

        {/* UNIVERSAL MULTIMODAL COMMAND INPUT BAR */}
        <div className="max-w-2xl mx-auto space-y-3">
          <form onSubmit={handleAiSubmit} className="relative">
            <div className="relative flex items-center rounded-2xl bg-zinc-900/90 border border-indigo-500/40 shadow-2xl backdrop-blur-xl transition-all duration-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/30">
              <Sparkles className="w-5 h-5 text-indigo-400 ml-4 shrink-0" />

              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={placeholders[placeholderIndex]}
                className="w-full py-4 px-3 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none font-medium transition-all"
              />

              <div className="flex items-center gap-1.5 pr-3">
                <button
                  type="button"
                  onClick={() => navigate('/multimodal')}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Voice Input (🎙)"
                >
                  <Mic className="w-4 h-4 text-indigo-400" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/multimodal')}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Image OCR (📷)"
                >
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/multimodal')}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Document Input (📄)"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md cursor-pointer flex items-center justify-center ml-1"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* QUICK ACTIONS ROW */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
            <button
              onClick={() => navigate('/tasks')}
              className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/40 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" /> Task
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/40 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-purple-400" /> Project
            </button>
            <button
              onClick={() => navigate('/goals')}
              className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/40 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" /> Goal
            </button>
            <button
              onClick={() => navigate('/focus')}
              className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/40 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Focus
            </button>
            <button
              onClick={() => navigate('/research-engine')}
              className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/40 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" /> Research
            </button>
          </div>
        </div>

        {/* LIFE SNAPSHOT METRICS */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              LIFE SNAPSHOT
            </h2>
            <span className="text-[11px] text-zinc-500 font-mono">Live Authenticated Context</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div
              onClick={() => navigate('/tasks')}
              className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md space-y-1 hover:border-indigo-500/40 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Tasks</span>
                <CheckSquare className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-lg font-black font-mono text-zinc-100 block">
                {completedTasksCount} / {tasks.length}
              </span>
            </div>

            <div
              onClick={() => navigate('/focus')}
              className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md space-y-1 hover:border-emerald-500/40 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Focus</span>
                <Zap className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-lg font-black font-mono text-zinc-100 block">
                {focusFormatted}
              </span>
            </div>

            <div
              onClick={() => navigate('/study')}
              className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md space-y-1 hover:border-purple-500/40 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Study</span>
                <BookOpen className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-lg font-black font-mono text-zinc-100 block">
                1h 40m
              </span>
            </div>

            <div
              onClick={() => navigate('/goals')}
              className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md space-y-1 hover:border-amber-500/40 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Goals</span>
                <Target className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-lg font-black font-mono text-zinc-100 block">
                {avgGoalProgress}%
              </span>
            </div>

            <div
              onClick={() => navigate('/projects')}
              className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md space-y-1 col-span-2 sm:col-span-1 hover:border-rose-500/40 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Projects</span>
                <Folder className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-lg font-black font-mono text-zinc-100 block">
                3 Active
              </span>
            </div>
          </div>
        </div>

        {/* MAIN COMMAND CENTER WIDGETS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* LEFT: TODAY TIMELINE & AGENT ACTIVITY */}
          <div className="lg:col-span-2 space-y-6">
            {/* WHAT NEEDS YOUR ATTENTION SECTION */}
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-amber-500/30 backdrop-blur-md space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  WHAT NEEDS YOUR ATTENTION
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">Real-Time Audit</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-zinc-950 border border-amber-500/30 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-zinc-100 block">DBMS Assignment Exam Revision Due Tomorrow</span>
                    <span className="text-[10px] text-amber-300 font-mono">Approaching Deadline • High Priority</span>
                  </div>
                  <button onClick={() => navigate('/focus')} className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 cursor-pointer">
                    Schedule Focus
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-zinc-100 block">Pending Task Agent Approval (DBMS Revision Tasks)</span>
                    <span className="text-[10px] text-indigo-300 font-mono">AI Mission Action Gate</span>
                  </div>
                  <button onClick={() => navigate('/agents')} className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 cursor-pointer">
                    Review Gate
                  </button>
                </div>
              </div>
            </div>

            {/* TODAY TIMELINE WIDGET */}
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  TODAY INTELLIGENCE TIMELINE
                </h3>
                <button onClick={() => navigate('/calendar')} className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer">
                  Open Calendar →
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {[
                  { time: '09:00 AM', title: 'DBMS Joins & Normalization Study Session', category: 'Study', color: 'border-purple-500/40 text-purple-300' },
                  { time: '11:30 AM', title: 'AI-LifeOS Ecosystem Architecture Review', category: 'Project', color: 'border-indigo-500/40 text-indigo-300' },
                  { time: '02:00 PM', title: 'Deep Work Focus Sprint (25m)', category: 'Focus', color: 'border-emerald-500/40 text-emerald-300' },
                  { time: '07:00 PM', title: 'Evening Daily Review & Personal Goals', category: 'Personal', color: 'border-amber-500/40 text-amber-300' }
                ].map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-xs">
                    <span className="font-mono text-zinc-400 w-16 text-right shrink-0">{slot.time}</span>
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    <div className={`flex-1 p-2.5 rounded-xl bg-zinc-950 border ${slot.color} flex justify-between items-center`}>
                      <span className="font-bold text-zinc-100">{slot.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 uppercase">
                        {slot.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: NEXT ACTION & FOCUS WIDGETS */}
          <div className="space-y-4">
            {/* NEXT BEST ACTION CARD */}
            <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">NEXT BEST ACTION</span>
                <span className="text-[10px] font-mono text-emerald-300">Optimal Sprint</span>
              </div>

              {topTask ? (
                <>
                  <h4 className="text-xs font-bold text-zinc-100">Continue: {topTask.title}</h4>

                  {/* WHY EXPLAINABILITY BOX */}
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
                    <span className="font-bold text-emerald-300 uppercase text-[10px] flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-emerald-400" /> WHY THIS?
                    </span>
                    <p className="leading-relaxed">It is your top priority active task matching your evening peak focus energy window (7 PM – 9 PM).</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => { showToast(`Starting focus for ${topTask.title}`, 'success'); navigate('/focus'); }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Start Focus Sprint
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-zinc-400">No recommended action yet.</p>
              )}
            </div>

            {/* COMPACT FOCUS TIMER */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">FOCUS TIMER</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  {formatTime(focusSecondsLeft)}
                </span>
              </div>
              <button
                onClick={() => navigate('/focus')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Focus
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GLOBAL COMMAND PALETTE MODAL (Ctrl+K) */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Command className="w-4 h-4 text-indigo-400" />
                LifeOS Command Palette
              </h3>
              <button onClick={() => setShowCommandPalette(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs max-h-64 overflow-y-auto">
              {[
                { name: 'Tasks Module', route: '/tasks' },
                { name: 'Calendar Module', route: '/calendar' },
                { name: 'Focus Center', route: '/focus' },
                { name: 'Study Center', route: '/study' },
                { name: 'AI Decision Engine', route: '/decisions' },
                { name: 'AI Execution Engine', route: '/execution' },
                { name: 'AI Knowledge Engine', route: '/knowledge-engine' },
                { name: 'AI Personalization Center', route: '/personalization' },
                { name: 'Multimodal AI Center', route: '/multimodal' },
                { name: 'AI Agent Orchestrator', route: '/agents' },
                { name: 'Master System Hub', route: '/master-hub' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => { setShowCommandPalette(false); navigate(item.route); }}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 text-left font-bold text-zinc-200 flex justify-between items-center cursor-pointer"
                >
                  <span>{item.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
