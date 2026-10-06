import React, { useState, useMemo } from 'react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  Wallet,
  ArrowUpDown,
} from 'lucide-react';
import { useBills } from '../context/BillContext';
import { formatCurrency, formatDate } from '../utils/dateUtils';
import { CATEGORIES, PAYMENT_METHODS } from '../components/BillForm';
import EmptyState from '../components/EmptyState';

export default function History() {
  const { paymentHistory, deleteHistoryItem } = useBills();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [sortBy, setSortBy] = useState('paidDate'); // paidDate | amount | billName
  const [sortOrder, setSortOrder] = useState('desc'); // desc | asc

  const filteredHistory = useMemo(() => {
    return paymentHistory
      .filter((item) => {
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
        if (methodFilter !== 'all' && item.paymentMethod !== methodFilter) return false;

        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = item.billName?.toLowerCase().includes(q);
          const matchCat = item.category?.toLowerCase().includes(q);
          const matchMethod = item.paymentMethod?.toLowerCase().includes(q);
          const matchRef = item.referenceNote?.toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchMethod && !matchRef) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'paidDate') {
          comp = new Date(a.paidDate).getTime() - new Date(b.paidDate).getTime();
        } else if (sortBy === 'amount') {
          comp = Number(a.amount) - Number(b.amount);
        } else if (sortBy === 'billName') {
          comp = a.billName.localeCompare(b.billName);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [paymentHistory, categoryFilter, methodFilter, searchTerm, sortBy, sortOrder]);

  const totalClearedAmount = filteredHistory.reduce(
    (acc, item) => acc + (Number(item.amount) || 0),
    0
  );

  const exportCSV = () => {
    if (filteredHistory.length === 0) return;
    const headers = ['Bill Name', 'Category', 'Amount (Rs.)', 'Paid Date', 'Payment Method', 'Reference Note'];
    const rows = filteredHistory.map((h) => [
      `"${h.billName.replace(/"/g, '""')}"`,
      `"${h.category}"`,
      h.amount,
      `"${h.paidDate}"`,
      `"${h.paymentMethod}"`,
      `"${(h.referenceNote || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bill_payment_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Payment History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Audit trail of cleared obligations, payment methods, and transaction references.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={filteredHistory.length === 0}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search history records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Payment Methods</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="paidDate">Paid Date</option>
              <option value="amount">Amount</option>
              <option value="billName">Bill Name</option>
            </select>
            <button
              onClick={() => setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'))}
              className="px-2.5 py-2 text-xs font-mono font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F14]"
              title="Toggle sort direction"
            >
              {sortOrder.toUpperCase()}
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Records: <strong className="font-mono text-slate-900 dark:text-slate-100">{filteredHistory.length}</strong>
          </span>
          <span>
            Total Settled:{' '}
            <strong className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
              {formatCurrency(totalClearedAmount)}
            </strong>
          </span>
        </div>
      </div>

      {/* History Table */}
      {filteredHistory.length === 0 ? (
        <EmptyState
          title="No payment records found"
          description="Payments recorded will automatically populate this permanent log."
          actionText=""
          icon={HistoryIcon}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#141A21] overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0B0F14] border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Bill Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Paid Date</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Reference Note</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredHistory.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {item.billName}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {item.category}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                    {formatDate(item.paidDate, 'short')}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                    {item.paymentMethod}
                  </td>
                  <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                    {item.referenceNote || '—'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold tabular-nums text-right text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                      title="Delete log record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
