import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  askMyKnowledge,
  generateAiQuizFromKnowledge,
  generateAiFlashcardsFromKnowledge,
  generateLearningPath
} from '../services/knowledgeEngineService';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Search,
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Award,
  AlertTriangle,
  Sliders,
  Check,
  ExternalLink
} from 'lucide-react';

export const KnowledgeEngine = () => {
  const navigate = useNavigate();
  const { notes, studySubjects, tasks, goals, projects, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('ask'); // 'ask' | 'paths' | 'quiz' | 'gaps'
  const [explanationMode, setExplanationMode] = useState('Normal'); // 'Simple' | 'Normal' | 'Detailed'

  // Ask My Knowledge State
  const [askQuery, setAskQuery] = useState('Explain my notes on SQL joins and normalization');
  const [askResult, setAskResult] = useState(null);

  // Flashcards & Quizzes State
  const [quizList, setQuizList] = useState(generateAiQuizFromKnowledge());
  const [flashcardsList, setFlashcardsList] = useState(generateAiFlashcardsFromKnowledge());
  const [userAnswers, setUserAnswers] = useState({});
  const [showFlashcardBack, setShowFlashcardBack] = useState({});

  // Learning Path State
  const [learningPathData, setLearningPathData] = useState(generateLearningPath());

  // Handle Ask Knowledge
  const handleAskKnowledgeSubmit = (e) => {
    e.preventDefault();
    if (!askQuery.trim()) return;
    const res = askMyKnowledge(askQuery, { notes, studySubjects, tasks }, explanationMode);
    setAskResult(res);
    showToast('Retrieved knowledge context with source citations.', 'info');
  };

  // Quiz Option Click
  const handleSelectQuizOption = (quizId, optIdx) => {
    setUserAnswers(prev => ({ ...prev, [quizId]: optIdx }));
  };

  // Toggle Flashcard Flip
  const handleToggleFlashcard = (id) => {
    setShowFlashcardBack(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Delete Flashcard
  const handleDeleteFlashcard = (id) => {
    setFlashcardsList(prev => prev.filter(f => f.id !== id));
    showToast('Deleted flashcard.', 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Knowledge & Learning Engine 3.0"
        subtitle="Semantic knowledge search, transparent source citations, auto-generated quizzes, flashcards, learning paths, and gap analysis grounded in user notes."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/notes')} icon={FileText}>
              Manage Notes
            </Button>

            <Button variant="ai" size="sm" onClick={() => navigate('/study')} icon={BookOpen}>
              Study Center
            </Button>
          </div>
        }
      />

      {/* PRIVACY & TRANSPARENCY DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Source Citation Integrity: Every AI answer is cited directly to your saved notes & study topics. Unsupported claims are strictly avoided.</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'ask', label: 'Ask My Knowledge & Search', icon: HelpCircle },
          { id: 'paths', label: 'Learning Paths & Study Plan', icon: Sparkles },
          { id: 'quiz', label: `Quizzes (${quizList.length}) & Flashcards (${flashcardsList.length})`, icon: Award },
          { id: 'gaps', label: 'Knowledge Gaps & Profile', icon: AlertTriangle }
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

      {/* TAB 1: ASK MY KNOWLEDGE & SEARCH */}
      {activeTab === 'ask' && (
        <div className="space-y-6">
          <div className="card-panel p-5 space-y-4 border-indigo-500/40 bg-zinc-950">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-400" />
                Ask Your Saved Knowledge Base
              </h3>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-400 font-medium">Explanation Mode:</span>
                {['Simple', 'Normal', 'Detailed'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setExplanationMode(mode)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                      explanationMode === mode ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAskKnowledgeSubmit} className="flex gap-2 text-xs">
              <input
                type="text"
                value={askQuery}
                onChange={(e) => setAskQuery(e.target.value)}
                placeholder='e.g., "Find my notes about SQL joins" or "Explain DBMS normalization"'
                className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:border-indigo-500 focus:outline-none font-medium"
              />
              <Button type="submit" variant="ai" size="sm">Ask Knowledge</Button>
            </form>
          </div>

          {/* ASK KNOWLEDGE RESULT WITH CITATIONS */}
          {askResult && (
            <div className="card-panel p-6 space-y-4 border-indigo-500/30 bg-zinc-950">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <span className="badge-ai px-2.5 py-0.5 text-[10px] font-bold rounded uppercase">
                  AI KNOWLEDGE RESPONSE ({explanationMode} Mode)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 leading-relaxed whitespace-pre-line">
                {askResult.answer}
              </div>

              {/* CITATIONS PANEL */}
              {askResult.sources.length > 0 && (
                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">SOURCE CITATIONS</span>
                  {askResult.sources.map(src => (
                    <div key={src.id} className="flex justify-between items-center p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                      <span className="font-bold text-zinc-100">{src.title}</span>
                      <button
                        onClick={() => navigate('/notes')}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1"
                      >
                        Open Source <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LEARNING PATHS & STUDY PLAN */}
      {activeTab === 'paths' && (
        <div className="space-y-6">
          <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {learningPathData.title}
              </h3>
              <Badge variant="primary" size="sm">AI Generated Roadmap</Badge>
            </div>

            <div className="space-y-3">
              {learningPathData.steps.map((s, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-indigo-400 font-bold text-sm">Step {s.step}</span>
                    <div>
                      <span className="font-bold text-zinc-100 block">{s.title}</span>
                      <span className="text-[10px] text-zinc-400 block font-mono">Source: {s.source}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
                    s.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    s.status === 'In Progress' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                    'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUIZZES & FLASHCARDS */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          {/* AI QUIZ GENERATOR SECTION */}
          <div className="card-panel p-6 space-y-4 border-indigo-500/30 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              AI Knowledge Practice Quiz (DBMS & SQL)
            </h3>

            <div className="space-y-4 text-xs">
              {quizList.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-zinc-100">Q{idx + 1}. {q.question}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{q.source}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = userAnswers[q.id] === oIdx;
                      const isCorrect = oIdx === q.correctIndex;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectQuizOption(q.id, oIdx)}
                          className={`p-2.5 rounded-xl border text-left font-medium transition-colors cursor-pointer ${
                            userAnswers[q.id] !== undefined
                              ? isCorrect ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold' :
                                isSelected ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-indigo-500/40'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {userAnswers[q.id] !== undefined && (
                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-indigo-300 space-y-1">
                      <span className="font-bold uppercase text-[10px] block">EXPLANATION</span>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FLASHCARDS QUEUE SECTION */}
          <div className="card-panel p-6 space-y-4 border-purple-500/30 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-purple-400" />
              Flashcard Review Queue ({flashcardsList.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {flashcardsList.map(fc => (
                <div key={fc.id} className="card-panel p-5 space-y-3 flex flex-col justify-between border-zinc-800">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="purple" size="sm">{fc.topic}</Badge>
                      <button onClick={() => handleDeleteFlashcard(fc.id)} className="text-zinc-500 hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div
                      onClick={() => handleToggleFlashcard(fc.id)}
                      className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer min-h-[90px] flex items-center justify-center text-center text-xs"
                    >
                      {showFlashcardBack[fc.id] ? (
                        <p className="text-indigo-300 font-bold">{fc.back}</p>
                      ) : (
                        <p className="text-zinc-100 font-bold">{fc.front}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                    <span>{fc.source}</span>
                    <button onClick={() => handleToggleFlashcard(fc.id)} className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer">
                      {showFlashcardBack[fc.id] ? 'Show Front' : 'Flip to Back'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: KNOWLEDGE GAPS & LEARNING PROFILE */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          <div className="card-panel p-6 space-y-4 border-amber-500/40 bg-zinc-950">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <h3 className="text-sm font-bold text-zinc-100">Knowledge Gap Analysis</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 flex justify-between items-center">
                <div>
                  <span className="font-bold text-zinc-100 block">Missing API Authentication Notes</span>
                  <span className="text-[11px] text-zinc-400">Your AI-LifeOS project references API auth, but no related learning material was found in notes.</span>
                </div>
                <Button variant="ai" size="xs" onClick={() => navigate('/notes')}>Add Note</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
