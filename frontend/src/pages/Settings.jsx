import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useApp } from '../context/AppContext';
import { User, Cpu, Sparkles, Save, Trash2, Plus, BrainCircuit } from 'lucide-react';

export const Settings = () => {
  const {
    profile,
    setProfile,
    aiStatus,
    memories,
    addMemory,
    deleteMemory,
    clearMemories,
    showToast
  } = useApp();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [role, setRole] = useState(profile.role);
  const [peakEnergy, setPeakEnergy] = useState(profile.peakEnergy);
  const [targetMins, setTargetMins] = useState(profile.dailyFocusTargetMinutes);

  // New Memory State
  const [memKey, setMemKey] = useState('');
  const [memValue, setMemValue] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      name,
      email,
      role,
      peakEnergy,
      dailyFocusTargetMinutes: parseInt(targetMins, 10)
    }));
    showToast('Settings & User Profile updated!', 'success');
  };

  const handleAddMem = (e) => {
    e.preventDefault();
    if (!memKey.trim() || !memValue.trim()) return;

    addMemory({
      type: 'preference',
      key: memKey,
      value: memValue
    });

    setMemKey('');
    setMemValue('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      <PageHeader
        title="Application Settings & AI Memory"
        subtitle="Manage your context profile, Gemini API engine status, and persistent AI Memory bank."
      />

      {/* AI Engine Server Status Card */}
      <div className="card-panel p-6 border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-zinc-900 to-zinc-900">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-zinc-100">
              Server AI Provider Status
            </h3>
          </div>
          <Badge variant={aiStatus.configured ? "success" : "warning"} size="md">
            {aiStatus.configured ? "Gemini 1.5 Active" : "Local Fallback Mode"}
          </Badge>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed mb-3">
          {aiStatus.message}
        </p>

        {!aiStatus.configured && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 space-y-1">
            <span className="font-bold block">🔐 API Security Note:</span>
            <span>
              Your Gemini API key is never exposed to the frontend browser. Configure <code className="px-1 py-0.5 rounded bg-zinc-950 font-mono">GEMINI_API_KEY</code> in <code className="px-1 py-0.5 rounded bg-zinc-950 font-mono">server/.env</code> to activate live streaming LLM reasoning.
            </span>
          </div>
        )}
      </div>

      {/* AI Memory Bank */}
      <div className="card-panel p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Persistent AI Memory Bank
              </h3>
              <p className="text-xs text-zinc-400">Explicit user preferences injected into LLM context prompts.</p>
            </div>
          </div>

          {memories.length > 0 && (
            <button
              onClick={clearMemories}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Memory
            </button>
          )}
        </div>

        {/* Existing Memories List */}
        <div className="space-y-2">
          {memories.map((mem) => (
            <div key={mem.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-mono font-bold text-indigo-300 block">{mem.key}:</span>
                <span className="text-zinc-300 leading-relaxed">{mem.value}</span>
              </div>

              <button
                onClick={() => deleteMemory(mem.id)}
                className="text-zinc-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer shrink-0"
                title="Delete preference memory"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Preference Form */}
        <form onSubmit={handleAddMem} className="pt-2 border-t border-zinc-800 space-y-3">
          <span className="text-xs font-semibold text-zinc-400 block">Add Explicit Preference Memory</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Key (e.g. preferredWorkHours)"
              value={memKey}
              onChange={(e) => setMemKey(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Value (e.g. Morning 09:00 - 12:00)"
              value={memValue}
              onChange={(e) => setMemValue(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <Button variant="secondary" size="sm" type="submit" icon={Plus}>
            Save to AI Memory
          </Button>
        </form>
      </div>

      {/* User Context Profile Form */}
      <form onSubmit={handleSaveProfile} className="card-panel p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
          <User className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-zinc-100">
            User Profile & Productivity Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Role Track / Focus Track
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Peak Analytical Energy Hours
            </label>
            <input
              type="text"
              value={peakEnergy}
              onChange={(e) => setPeakEnergy(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ai" size="lg" type="submit" icon={Save}>
            Save Profile Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
