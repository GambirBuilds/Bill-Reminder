import React from 'react';
import { AlertTriangle, CheckCircle2, Calendar, ShieldCheck, PlusCircle } from 'lucide-react';
import { useBills } from '../context/BillContext';
import { formatCurrency, formatDate, getDaysDifference } from '../utils/dateUtils';

export default function OverdueBills() {
  const { bills, openPayModal, openEditModal } = useBills();

  const overdueList = bills
    .filter((b) => !b.isPaid && getDaysDifference(b.dueDate) < 0)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const totalOverdue = overdueList.reduce(
    (acc, b) => acc + (Number(b.amount) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </span>
            Overdue Bills
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Past-due accounts requiring immediate settlement to maintain services without penalty.
          </p>
        </div>

        <div className="text-right self-start sm:self-auto">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Total Delinquent</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
            {formatCurrency(totalOverdue)}
          </div>
        </div>
      </div>

      {/* List of Overdue Items */}
      {overdueList.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141A21]">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Zero Overdue Bills
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            All your bill obligations are current and in good standing. Great job!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {overdueList.map((bill) => {
            const daysOverdue = Math.abs(getDaysDifference(bill.dueDate));
            return (
              <div
                key={bill.id}
                className="p-5 rounded-xl bg-white dark:bg-[#141A21] border border-rose-200 dark:border-rose-900/60 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5" /> Overdue by {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {bill.category}
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-slate-100">
                    {bill.name}
                  </h3>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block">Original Due Date</span>
                      <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                        {formatDate(bill.dueDate, 'long')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Amount</span>
                      <span className="text-lg font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
                        {formatCurrency(bill.amount)}
                      </span>
                    </div>
                  </div>

                  {bill.notes && (
                    <p className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B0F14] text-xs text-slate-600 dark:text-slate-400 italic">
                      "{bill.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    Method: {bill.paymentMethod || 'Cash'}
                  </span>

                  <button
                    onClick={() => openPayModal(bill)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark as Paid
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
