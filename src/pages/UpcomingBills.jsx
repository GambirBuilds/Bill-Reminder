import React, { useState, useMemo } from 'react';
import { Clock, Calendar, CheckCircle2, AlertTriangle, PlusCircle } from 'lucide-react';
import BillCard from '../components/BillCard';
import EmptyState from '../components/EmptyState';
import { useBills } from '../context/BillContext';
import {
  getDaysDifference,
  isToday,
  isThisWeek,
  isThisMonth,
  isNextMonth,
  formatCurrency,
  formatDate,
} from '../utils/dateUtils';

export default function UpcomingBills() {
  const { bills, openAddModal } = useBills();
  const [filter, setFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month' | 'next_month'

  const upcomingList = useMemo(() => {
    // Only unpaid bills whose due date is today or in future (or includes due today)
    const unpaid = bills.filter((b) => !b.isPaid && getDaysDifference(b.dueDate) >= 0);

    return unpaid
      .filter((bill) => {
        if (filter === 'today') return isToday(bill.dueDate);
        if (filter === 'week') return isThisWeek(bill.dueDate);
        if (filter === 'month') return isThisMonth(bill.dueDate);
        if (filter === 'next_month') return isNextMonth(bill.dueDate);
        return true;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [bills, filter]);

  const totalUpcoming = upcomingList.reduce(
    (acc, b) => acc + (Number(b.amount) || 0),
    0
  );

  const filters = [
    { id: 'all', label: 'All Upcoming' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'next_month', label: 'Next Month' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Upcoming Payments
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Sequential payment timeline ordered by nearest due date.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add Bill
        </button>
      </div>

      {/* Filter Tabs & Summary */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                filter === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-4 shrink-0">
          <span>
            Count: <strong className="font-mono text-slate-900 dark:text-slate-200">{upcomingList.length}</strong>
          </span>
          <span>
            Total: <strong className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">{formatCurrency(totalUpcoming)}</strong>
          </span>
        </div>
      </div>

      {/* Bills Feed */}
      {upcomingList.length === 0 ? (
        <EmptyState
          title="No upcoming bills found"
          description="You have no bills scheduled for this timeframe."
          actionText="Add a Bill"
          onAction={openAddModal}
          icon={Clock}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingList.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </div>
      )}
    </div>
  );
}
