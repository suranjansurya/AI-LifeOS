/**
 * AI LifeOS — Personal Finance Intelligence Engine 2.0
 * Financial balance aggregation, category budget progress, spending insights,
 * What-If scenario simulations, and AI monthly finance report generator.
 */

export function calculateFinanceOverview(transactions = [], budgets = [], accounts = []) {
  if (!transactions || transactions.length === 0) {
    const totalBalance = accounts.reduce((acc, a) => acc + Number(a.current_balance || a.opening_balance || 0), 0);
    return {
      success: true,
      hasData: accounts.length > 0,
      currency: 'INR',
      totalBalance,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      netCashFlow: 0,
      remainingBudget: budgets.reduce((acc, b) => acc + Number(b.amount || 0), 0),
      budgetHealth: 'HEALTHY',
      categorySpending: [],
      budgetProgress: budgets.map(b => ({
        id: b.id,
        category: b.category,
        budgeted: Number(b.amount || 0),
        used: 0,
        remaining: Number(b.amount || 0),
        percent: 0,
        status: 'HEALTHY'
      }))
    };
  }

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  const catTotals = {};

  transactions.forEach(t => {
    const amt = Number(t.amount || 0);
    const dateStr = t.transaction_date || t.created_at || '';

    if (t.type === 'Income') {
      if (dateStr.startsWith(currentMonth)) monthlyIncome += amt;
    } else if (t.type === 'Expense') {
      if (dateStr.startsWith(currentMonth)) monthlyExpenses += amt;
      const cat = t.category || 'Other';
      catTotals[cat] = (catTotals[cat] || 0) + amt;
    }
  });

  const totalBalance = accounts.reduce((acc, a) => acc + Number(a.current_balance || a.opening_balance || 0), 0);
  const netCashFlow = monthlyIncome - monthlyExpenses;

  // Calculate Budget Progress
  let totalBudgeted = 0;
  let totalUsed = 0;
  let hasExceeded = false;
  let hasWarning = false;

  const budgetProgress = budgets.map(b => {
    const budgeted = Number(b.amount || 0);
    const used = catTotals[b.category] || 0;
    const remaining = budgeted - used;
    const percent = budgeted > 0 ? Math.round((used / budgeted) * 100) : 0;

    let status = 'HEALTHY';
    if (percent >= 100) {
      status = 'EXCEEDED';
      hasExceeded = true;
    } else if (percent >= 80) {
      status = 'WARNING';
      hasWarning = true;
    }

    totalBudgeted += budgeted;
    totalUsed += used;

    return {
      id: b.id,
      category: b.category,
      budgeted,
      used,
      remaining: Math.max(0, remaining),
      percent,
      status
    };
  });

  const remainingBudget = Math.max(0, totalBudgeted - totalUsed);
  const budgetHealth = hasExceeded ? 'EXCEEDED' : hasWarning ? 'WARNING' : 'HEALTHY';

  const categorySpending = Object.entries(catTotals).map(([category, amount]) => ({
    category,
    amount,
    percent: monthlyExpenses > 0 ? Math.round((amount / monthlyExpenses) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);

  return {
    success: true,
    hasData: true,
    currency: 'INR',
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    netCashFlow,
    remainingBudget,
    budgetHealth,
    categorySpending,
    budgetProgress
  };
}

export function generateFinanceInsights(transactions = [], budgets = []) {
  if (!transactions || transactions.length < 2) {
    return {
      success: true,
      hasData: false,
      insights: [
        {
          type: 'info',
          title: 'Financial Profile Building',
          message: 'Not enough financial history for a reliable insight. Record your income and expenses to unlock AI budget intelligence.',
          citation: 'Finance Engine'
        }
      ]
    };
  }

  const overview = calculateFinanceOverview(transactions, budgets);
  const insights = [];

  if (overview.netCashFlow > 0) {
    insights.push({
      type: 'positive',
      title: '📈 Positive Net Cash Flow',
      message: `You have saved ₹${overview.netCashFlow.toLocaleString()} this month after expenses.`,
      citation: 'Based on recorded income & transactions'
    });
  }

  if (overview.categorySpending.length > 0) {
    const topCat = overview.categorySpending[0];
    insights.push({
      type: 'spending',
      title: `🛍 Largest Expense Category: ${topCat.category}`,
      message: `${topCat.category} represents ${topCat.percent}% of your total monthly spending (₹${topCat.amount.toLocaleString()}).`,
      citation: `Transaction Log (${topCat.category})`
    });
  }

  overview.budgetProgress.forEach(bp => {
    if (bp.status === 'EXCEEDED') {
      insights.push({
        type: 'warning',
        title: `⚠️ Budget Exceeded: ${bp.category}`,
        message: `You have spent ₹${bp.used.toLocaleString()} of your ₹${bp.budgeted.toLocaleString()} ${bp.category} budget (${bp.percent}%).`,
        citation: `Budget Alert (${bp.category})`
      });
    }
  });

  return {
    success: true,
    hasData: true,
    insights
  };
}

export function generateWhatIfScenario(savingsTarget = 2000, categoryReduction = 'Food', reductionAmount = 1000) {
  const sav = Number(savingsTarget) || 2000;
  const red = Number(reductionAmount) || 1000;
  const yearlySavings = sav * 12 + red * 12;

  return {
    success: true,
    isSimulation: true,
    scenario: {
      savingsTarget: sav,
      categoryReduction,
      reductionAmount: red,
      projectedMonthlySavings: sav + red,
      projectedYearlySavings: yearlySavings,
      note: 'Mathematical simulation based on proposed savings targets. Real account balances remain unchanged.'
    }
  };
}

export function generateAiBudgetProposal(monthlyIncome = 50000) {
  const inc = Number(monthlyIncome) || 50000;
  return {
    success: true,
    requiresApproval: true,
    proposedBudget: {
      income: inc,
      currency: 'INR',
      categories: [
        { category: 'Food', amount: Math.round(inc * 0.25), percent: '25%' },
        { category: 'Transport', amount: Math.round(inc * 0.12), percent: '12%' },
        { category: 'Education', amount: Math.round(inc * 0.15), percent: '15%' },
        { category: 'Bills', amount: Math.round(inc * 0.18), percent: '18%' },
        { category: 'Entertainment', amount: Math.round(inc * 0.10), percent: '10%' },
        { category: 'Savings', amount: Math.round(inc * 0.20), percent: '20%' }
      ]
    }
  };
}
