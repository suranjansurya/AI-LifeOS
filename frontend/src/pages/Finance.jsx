import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { getFinanceOverviewAi, generateAiBudgetProposalClient, generateWhatIfScenarioClient } from '../services/aiService';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Sparkles,
  CreditCard,
  Building,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Calculator,
  Calendar,
  Layers
} from 'lucide-react';

export const Finance = () => {
  const { showToast } = useApp();

  // State Management
  const [accounts, setAccounts] = useState([
    { id: 'acc-1', name: 'Primary Bank Account', account_type: 'Bank Account', current_balance: 45000, currency: 'INR' },
    { id: 'acc-2', name: 'Cash Wallet', account_type: 'Cash', current_balance: 5000, currency: 'INR' }
  ]);

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([
    { id: 'b-1', category: 'Food', amount: 6000 },
    { id: 'b-2', category: 'Transport', amount: 3000 },
    { id: 'b-3', category: 'Entertainment', amount: 2000 }
  ]);

  const [subscriptions, setSubscriptions] = useState([
    { id: 'sub-1', name: 'Spotify Premium', amount: 119, billing_cycle: 'Monthly', category: 'Subscriptions', nextBilling: 'Sept 05' },
    { id: 'sub-2', name: 'Cloud Hosting', amount: 499, billing_cycle: 'Monthly', category: 'Subscriptions', nextBilling: 'Sept 12' }
  ]);

  const [savingsGoals, setSavingsGoals] = useState([
    { id: 'sg-1', name: 'Laptop Fund', targetAmount: 60000, currentAmount: 30000, targetDate: 'Dec 2026' }
  ]);

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'transactions' | 'budgets' | 'subscriptions' | 'whatif'

  // Modals
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAiProposalModal, setShowAiProposalModal] = useState(false);
  const [showWhatIfModal, setShowWhatIfModal] = useState(false);
  const [aiProposal, setAiProposal] = useState(null);
  const [whatIfResult, setWhatIfResult] = useState(null);

  // Form Fields
  const [txType, setTxType] = useState('Expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('Food');
  const [txDescription, setTxDescription] = useState('');
  const [txAccount, setTxAccount] = useState(accounts[0]?.id || 'acc-1');

  // What-If Form Fields
  const [whatIfTarget, setWhatIfTarget] = useState(2000);
  const [whatIfCategory, setWhatIfCategory] = useState('Food');
  const [whatIfReduction, setWhatIfReduction] = useState(1000);

  const categories = ['Food', 'Transport', 'Education', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Travel', 'Subscriptions', 'Other'];

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await getFinanceOverviewAi(transactions, budgets, accounts);
      setOverview(res);
    } catch (err) {
      showToast('Error loading financial overview.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [transactions, budgets, accounts]);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid transaction amount > 0.', 'error');
      return;
    }

    const newTx = {
      id: `tx-${Date.now()}`,
      account_id: txAccount,
      type: txType,
      amount: amt,
      category: txCategory,
      description: txDescription || `${txType} transaction`,
      transaction_date: new Date().toISOString().split('T')[0],
      currency: 'INR'
    };

    setTransactions(prev => [newTx, ...prev]);

    setAccounts(prev => prev.map(a => {
      if (a.id === txAccount) {
        const delta = txType === 'Income' ? amt : -amt;
        return { ...a, current_balance: a.current_balance + delta };
      }
      return a;
    }));

    showToast(`Transaction of ₹${amt.toLocaleString()} recorded!`, 'success');
    setShowTransactionModal(false);
    setTxAmount('');
    setTxDescription('');
  };

  const handleGenerateAiProposal = async () => {
    try {
      const res = await generateAiBudgetProposalClient(50000);
      if (res.proposedBudget) {
        setAiProposal(res.proposedBudget);
        setShowAiProposalModal(true);
      }
    } catch (e) {
      showToast('Error generating AI budget proposal.', 'error');
    }
  };

  const handleRunWhatIfSimulation = async () => {
    try {
      const res = await generateWhatIfScenarioClient(whatIfTarget, whatIfCategory, whatIfReduction);
      if (res.scenario) {
        setWhatIfResult(res.scenario);
        setShowWhatIfModal(true);
      }
    } catch (e) {
      showToast('Error running What-If simulation.', 'error');
    }
  };

  const handleApplyAiBudget = () => {
    if (!aiProposal) return;
    const newBudgets = aiProposal.categories.map((c, idx) => ({
      id: `b-ai-${idx}-${Date.now()}`,
      category: c.category,
      amount: c.amount
    }));
    setBudgets(newBudgets);
    showToast('AI Budget Proposal applied!', 'success');
    setShowAiProposalModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="AI Personal Finance & Wealth Intelligence 2.0"
        subtitle="Track income, expenses, budgets, recurring subscriptions, savings goals, and what-if mathematical simulations."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRunWhatIfSimulation} icon={Calculator}>
              What-If Planner
            </Button>
            <Button variant="ai" size="sm" onClick={handleGenerateAiProposal} icon={Sparkles}>
              AI Budget Assistant
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowTransactionModal(true)} icon={Plus}>
              Add Transaction
            </Button>
          </div>
        }
      />

      {/* PRIVACY & EDUCATIONAL DISCLAIMER */}
      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Educational disclaimer: Personal finance organization system based solely on user-recorded inputs. No automatic money transfers or investment advice.</span>
        </div>
      </div>

      {/* METRICS DASHBOARD CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-panel p-4 flex items-center justify-between border-indigo-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">TOTAL BALANCE</span>
            <span className="text-2xl font-black text-indigo-400 font-mono">
              ₹{(overview?.totalBalance || 50000).toLocaleString()}
            </span>
          </div>
          <Wallet className="w-6 h-6 text-indigo-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-emerald-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">MONTHLY INCOME</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              ₹{(overview?.monthlyIncome || 0).toLocaleString()}
            </span>
          </div>
          <TrendingUp className="w-6 h-6 text-emerald-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-rose-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">MONTHLY EXPENSES</span>
            <span className="text-2xl font-black text-rose-400 font-mono">
              ₹{(overview?.monthlyExpenses || 0).toLocaleString()}
            </span>
          </div>
          <TrendingDown className="w-6 h-6 text-rose-400 opacity-60" />
        </div>

        <div className="card-panel p-4 flex items-center justify-between border-purple-500/30">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">REMAINING BUDGET</span>
            <span className="text-2xl font-black text-purple-400 font-mono">
              ₹{(overview?.remainingBudget || 11000).toLocaleString()}
            </span>
          </div>
          <PieChart className="w-6 h-6 text-purple-400 opacity-60" />
        </div>
      </div>

      {/* SAVINGS GOAL SECTION */}
      <div className="card-panel p-5 space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          SAVINGS GOALS & FUNDS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savingsGoals.map((sg) => {
            const pct = Math.round((sg.currentAmount / sg.targetAmount) * 100);
            return (
              <div key={sg.id} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-100">{sg.name}</span>
                  <span className="font-mono text-emerald-400 font-bold">{pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>₹{sg.currentAmount.toLocaleString()} / ₹{sg.targetAmount.toLocaleString()}</span>
                  <span>Target: {sg.targetDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN CARDS / TABS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Budget Progress' },
            { id: 'transactions', label: `Transactions (${transactions.length})` },
            { id: 'subscriptions', label: `Subscriptions (${subscriptions.length})` }
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

        {/* BUDGET PROGRESS */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              Category Budget Health & Progress
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(overview?.budgetProgress || []).map(b => (
                <div key={b.id} className="card-panel p-4 space-y-3 border-zinc-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-100">{b.category}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
                      b.status === 'EXCEEDED' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                      b.status === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        b.status === 'EXCEEDED' ? 'bg-rose-500' : b.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, b.percent)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-zinc-400 font-mono">
                    <span>₹{b.used.toLocaleString()} / ₹{b.budgeted.toLocaleString()}</span>
                    <span>{b.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBSCRIPTIONS */}
        {activeTab === 'subscriptions' && (
          <div className="card-panel p-5 space-y-3">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              Recurring Subscriptions & Fixed Expenses
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map(sub => (
                <div key={sub.id} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-zinc-100 block">{sub.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Next Billing: {sub.nextBilling} • {sub.billing_cycle}</span>
                  </div>
                  <span className="font-mono font-bold text-purple-300">₹{sub.amount}/mo</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ADD TRANSACTION MODAL */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-lg w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-400" />
                Record Transaction
              </h3>
              <button onClick={() => setShowTransactionModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3 text-xs">
              <div className="flex gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
                {['Expense', 'Income'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTxType(type)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      txType === type ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Amount (INR ₹)</label>
                <input
                  type="number"
                  step="any"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="e.g. 450"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Category</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Description</label>
                <input
                  type="text"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  placeholder="e.g. Grocery store purchase"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowTransactionModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Save Transaction</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WHAT-IF SIMULATION MODAL */}
      {showWhatIfModal && whatIfResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-400" />
                What-If Financial Simulation
              </h3>
              <button onClick={() => setShowWhatIfModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
                <span className="text-[10px] text-indigo-400 font-bold uppercase block">PROJECTED MONTHLY SAVINGS</span>
                <span className="text-2xl font-bold font-mono text-indigo-200">
                  +₹{whatIfResult.projectedMonthlySavings.toLocaleString()} / month
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">PROJECTED 12-MONTH IMPACT</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  +₹{whatIfResult.projectedYearlySavings.toLocaleString()} / year
                </span>
              </div>

              <p className="text-zinc-400 text-[11px] italic">{whatIfResult.note}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setShowWhatIfModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
