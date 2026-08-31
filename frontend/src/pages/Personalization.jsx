import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { personalizationService, defaultPersonalization } from '../services/personalizationService';
import {
  Sliders,
  Sparkles,
  Sun,
  Moon,
  ShieldCheck,
  Power,
  RotateCcw,
  Check,
  X,
  Eye,
  Layers,
  Settings,
  Brain,
  SlidersHorizontal,
  Bot,
  Grid,
  CheckCircle2,
  Lock,
  Volume2
} from 'lucide-react';

export const Personalization = () => {
  const { preferences, updatePreferences, showToast } = useApp();
  const [settings, setSettings] = useState(personalizationService.getSettings());
  const [activeTab, setActiveTab] = useState('ai_behavior'); // 'ai_behavior' | 'home_editor' | 'privacy' | 'appearance'
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const handleUpdateSetting = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    personalizationService.saveSettings(updated);
    showToast(`Updated ${key} setting.`, 'info');
  };

  const handleToggleHomeSection = (sectionId) => {
    const updatedSections = settings.homeSections.map(s => {
      if (s.id === sectionId) {
        return { ...s, visible: !s.visible };
      }
      return s;
    });
    handleUpdateSetting('homeSections', updatedSections);
  };

  const handleResetAllPersonalization = () => {
    const resetData = personalizationService.resetSettings();
    setSettings(resetData);
    setShowResetConfirmModal(false);
    showToast('Personalization settings reset to defaults!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Personalization & Adaptive Experience 3.0"
        subtitle="User-controlled AI response styles, Home dashboard layout editor, accessibility controls, and transparent privacy toggles."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirmModal(true)}
              icon={RotateCcw}
            >
              Reset Personalization
            </Button>

            <Button
              variant="ai"
              size="sm"
              onClick={() => {
                personalizationService.saveSettings(settings);
                showToast('Saved all personalization preferences!', 'success');
              }}
              icon={Check}
            >
              Save Preferences
            </Button>
          </div>
        }
      />

      {/* PRIVACY & TRANSPARENCY DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>User Preference Scoping: AI response styles and home layout configurations belong strictly to your authenticated session. Sensitive personal attributes are never inferred.</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'ai_behavior', label: 'AI Behavior & Response Style', icon: Bot },
          { id: 'home_editor', label: 'Home Layout Editor', icon: Grid },
          { id: 'privacy', label: 'Privacy & Memory Controls', icon: Lock },
          { id: 'appearance', label: 'Appearance & Accessibility', icon: SlidersHorizontal }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: AI BEHAVIOR & RESPONSE STYLE */}
      {activeTab === 'ai_behavior' && (
        <div className="space-y-6">
          <div className="card-panel p-6 space-y-5 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-400" />
              AI Response Output Customization
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Response Length Style */}
              <div className="space-y-2">
                <label className="block text-zinc-300 font-medium">AI Response Length Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Concise', 'Balanced', 'Detailed'].map(style => (
                    <button
                      key={style}
                      onClick={() => handleUpdateSetting('aiResponseStyle', style)}
                      className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        settings.aiResponseStyle === style
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                          : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Personality Tone */}
              <div className="space-y-2">
                <label className="block text-zinc-300 font-medium">AI Persona Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Professional', 'Friendly', 'Minimal'].map(tone => (
                    <button
                      key={tone}
                      onClick={() => handleUpdateSetting('aiTone', tone)}
                      className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        settings.aiTone === tone
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                          : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Core Animation Intensity */}
            <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs">
              <label className="block text-zinc-300 font-medium">3D AI Core Animation Intensity</label>
              <div className="flex gap-2">
                {['Low', 'Normal', 'High'].map(level => (
                  <button
                    key={level}
                    onClick={() => handleUpdateSetting('aiCoreAnimationIntensity', level)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      settings.aiCoreAnimationIntensity === level
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                    }`}
                  >
                    {level} Intensity
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOME LAYOUT EDITOR */}
      {activeTab === 'home_editor' && (
        <div className="card-panel p-6 space-y-5 border-indigo-500/40 bg-zinc-950">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Grid className="w-4 h-4 text-indigo-400" />
                Smart Home Dashboard Layout Customizer
              </h3>
              <p className="text-xs text-zinc-400">Toggle which dynamic modules appear on your Home Operating System view.</p>
            </div>

            <Button
              variant="outline"
              size="xs"
              onClick={() => handleUpdateSetting('homeSections', defaultPersonalization.homeSections)}
              icon={RotateCcw}
            >
              Reset Layout
            </Button>
          </div>

          <div className="space-y-3">
            {settings.homeSections.map(sec => (
              <div key={sec.id} className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center text-xs">
                <span className="font-bold text-zinc-100">{sec.title}</span>
                <button
                  onClick={() => handleToggleHomeSection(sec.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    sec.visible ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}
                >
                  {sec.visible ? 'VISIBLE' : 'HIDDEN'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRIVACY & MEMORY CONTROLS */}
      {activeTab === 'privacy' && (
        <div className="card-panel p-6 space-y-5 border-indigo-500/40 bg-zinc-950">
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" />
            AI Memory & Adaptive Privacy Controls
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
              <div>
                <span className="font-bold text-zinc-100 block">Adaptive AI Experience</span>
                <span className="text-[11px] text-zinc-400">Adapts recommendations using context signals.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.adaptiveExperienceEnabled}
                onChange={(e) => handleUpdateSetting('adaptiveExperienceEnabled', e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 border-zinc-700"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
              <div>
                <span className="font-bold text-zinc-100 block">Use Saved Preferences in AI</span>
                <span className="text-[11px] text-zinc-400">Allows AI Copilot to apply saved response styles.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.usePreferencesInAi}
                onChange={(e) => handleUpdateSetting('usePreferencesInAi', e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 border-zinc-700"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
              <div>
                <span className="font-bold text-zinc-100 block">Use Saved Memory Records</span>
                <span className="text-[11px] text-zinc-400">Allows AI to retrieve approved memory items.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.useMemoryInAi}
                onChange={(e) => handleUpdateSetting('useMemoryInAi', e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 border-zinc-700"
              />
            </label>
          </div>
        </div>
      )}

      {/* TAB 4: APPEARANCE & ACCESSIBILITY */}
      {activeTab === 'appearance' && (
        <div className="card-panel p-6 space-y-5 border-indigo-500/40 bg-zinc-950">
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            Appearance & Accessibility Settings
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Theme Mode</label>
              <div className="flex gap-2">
                {['dark', 'light', 'system'].map(th => (
                  <button
                    key={th}
                    onClick={() => handleUpdateSetting('theme', th)}
                    className={`px-3 py-1.5 rounded-xl border font-bold capitalize cursor-pointer transition-colors ${
                      settings.theme === th ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                    }`}
                  >
                    {th} Theme
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
                <span className="font-medium text-zinc-200">Reduced Motion</span>
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => handleUpdateSetting('reducedMotion', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-zinc-700"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
                <span className="font-medium text-zinc-200">High Contrast Mode</span>
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => handleUpdateSetting('highContrast', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-zinc-700"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* RESET PERSONALIZATION CONFIRMATION MODAL */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-rose-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                Reset Personalization Settings?
              </h3>
              <button onClick={() => setShowResetConfirmModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Reset all UI layout, AI response styles, and accessibility settings to default. Your tasks, goals, notes, memory, and calendar events will <strong className="text-zinc-100">NOT</strong> be affected.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setShowResetConfirmModal(false)}>Cancel</Button>
              <Button variant="ai" size="sm" onClick={handleResetAllPersonalization}>Reset Settings</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
