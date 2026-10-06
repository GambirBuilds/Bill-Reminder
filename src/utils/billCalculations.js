import {
  getDaysDifference,
  isThisWeek,
  isThisMonth,
  formatCurrency,
  formatDate,
} from './dateUtils';

export function getBillStatus(bill) {
  if (bill.isPaid) {
    return {
      status: 'paid',
      label: 'Paid',
      symbol: '🟢',
      color: 'emerald',
      textClass: 'text-emerald-500 dark:text-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60',
      dotClass: 'bg-emerald-500',
    };
  }

  const diff = getDaysDifference(bill.dueDate);

  if (diff < 0) {
    const daysOverdue = Math.abs(diff);
    return {
      status: 'overdue',
      label: 'Overdue',
      detailLabel: `Overdue by ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'}`,
      symbol: '🔴',
      color: 'rose',
      daysOverdue,
      textClass: 'text-rose-600 dark:text-rose-400',
      bgClass: 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60',
      dotClass: 'bg-rose-500',
    };
  }

  if (diff === 0) {
    return {
      status: 'due_today',
      label: 'Due Today',
      detailLabel: 'Due today',
      symbol: '🟡',
      color: 'amber',
      textClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60',
      dotClass: 'bg-amber-500',
    };
  }

  if (diff <= 3) {
    return {
      status: 'due_soon',
      label: 'Due Soon',
      detailLabel: `Due in ${diff} ${diff === 1 ? 'day' : 'days'}`,
      symbol: '🟡',
      color: 'amber',
      textClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60',
      dotClass: 'bg-amber-400',
    };
  }

  return {
    status: 'upcoming',
    label: 'Upcoming',
    detailLabel: `Due in ${diff} days`,
    symbol: '🔵',
    color: 'blue',
    textClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60',
    dotClass: 'bg-blue-500',
  };
}

export function calculateDashboardMetrics(bills = [], paymentHistory = [], monthlyBudget = 30000) {
  const unpaidBills = bills.filter((b) => !b.isPaid);

  const totalDue = unpaidBills.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

  const dueThisWeek = unpaidBills
    .filter((b) => isThisWeek(b.dueDate))
    .reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

  const overdueBills = unpaidBills.filter((b) => getDaysDifference(b.dueDate) < 0);
  const overdueTotal = overdueBills.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

  // Paid this month from history records dated this month
  const currentMonthPaidHistory = paymentHistory.filter((h) => isThisMonth(h.paidDate));
  const paidThisMonth = currentMonthPaidHistory.reduce(
    (acc, h) => acc + (Number(h.amount) || 0),
    0
  );

  // Subscriptions
  const subscriptions = bills.filter(
    (b) => b.isSubscription || b.category === 'Subscription'
  );
  const activeSubscriptionsCount = subscriptions.length;
  const monthlySubscriptionCost = subscriptions.reduce(
    (acc, b) => acc + (Number(b.amount) || 0),
    0
  );
  const yearlySubscriptionProjection = monthlySubscriptionCost * 12;

  // Next payment (closest due unpaid bill)
  const sortedUpcoming = [...unpaidBills].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  const nextPayment = sortedUpcoming.length > 0 ? sortedUpcoming[0] : null;

  // Highest bill
  const sortedByAmount = [...unpaidBills].sort(
    (a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0)
  );
  const highestBill = sortedByAmount.length > 0 ? sortedByAmount[0] : null;

  // Budget calculations
  const remainingBudget = monthlyBudget - totalDue;
  const budgetUsedPercentage =
    monthlyBudget > 0 ? Math.round((totalDue / monthlyBudget) * 100) : 0;

  return {
    totalDue,
    dueThisWeek,
    overdueTotal,
    overdueCount: overdueBills.length,
    overdueBills,
    paidThisMonth,
    activeSubscriptionsCount,
    monthlySubscriptionCost,
    yearlySubscriptionProjection,
    subscriptions,
    nextPayment,
    highestBill,
    monthlyBudget,
    remainingBudget,
    budgetUsedPercentage,
    unpaidCount: unpaidBills.length,
    totalBillsCount: bills.length,
  };
}

export function generateSmartInsights(bills = [], paymentHistory = [], monthlyBudget = 30000) {
  const insights = [];
  const metrics = calculateDashboardMetrics(bills, paymentHistory, monthlyBudget);

  // 1. Overdue bills warning
  if (metrics.overdueCount > 0) {
    const plural = metrics.overdueCount === 1 ? 'bill' : 'bills';
    insights.push({
      id: 'insight-overdue',
      type: 'danger',
      title: `${metrics.overdueCount} Overdue ${plural}`,
      description: `You have ${metrics.overdueCount} overdue ${plural} totaling ${formatCurrency(
        metrics.overdueTotal
      )}. Clear these to avoid service disruption or late penalties.`,
      actionRoute: '/overdue',
      actionLabel: 'View Overdue',
    });
  }

  // 2. Spending comparison for Electricity or Utilities
  const currentElectric = bills.find((b) => b.category === 'Electricity');
  const pastElectric = paymentHistory.find((h) => h.category === 'Electricity');
  if (currentElectric && pastElectric && pastElectric.amount > 0) {
    const diffPercent = Math.round(
      ((currentElectric.amount - pastElectric.amount) / pastElectric.amount) * 100
    );
    if (diffPercent > 0) {
      insights.push({
        id: 'insight-electricity',
        type: 'warning',
        title: 'Electricity bill increased',
        description: `Your electricity bill increased by ${diffPercent}% compared with last month (${formatCurrency(
          currentElectric.amount
        )} vs ${formatCurrency(pastElectric.amount)}).`,
      });
    }
  }

  // 3. Subscription commitment insight
  if (metrics.activeSubscriptionsCount > 0) {
    insights.push({
      id: 'insight-subs',
      type: 'info',
      title: 'Subscription spend',
      description: `You have ${metrics.activeSubscriptionsCount} active subscriptions costing ${formatCurrency(
        metrics.monthlySubscriptionCost
      )}/month (${formatCurrency(metrics.yearlySubscriptionProjection)} projected annually).`,
      actionRoute: '/subscriptions',
      actionLabel: 'Manage Subscriptions',
    });
  }

  // 4. Inactive subscription warning
  const unusedSubs = bills.filter((b) => {
    if (!b.isSubscription && b.category !== 'Subscription') return false;
    if (!b.lastUsedDate) return false;
    const diff = Math.abs(getDaysDifference(b.lastUsedDate));
    return diff > 30; // Not used in over 30 days
  });

  if (unusedSubs.length > 0) {
    const sub = unusedSubs[0];
    insights.push({
      id: 'insight-unused-sub',
      type: 'warning',
      title: `Unused subscription: ${sub.name}`,
      description: `Self-reported activity shows this hasn't been used since ${formatDate(
        sub.lastUsedDate,
        'short'
      )}. Canceling could save ${formatCurrency(sub.amount)}/month.`,
      actionRoute: '/subscriptions',
      actionLabel: 'Review',
    });
  }

  // 5. Highest recurring expense
  const recurringBills = bills.filter((b) => b.isRecurring && !b.isPaid);
  if (recurringBills.length > 0) {
    const sortedRecurring = [...recurringBills].sort(
      (a, b) => Number(b.amount) - Number(a.amount)
    );
    const highest = sortedRecurring[0];
    insights.push({
      id: 'insight-highest-recurring',
      type: 'neutral',
      title: 'Top recurring commitment',
      description: `Your highest recurring commitment is ${highest.name} at ${formatCurrency(
        highest.amount
      )}/${highest.frequency || 'month'}.`,
    });
  }

  // 6. Budget utilization warning
  if (metrics.budgetUsedPercentage >= 80) {
    insights.push({
      id: 'insight-budget',
      type: metrics.budgetUsedPercentage > 100 ? 'danger' : 'warning',
      title:
        metrics.budgetUsedPercentage > 100
          ? 'Budget exceeded'
          : 'Budget alert (over 80%)',
      description: `Committed bills represent ${metrics.budgetUsedPercentage}% of your monthly ${formatCurrency(
        monthlyBudget
      )} budget. Remaining buffer is ${formatCurrency(
        Math.max(0, metrics.remainingBudget)
      )}.`,
      actionRoute: '/settings',
      actionLabel: 'Adjust Budget',
    });
  }

  return insights;
}
