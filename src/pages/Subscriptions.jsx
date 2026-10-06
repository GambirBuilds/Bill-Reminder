import React from 'react';
import {
  Repeat,
  PlusCircle,
  AlertCircle,
  Sparkles,
  Calendar,
  CheckCircle2,
  Trash2,
  CreditCard,
  Tv,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import BillCard from '../components/BillCard';
import EmptyState from '../components/EmptyState';
import { useBills } from '../context/BillContext';
import { formatCurrency, formatDate, getDaysDifference } from '../utils/dateUtils';

export default function Subscriptions() {
  const { bills, openAddModal, openPayModal } = useBills();

  const subscriptions = bills.filter(
    (b) => b.isSubscription || b.category === 'Subscription'
  );

  const monthlyCost = subscriptions.reduce(
    (acc, b) => acc + (Number(b.amount) || 0),
    0
  );
  const yearlyProjection = monthlyCost * 12;

  // Unused subscription warnings (based on user-provided lastUsedDate > 30 days)
  const unusedSubscriptions = subscriptions.filter((b) => {
    if (!b.lastUsedDate) return false;
    const diff = Math.abs(getDaysDifference(b.lastUsedDate));
    return diff > 30;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Repeat className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Subscription Tracker
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor streaming, SaaS tools, cloud storage, memberships, and annual run-rates.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add Subscription
        </button>
      </div>

      {/* Primary Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Subscriptions"
          value={subscriptions.length}
          subtext="Recurring digital & membership plans"
          icon={Tv}
          variant="primary"
        />
        <StatCard
          title="Monthly Recurring Cost"
          value={formatCurrency(monthlyCost)}
          subtext="Billed monthly"
          icon={CreditCard}
          variant="default"
        />
        <StatCard
          title="Yearly Projection"
          value={formatCurrency(yearlyProjection)}
          subtext="12-month projected burn"
          icon={Repeat}
          variant="warning"
        />
      </div>

      {/* Unused Subscriptions Alert Box */}
      {unusedSubscriptions.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Low Usage Warning (Self-Reported)
            </h4>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Based on your logged usage dates, the following subscriptions haven't been used in over 30 days. You could save up to{' '}
            <strong className="font-mono">
              {formatCurrency(
                unusedSubscriptions.reduce((acc, s) => acc + (Number(s.amount) || 0), 0)
              )}
              /month
            </strong>{' '}
            by canceling or pausing them:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {unusedSubscriptions.map((sub) => (
              <div
                key={sub.id}
                className="p-3 rounded-lg bg-white dark:bg-[#141A21] border border-amber-200 dark:border-amber-800/80 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {sub.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Last used: {formatDate(sub.lastUsedDate, 'short')}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(sub.amount)}/mo
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription Cards Grid */}
      {subscriptions.length === 0 ? (
        <EmptyState
          title="No active subscriptions"
          description="Add your Netflix, Spotify, gym or software memberships to keep track of monthly costs."
          actionText="Add Subscription"
          onAction={openAddModal}
          icon={Tv}
        />
      ) : (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
            All Tracked Subscriptions ({subscriptions.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map((sub) => (
              <BillCard key={sub.id} bill={sub} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
