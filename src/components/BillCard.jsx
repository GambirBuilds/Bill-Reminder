import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Repeat,
  Edit2,
  Trash2,
  Calendar,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate, getRelativeStatusText } from '../utils/dateUtils';
import { getBillStatus } from '../utils/billCalculations';
import { useBills } from '../context/BillContext';

export default function BillCard({ bill, onEdit, onPay }) {
  const { deleteBill, unmarkBillAsPaid, openPayModal, openEditModal } = useBills();
  const statusInfo = getBillStatus(bill);
  const relativeText = getRelativeStatusText(bill.dueDate, bill.isPaid, bill.paidDate);

  const handlePayClick = () => {
    if (onPay) {
      onPay(bill);
    } else {
      openPayModal(bill);
    }
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(bill);
    } else {
      openEditModal(bill);
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete "${bill.name}"?`)) {
      deleteBill(bill.id);
    }
  };

  return (
    <div className="group relative p-5 rounded-xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
              {bill.name}
            </h3>
            {/* Unboxed clean metadata with typographic separators */}
            <div className="flex items-center flex-wrap gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{bill.category}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{bill.frequency || 'One-time'}</span>
              <span aria-hidden="true">·</span>
              <span>{bill.paymentMethod || 'Cash'}</span>
              {bill.isRecurring && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                    <Repeat className="w-3 h-3" /> Recurring
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Amount Display */}
          <div className="text-right shrink-0">
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {formatCurrency(bill.amount)}
            </div>
          </div>
        </div>

        {/* Due Date & Status Banner */}
        <div className={`mt-4 p-2.5 rounded-lg text-xs flex items-center justify-between ${statusInfo.bgClass}`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`} />
            <span className={`font-semibold ${statusInfo.textClass}`}>
              {statusInfo.label}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              — {relativeText}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">
              {bill.isPaid && bill.paidDate
                ? formatDate(bill.paidDate, 'short')
                : formatDate(bill.dueDate, 'short')}
            </span>
          </div>
        </div>

        {/* Notes preview if any */}
        {bill.notes && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">
            "{bill.notes}"
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleEditClick}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit bill"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete bill"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {bill.isPaid ? (
            <button
              type="button"
              onClick={() => unmarkBillAsPaid(bill.id)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Mark Unpaid
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePayClick}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                statusInfo.status === 'overdue'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark as Paid
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
