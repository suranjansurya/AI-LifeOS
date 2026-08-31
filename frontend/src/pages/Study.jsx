import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { getStudyOverviewAi, generateAiQuizClient, generateAiFlashcardsClient } from '../services/aiService';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Award,
  Sparkles,
  HelpCircle,
  Play,
  CheckCircle2,
  AlertCircle,
  Plus,
  BarChart2,
  Calendar,
  X,
  Check,
  Flame,
  Layers,
  FileText,
  Bookmark,
  ShieldCheck,
  Brain,
  RotateCw
} from 'lucide-react';

export const Study = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();

  // State Management
  const [subjects, setSubjects] = useState([
    { id: 'sub-1', name: 'DBMS', code: 'CS301', progress: 68, totalTopics: 25, completedTopics: 17, color: 'text-indigo-400', semester: 'Sem 5', priority: 'High' },
    { id: 'sub-2', name: 'Java Programming', code: 'CS302', progress: 75, totalTopics: 20, completedTopics: 15, color: 'text-emerald-400', semester: 'Sem 5', priority: 'Medium' },
    { id: 'sub-3', name: 'Data Structures & Algorithms', code: 'CS303', progress: 60, totalTopics: 30, completedTopics: 18, color: 'text-purple-400', semester: 'Sem 5', priority: 'High' }
  ]);

  const [topics, setTopics] = useState([
    { id: 'top-1', subjectName: 'DBMS', name: 'SQL Joins & Subqueries', status: 'Review', progress: 70, difficulty: 'Medium', lastStudied: 'Aug 24, 2026' },
    { id: 'top-2', subjectName: 'DBMS', name: 'Normalization (3NF / BCNF)', status: 'Learning', progress: 40, difficulty: 'Hard', lastStudied: 'Aug 20, 2026' },
    { id: 'top-3', subjectName: 'Java Programming', name: 'OOP Polymorphism & Interfaces', status: 'Completed', progress: 100, difficulty: 'Easy', lastStudied: 'Aug 28, 2026' }
  ]);

  const [exams, setExams] = useState([
    { id: 'ex-1', subjectName: 'DBMS', name: 'DBMS Midterm Exam', date: '2026-09-10', time: '10:00 AM', location: 'Hall B', notes: 'Chapters 1–5' },
    { id: 'ex-2', subjectName: 'Java Programming', name: 'Java Lab Practical', date: '2026-09-18', time: '02:00 PM', location: 'Lab 3', notes: 'OOP & Collections' }
  ]);

  const [assignments, setAssignments] = useState([
    { id: 'asg-1', subjectName: 'DBMS', title: 'Relational Algebra & Normalization Assignment', deadline: 'Sept 05, 2026', priority: 'High', status: 'In Progress' }
  ]);

  const [flashcards, setFlashcards] = useState([
    { id: 'fc-1', subject: 'DBMS', topic: 'Joins', question: 'What is the primary difference between INNER JOIN and LEFT JOIN?', answer: 'INNER JOIN returns matching rows from both tables. LEFT JOIN returns all rows from left table + matched right rows.' }
  ]);

  const [overview, setOverview] = useState(null);
  const [activeTab, setActiveTab] = useState('plan'); // 'plan' | 'subjects' | 'exams' | 'flashcards' | 'revision'
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showFlashcardsModal, setShowFlashcardsModal] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [generatedCards, setGeneratedCards] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);

  const fetchOverview = async () => {
    try {
      const res = await getStudyOverviewAi(subjects, topics);
      setOverview(res);
    } catch (err) {
      showToast('Error loading study overview.', 'error');
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [subjects, topics]);

  const calculateDaysRemaining = (examDateStr) => {
    const today = new Date();
    const examDate = new Date(examDateStr);
    const diffTime = examDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Exam completed';
    if (diffDays === 0) return 'Today!';
    return `${diffDays} Days Remaining`;
  };

  const handleStartFocus = (topicName) => {
    showToast(`Started Focus Session for "${topicName}"!`, 'success');
    navigate('/focus');
  };

  const handleGenerateQuiz = async (subject = 'DBMS', topic = 'Joins') => {
    try {
      const res = await generateAiQuizClient(subject, topic, 'Intermediate');
      if (res.quiz) {
        setActiveQuiz(res.quiz);
        setSelectedAnswers({});
        setQuizScore(null);
        setShowQuizModal(true);
      }
    } catch (e) {
      showToast('Error generating AI practice quiz.', 'error');
    }
  };

  const handleGenerateFlashcards = async (subject = 'DBMS', topic = 'Joins') => {
    try {
      const res = await generateAiFlashcardsClient(subject, topic);
      if (res.flashcards) {
        setGeneratedCards(res.flashcards);
        setShowFlashcardsModal(true);
      }
    } catch (e) {
      showToast('Error generating AI flashcards.', 'error');
    }
  };

  const handleSaveFlashcards = () => {
    setFlashcards(prev => [...generatedCards, ...prev]);
    showToast(`${generatedCards.length} AI Flashcards saved!`, 'success');
    setShowFlashcardsModal(false);
  };

  const handleAnswerSelect = (qId, optionIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    let correct = 0;
    activeQuiz.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        correct += 1;
      }
    });
    const finalScore = Math.round((correct / activeQuiz.questions.length) * 100);
    setQuizScore({ correct, total: activeQuiz.questions.length, percent: finalScore });
    showToast(`Quiz completed! Score: ${finalScore}%`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Study & Learning Intelligence 2.0"
        subtitle="Subject profiles, topic progress, focus sessions, practice quizzes, exam countdowns, and spaced revision engine."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleGenerateFlashcards('DBMS', 'Joins')} icon={Layers}>
              AI Flashcards
            </Button>
            <Button variant="ai" size="sm" onClick={() => handleGenerateQuiz('DBMS', 'Joins')} icon={HelpCircle}>
              Generate AI Quiz
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleStartFocus('DBMS Joins')} icon={Play}>
              Start Study Session
            </Button>
          </div>
        }
      />

      {/* PRIVACY & NON-FABRICATION DISCLAIMER */}
      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Educational disclaimer: Spaced revision and weak topic insights are study-planning aids based on recorded activity. No guaranteed academic results.</span>
        </div>
      </div>

      {/* METRICS DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-panel p-4 flex items-center justify-between border-indigo-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">OVERALL PROGRESS</span>
            <span className="text-2xl font-black text-indigo-400 font-mono">
              {overview?.overallProgress || 68}%
            </span>
          </div>
          <GraduationCap className="w-6 h-6 text-indigo-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-emerald-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">STUDY TIME</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {overview?.studyTimeFormatted || '12h 40m'}
            </span>
          </div>
          <Clock className="w-6 h-6 text-emerald-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-purple-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">TOPICS COMPLETED</span>
            <span className="text-2xl font-black text-purple-400 font-mono">
              {overview?.completedTopics || 17} / {overview?.totalTopics || 25}
            </span>
          </div>
          <BookOpen className="w-6 h-6 text-purple-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-rose-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">UPCOMING EXAM</span>
            <span className="text-xs font-bold text-rose-300 block truncate">{exams[0]?.name || 'DBMS Midterm'}</span>
            <span className="text-[10px] text-zinc-400 font-mono">{calculateDaysRemaining(exams[0]?.date || '2026-09-10')}</span>
          </div>
          <Calendar className="w-6 h-6 text-rose-400 opacity-60" />
        </div>
      </div>

      {/* WEAK TOPICS DETECTION BANNER */}
      {overview?.weakTopics && (
        <div className="card-panel p-4 border-amber-500/40 bg-amber-950/20 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>AI WEAK TOPIC DETECTED (REVISION RECOMMENDED)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {overview.weakTopics.map(wt => (
              <div key={wt.id} className="p-3 rounded-xl bg-zinc-950/80 border border-amber-500/30 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-zinc-100">{wt.subject}: {wt.name}</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">{wt.reason}</span>
                </div>
                <Button variant="outline" size="xs" onClick={() => handleStartFocus(wt.name)}>
                  Revise
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRACTICE QUIZ MODAL */}
      {showQuizModal && activeQuiz && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-xl w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                {activeQuiz.title}
              </h3>
              <button onClick={() => setShowQuizModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            {quizScore ? (
              <div className="p-5 text-center space-y-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <h4 className="text-lg font-black text-indigo-300">Quiz Completed!</h4>
                <div className="text-3xl font-black text-zinc-100 font-mono">
                  {quizScore.percent}% ({quizScore.correct} / {quizScore.total})
                </div>
                <p className="text-xs text-zinc-400">
                  {quizScore.percent >= 80 ? '🎉 Great understanding of quiz questions!' : 'Review incorrect questions to strengthen core concepts.'}
                </p>
                <Button variant="primary" size="sm" onClick={() => setShowQuizModal(false)}>Done</Button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {activeQuiz.questions.map((q, qIdx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                    <span className="font-bold text-zinc-200 block">
                      {qIdx + 1}. {q.questionText}
                    </span>

                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleAnswerSelect(q.id, optIdx)}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                            selectedAnswers[q.id] === optIdx
                              ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500'
                              : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-900'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}) {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setShowQuizModal(false)}>Cancel</Button>
                  <Button variant="ai" size="sm" onClick={handleSubmitQuiz}>Submit Quiz Answers</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI FLASHCARDS MODAL */}
      {showFlashcardsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-lg w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                AI Generated Flashcards (Review & Save)
              </h3>
              <button onClick={() => setShowFlashcardsModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {generatedCards.map((fc, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <span className="font-bold text-indigo-300 block">Q: {fc.question}</span>
                  <p className="text-zinc-300">A: {fc.answer}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowFlashcardsModal(false)}>Discard</Button>
              <Button variant="ai" size="sm" onClick={handleSaveFlashcards} icon={Check}>
                Save Flashcards
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TABS & PLAN SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
          {[
            { id: 'plan', label: 'Today’s Study Plan' },
            { id: 'subjects', label: `Subjects (${subjects.length})` },
            { id: 'exams', label: `Exams (${exams.length})` },
            { id: 'flashcards', label: `Flashcards (${flashcards.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TODAY'S STUDY PLAN */}
        {activeTab === 'plan' && (
          <div className="card-panel p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              TODAY'S AUTONOMOUS LEARNING SCHEDULE
            </h3>

            <div className="space-y-3">
              {(overview?.todayPlan || []).map(item => (
                <div key={item.id} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-100">{item.subject}: {item.topic}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                        {item.priority} Priority
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono">Duration: {item.durationMinutes} Minutes</span>
                  </div>

                  <Button variant="success" size="xs" onClick={() => handleStartFocus(item.topic)} icon={Play}>
                    Start Focus
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBJECTS & TOPICS */}
        {activeTab === 'subjects' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subjects.map(s => (
              <div key={s.id} className="card-panel p-5 space-y-3 border-zinc-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-100">{s.name} ({s.code})</span>
                  <span className="text-indigo-400 font-mono font-bold">{s.progress}%</span>
                </div>

                <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${s.progress}%` }} />
                </div>

                <div className="flex justify-between items-center text-[11px] text-zinc-400 font-mono">
                  <span>{s.completedTopics} / {s.totalTopics} Topics</span>
                  <Button variant="outline" size="xs" onClick={() => handleGenerateQuiz(s.name, 'Core Concepts')}>
                    Quiz Me
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EXAM COUNTDOWN */}
        {activeTab === 'exams' && (
          <div className="card-panel p-5 space-y-3">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-400" />
              Upcoming Exam Schedule & Preparation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map(ex => (
                <div key={ex.id} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-zinc-100">{ex.name}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 rounded border border-rose-500/30 font-mono">
                      {calculateDaysRemaining(ex.date)}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono block">Date: {ex.date} at {ex.time} • {ex.location}</span>
                  <p className="text-zinc-400 text-[11px]">Notes: {ex.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FLASHCARDS */}
        {activeTab === 'flashcards' && (
          <div className="card-panel p-5 space-y-3">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Saved Study Flashcards
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flashcards.map(fc => (
                <div key={fc.id} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase">{fc.subject}: {fc.topic}</span>
                  <span className="font-bold text-zinc-100 block">Q: {fc.question}</span>
                  <p className="text-zinc-300 bg-zinc-950 p-2 rounded-lg border border-zinc-800">A: {fc.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
