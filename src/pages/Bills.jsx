import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  PlusCircle,
  SlidersHorizontal,
  ArrowUpDown,
  Grid,
  List,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import BillCard from '../components/BillCard';
import EmptyState from '../components/EmptyState';
import { useBills } from '../context/BillContext';
import { getBillStatus } from '../utils/billCalculations';
import { formatCurrency, formatDate } from '../utils/dateUtils';

export default function Bills() {
  const { bills, openAddModal, openEditModal, openPayModal } = useBills();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [activeFilter, setActiveFilter] = useState('all'); // all | upcoming | due_soon | overdue | paid | recurring | one_time
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate | amount | name | category
  const [sortOrder, setSortOrder] = useState('asc'); // asc | desc
  const [viewMode, setViewMode] = useState('grid'); // grid | table

  const filterTabs = [
    { id: 'all', label: 'All Bills' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'due_soon', label: 'Due Soon' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'paid', label: 'Paid' },
    { id: 'recurring', label: 'Recurring' },
    { id: 'one_time', label: 'One-Time' },
  ];

  const filteredBills = useMemo(() => {
    return bills
      .filter((bill) => {
        const status = getBillStatus(bill).status;

        // Filter tab matching
        if (activeFilter === 'upcoming' && status !== 'upcoming') return false;
        if (activeFilter === 'due_soon' && status !== 'due_soon' && status !== 'due_today') return false;
        if (activeFilter === 'overdue' && status !== 'overdue') return false;
        if (activeFilter === 'paid' && !bill.isPaid) return false;
        if (activeFilter === 'recurring' && !bill.isRecurring) return false;
        if (activeFilter === 'one_time' && (bill.isRecurring || bill.frequency !== 'one-time')) return false;

        // Search text matching (name, category, paymentMethod, notes)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = bill.name?.toLowerCase().includes(q);
          const matchCategory = bill.category?.toLowerCase().includes(q);
          const matchMethod = bill.paymentMethod?.toLowerCase().includes(q);
          const matchNotes = bill.notes?.toLowerCase().includes(q);
          if (!matchName && !matchCategory && !matchMethod && !matchNotes) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'dueDate') {
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (sortBy === 'amount') {
          comparison = Number(a.amount) - Number(b.amount);
        } else if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'category') {
          comparison = a.category.localeCompare(b.category);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [bills, activeFilter, searchTerm, sortBy, sortOrder]);

  const totalFilteredAmount = filteredBills.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Title & Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Bill Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Search, filter, edit, and organize all your personal and recurring bills.
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

      {/* Control Bar: Search, Filters, Sort, View Toggle */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by bill name, category, payment method or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Sort & Order Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="dueDate">Due Date</option>
              <option value="amount">Amount</option>
              <option value="name">Bill Name</option>
              <option value="category">Category</option>
            </select>

            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F14] text-slate-700 dark:text-slate-300"
              title="Toggle sort direction"
            >
              {sortOrder.toUpperCase()}
            </button>

            {/* Grid / Table View Toggle */}
            <div className="hidden sm:flex items-center border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-slate-50 dark:bg-[#0B0F14]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid view"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Segmented Buttons (Interactive buttons per Constitution) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Summary Row */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-900 dark:text-slate-200 font-mono">{filteredBills.length}</strong>{' '}
          bills
        </span>
        <span>
          Total:{' '}
          <strong className="text-slate-900 dark:text-slate-100 font-mono font-bold text-sm">
            {formatCurrency(totalFilteredAmount)}
          </strong>
        </span>
      </div>

      {/* Content Rendering (Grid or Table) */}
      {filteredBills.length === 0 ? (
        <EmptyState
          title="No bills match your criteria"
          description="Try adjusting your filter tabs or search terms, or add a new bill."
          actionText="Add New Bill"
          onAction={openAddModal}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBills.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </div>
      ) : (
        /* High density table view */
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#141A21] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0B0F14] border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Bill Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredBills.map((bill) => {
                const status = getBillStatus(bill);
                return (
                  <tr
                    key={bill.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {bill.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {bill.category}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {formatDate(bill.dueDate, 'short')}
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-500">
                      {bill.frequency}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{bill.paymentMethod}</td>
                    <td className="py-3 px-4 font-mono font-bold tabular-nums text-right text-slate-900 dark:text-slate-100">
                      {formatCurrency(bill.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 font-medium ${status.textClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!bill.isPaid && (
                          <button
                            onClick={() => openPayModal(bill)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
                          >
                            Pay
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(bill)}
                          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
