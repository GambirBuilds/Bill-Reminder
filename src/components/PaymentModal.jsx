import React, { useState } from 'react';
import { CheckCircle2, X, Calendar, Wallet, FileText, Repeat } from 'lucide-react';
import { formatCurrency, formatDate, toInputDate, calculateNextDueDate } from '../utils/dateUtils';
import { useBills } from '../context/BillContext';
import { PAYMENT_METHODS } from './BillForm';

export default function PaymentModal({ bill, onClose }) {
  const { markBillAsPaid } = useBills();
  const [paidDate, setPaidDate] = useState(toInputDate());
  const [paymentMethod, setPaymentMethod] = useState(bill.paymentMethod || 'eSewa');
  const [referenceNote, setReferenceNote] = useState('');

  if (!bill) return null;

  const nextDueDate = bill.isRecurring
    ? calculateNextDueDate(bill.dueDate, bill.frequency)
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    markBillAsPaid(bill.id, {
      paidDate,
      paymentMethod,
      referenceNote: referenceNote.trim() || `Paid via ${paymentMethod}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-[#141A21] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Record Payment
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Confirm settlement for {bill.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Summary Banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Amount Due</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {formatCurrency(bill.amount)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Due Date</span>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 font-mono">
                {formatDate(bill.dueDate, 'short')}
              </div>
            </div>
          </div>

          {/* Paid Date Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Payment Date
            </label>
            <input
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white dark:bg-[#0B0F14] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Payment Method Used
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white dark:bg-[#0B0F14] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Reference / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Transaction ID / Reference Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. eSewa Txn #9901, Cheque #402"
              value={referenceNote}
              onChange={(e) => setReferenceNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white dark:bg-[#0B0F14] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Recurrence Explanation Banner */}
          {bill.isRecurring && nextDueDate ? (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
              <Repeat className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Recurring {bill.frequency} bill:</span>
                <p className="mt-0.5 text-blue-700 dark:text-blue-400">
                  Recording this payment will automatically advance the next due date to{' '}
                  <strong className="underline font-mono">{formatDate(nextDueDate, 'long')}</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400">
              One-time bill. It will be marked as paid and moved to payment history.
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
