import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Repeat,
  Sparkles,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import BillCard from '../components/BillCard';
import EmptyState from '../components/EmptyState';
import { useBills } from '../context/BillContext';
import { formatCurrency, formatDate, getDaysDifference } from '../utils/dateUtils';
import {
  calculateDashboardMetrics,
  generateSmartInsights,
} from '../utils/billCalculations';

export default function Dashboard() {
  const { bills, paymentHistory, settings, openAddModal, openPayModal } = useBills();

  const metrics = calculateDashboardMetrics(bills, paymentHistory, settings.budget);
  const insights = generateSmartInsights(bills, paymentHistory, settings.budget);

  // Filter sorted upcoming bills (unpaid, nearest due date)
  const upcomingBills = [...bills]
    .filter((b) => !b.isPaid)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Overdue bills
  const overdueBills = bills.filter(
    (b) => !b.isPaid && getDaysDifference(b.dueDate) < 0
  );

  // Recently paid history
  const recentPaid = paymentHistory.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Keep track of your obligations, recurring costs, and cash commitments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/upcoming"
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            Upcoming Feed
          </Link>
          <button
            onClick={openAddModal}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Bill
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (As specified: Total Due, Due This Week, Overdue, Paid This Month) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Due"
          value={formatCurrency(metrics.totalDue)}
          subtext={`${metrics.unpaidCount} unpaid obligations`}
          icon={Wallet}
          variant="primary"
        />
        <StatCard
          title="Due This Week"
          value={formatCurrency(metrics.dueThisWeek)}
          subtext="Next 7 calendar days"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Overdue"
          value={formatCurrency(metrics.overdueTotal)}
          subtext={
            metrics.overdueCount > 0
              ? `${metrics.overdueCount} bills need immediate attention`
              : 'Zero overdue bills'
          }
          icon={AlertTriangle}
          variant={metrics.overdueCount > 0 ? 'danger' : 'default'}
        />
        <StatCard
          title="Paid This Month"
          value={formatCurrency(metrics.paidThisMonth)}
          subtext="Cleared in current cycle"
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      {/* Overdue Warning Banner if any */}
      {metrics.overdueCount > 0 && (
        <div className="p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                You have {metrics.overdueCount} overdue bills totaling{' '}
                <span className="font-mono tabular-nums">{formatCurrency(metrics.overdueTotal)}</span>
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
                Avoid service disruption or penalties by recording payments promptly.
              </p>
            </div>
          </div>
          <Link
            to="/overdue"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300 bg-white dark:bg-rose-900/40 border border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors whitespace-nowrap self-end sm:self-center"
          >
            Review Overdue Bills
          </Link>
        </div>
      )}

      {/* Secondary Metrics & Budget Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Budget Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Monthly Budget
              </span>
              <Link
                to="/settings"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Edit
              </Link>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {formatCurrency(metrics.monthlyBudget)}
              </span>
              <span className="text-xs text-slate-500">
                Committed: {formatCurrency(metrics.totalDue)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    metrics.budgetUsedPercentage > 100
                      ? 'bg-rose-500'
                      : metrics.budgetUsedPercentage > 80
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, metrics.budgetUsedPercentage)}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Remaining: {formatCurrency(Math.max(0, metrics.remainingBudget))}</span>
                <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                  {metrics.budgetUsedPercentage}%
                </span>
              </div>
            </div>
          </div>

          {metrics.budgetUsedPercentage > 80 && (
            <p className="mt-3 text-[11px] text-amber-600 dark:text-amber-400">
              Warning: Committed bills exceed 80% of monthly ceiling.
            </p>
          )}
        </div>

        {/* Next Payment Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Next Payment
            </span>
            {metrics.nextPayment ? (
              <div className="mt-3">
                <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {metrics.nextPayment.name}
                </h4>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {formatCurrency(metrics.nextPayment.amount)}
                  </span>
                  <span className="text-xs text-slate-500">
                    Due {formatDate(metrics.nextPayment.dueDate, 'short')}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Method: {metrics.nextPayment.paymentMethod || 'Cash'}
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-slate-500">No upcoming payments scheduled</div>
            )}
          </div>

          {metrics.nextPayment && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <span className="text-xs text-blue-600 dark:text-blue-400">
                {metrics.nextPayment.category}
              </span>
              <button
                type="button"
                onClick={() => openPayModal(metrics.nextPayment)}
                className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded-md transition-colors"
              >
                Pay Now
              </button>
            </div>
          )}
        </div>

        {/* Highest Bill & Active Subscriptions */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Commitment Highlights
            </span>

            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Highest Bill:</span>
                <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                  {metrics.highestBill
                    ? `${metrics.highestBill.name} (${formatCurrency(metrics.highestBill.amount)})`
                    : 'None'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Active Subscriptions:</span>
                <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                  {metrics.activeSubscriptionsCount} ({formatCurrency(metrics.monthlySubscriptionCost)}/mo)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Yearly Subscription Cost:</span>
                <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                  {formatCurrency(metrics.yearlySubscriptionProjection)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <Link
              to="/subscriptions"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Manage subscriptions <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Smart Insights Section (Domain Authentic, calculated from real user data) */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Bill Insights & Financial Alerts
              </span>
            </div>
            <span className="text-xs text-slate-400">Calculated from stored records</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="p-4 rounded-xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">💡</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">
                      {insight.title}
                    </h4>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {insight.description}
                  </p>
                </div>

                {insight.actionRoute && (
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <Link
                      to={insight.actionRoute}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {insight.actionLabel} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Grid: Upcoming Bills & Recently Paid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Bills List (2 Columns wide) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Upcoming Bills
            </h3>
            <Link
              to="/upcoming"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View all upcoming <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingBills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {upcomingBills.map((bill) => (
                <BillCard key={bill.id} bill={bill} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="All caught up!"
              description="You have no upcoming bills due."
              actionText="Add New Bill"
              onAction={openAddModal}
            />
          )}
        </div>

        {/* Recently Paid Bills (1 Column) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Recently Paid
            </h3>
            <Link
              to="/history"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Full history <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80 space-y-3">
            {recentPaid.length > 0 ? (
              recentPaid.map((item) => (
                <div
                  key={item.id}
                  className="py-2.5 border-b last:border-b-0 border-slate-100 dark:border-slate-800/60 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {item.billName}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span>{item.category}</span>
                      <span>·</span>
                      <span>{formatDate(item.paidDate, 'short')}</span>
                      <span>·</span>
                      <span>{item.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="text-xs font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 shrink-0">
                    {formatCurrency(item.amount)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">
                No recorded payment history yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
