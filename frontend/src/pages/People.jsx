import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { getPeopleOverviewAi, generateAiMessageDraftClient } from '../services/aiService';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  Building,
  Calendar as CalendarIcon,
  Sparkles,
  Plus,
  Copy,
  Clock,
  ShieldCheck,
  X,
  MessageSquare,
  FileText,
  Tag,
  Check
} from 'lucide-react';

export const People = () => {
  const navigate = useNavigate();
  const { tasks, showToast } = useApp();

  const [people, setPeople] = useState([
    {
      id: 'p-1',
      name: 'Dr. Aris Thorne',
      email: 'thorne@university.edu',
      phone: '+1 555-0192',
      company: 'Tech Institute',
      role: 'Research Advisor',
      category: 'Mentor',
      notes: 'Advising on database RLS and multi-agent system architecture.',
      lastInteraction: 'Aug 24, 2026',
      nextFollowup: 'Sept 02, 2026',
      importantDate: 'Sept 15, 2026',
      importantDateLabel: 'Birthday'
    },
    {
      id: 'p-2',
      name: 'Alex Rivera',
      email: 'alex@techcorp.io',
      phone: '+1 555-0144',
      company: 'TechCorp',
      role: 'Senior Engineer',
      category: 'Teammate',
      notes: 'Coordinating backend endpoint deployment and security testing.',
      lastInteraction: 'Aug 22, 2026',
      nextFollowup: 'Sept 05, 2026',
      importantDate: 'Oct 01, 2026',
      importantDateLabel: 'Project Anniversary'
    }
  ]);

  const [interactions, setInteractions] = useState([
    {
      id: 'int-1',
      personId: 'p-1',
      date: '2026-08-24',
      type: 'Meeting',
      summary: 'Discussed project architecture and RLS policies.',
      duration: 30
    }
  ]);

  const [overview, setOverview] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftResult, setDraftResult] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);

  // Form Fields
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Mentor');
  const [notesInput, setNotesInput] = useState('');

  // Drafter Fields
  const [draftPersonName, setDraftPersonName] = useState('Dr. Aris Thorne');
  const [draftPurpose, setDraftPurpose] = useState('Follow up on project milestone');
  const [draftTone, setDraftTone] = useState('Professional');

  const fetchOverview = async () => {
    try {
      const res = await getPeopleOverviewAi(people, interactions, tasks);
      setOverview(res);
    } catch (e) {
      showToast('Error loading CRM overview.', 'error');
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [people, interactions, tasks]);

  const handleAddPerson = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      showToast('Person name is required.', 'warning');
      return;
    }

    const newPerson = {
      id: `p-${Date.now()}`,
      name: nameInput,
      email: emailInput,
      company: companyInput,
      role: roleInput,
      category: categoryInput,
      notes: notesInput,
      lastInteraction: new Date().toISOString().split('T')[0],
      nextFollowup: 'Sept 05, 2026'
    };

    setPeople(prev => [...prev, newPerson]);
    showToast(`Contact "${nameInput}" added!`, 'success');
    setNameInput('');
    setEmailInput('');
    setShowAddModal(false);
  };

  const handleGenerateDraft = async () => {
    try {
      const res = await generateAiMessageDraftClient(draftPersonName, draftPurpose, draftTone);
      if (res.draft) {
        setDraftResult(res.draft);
      }
    } catch (e) {
      showToast('Error generating message draft.', 'error');
    }
  };

  const handleCopyDraft = () => {
    if (draftResult?.body) {
      navigator.clipboard.writeText(draftResult.body);
      showToast('Draft copied to clipboard!', 'success');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Communication & Personal CRM"
        subtitle="Manage people, relationship context, interaction logs, follow-up reminders, and AI message drafting."
        action={
          <div className="flex items-center gap-2">
            <Button variant="ai" size="sm" onClick={() => setShowDraftModal(true)} icon={Sparkles}>
              AI Message Drafter
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)} icon={UserPlus}>
              Add Contact
            </Button>
          </div>
        }
      />

      {/* PRIVACY CALLOUT */}
      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Personal relationship CRM. Messages and emails are NEVER sent automatically.</span>
        </div>
      </div>

      {/* METRICS DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-panel p-4 flex items-center justify-between border-indigo-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">TOTAL CONTACTS</span>
            <span className="text-2xl font-black text-indigo-400 font-mono">
              {overview?.totalPeople || 2}
            </span>
          </div>
          <Users className="w-6 h-6 text-indigo-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-amber-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">FOLLOW-UPS DUE</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {overview?.followupsDue || 1}
            </span>
          </div>
          <Clock className="w-6 h-6 text-amber-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-cyan-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">UPCOMING DATES</span>
            <span className="text-2xl font-black text-cyan-400 font-mono">
              {overview?.upcomingDatesCount || 2}
            </span>
          </div>
          <CalendarIcon className="w-6 h-6 text-cyan-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-emerald-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">LOGGED INTERACTIONS</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {overview?.recentInteractionsCount || 4}
            </span>
          </div>
          <MessageSquare className="w-6 h-6 text-emerald-400 opacity-60" />
        </div>
      </div>

      {/* CONTACTS LIST */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">RECENT CONTACTS</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {people.map((p) => (
            <div key={p.id} className="card-panel p-5 space-y-4 border-zinc-800 hover:border-indigo-500/40 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-zinc-100">{p.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{p.role} • {p.company}</p>
                </div>
              </div>

              {p.notes && (
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">NOTES & CONTEXT</span>
                  {p.notes}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">LAST INTERACTION</span>
                  <span className="text-zinc-200">{p.lastInteraction}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">IMPORTANT DATE</span>
                  <span className="text-cyan-400">{p.importantDate} ({p.importantDateLabel})</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                <Button variant="outline" size="xs" onClick={() => { setDraftPersonName(p.name); setShowDraftModal(true); }} icon={Sparkles}>
                  Draft Message
                </Button>
                <Button variant="ghost" size="xs" onClick={() => setSelectedPerson(p)}>
                  View Profile
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD CONTACT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                Add Contact to Network
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPerson} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Dr. Aris Thorne"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Category</label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                  >
                    <option value="Friend">Friend</option>
                    <option value="Family">Family</option>
                    <option value="College">College</option>
                    <option value="Work">Work</option>
                    <option value="Client">Client</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Teammate">Teammate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Company</label>
                  <input
                    type="text"
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    placeholder="TechCorp"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Role</label>
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    placeholder="Research Advisor"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Notes & Context</label>
                <textarea
                  rows={2}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Key details, meeting notes, or relationship context..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Save Contact</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI MESSAGE DRAFTER MODAL */}
      {showDraftModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-lg w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                AI Message & Email Drafter
              </h3>
              <button onClick={() => setShowDraftModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Contact Name</label>
                <input
                  type="text"
                  value={draftPersonName}
                  onChange={(e) => setDraftPersonName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Purpose of Message</label>
                <input
                  type="text"
                  value={draftPurpose}
                  onChange={(e) => setDraftPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Tone</label>
                <select
                  value={draftTone}
                  onChange={(e) => setDraftTone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                >
                  <option value="Professional">Professional</option>
                  <option value="Friendly">Friendly</option>
                  <option value="Short">Short</option>
                  <option value="Formal">Formal</option>
                </select>
              </div>

              <Button variant="ai" size="sm" onClick={handleGenerateDraft} className="w-full">
                Generate Draft
              </Button>

              {draftResult && (
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-indigo-500/30 space-y-2">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="font-bold text-zinc-200">Subject: {draftResult.subject}</span>
                    <Button variant="ghost" size="xs" onClick={handleCopyDraft} icon={Copy}>
                      Copy Draft
                    </Button>
                  </div>
                  <p className="whitespace-pre-line text-zinc-300 font-sans">{draftResult.body}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setShowDraftModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
