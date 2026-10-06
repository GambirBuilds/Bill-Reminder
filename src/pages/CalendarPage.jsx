import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlusCircle,
  X,
} from 'lucide-react';
import BillCard from '../components/BillCard';
import { useBills } from '../context/BillContext';
import {
  toInputDate,
  formatDate,
  formatCurrency,
  parseDate,
  isSameDay,
} from '../utils/dateUtils';
import { getBillStatus } from '../utils/billCalculations';

export default function CalendarPage() {
  const { bills, openAddModal, openPayModal } = useBills();

  // Anchor to current month (October 2026)
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState(toInputDate(today));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDateStr(toInputDate(today));
  };

  // Calendar cells generation (Mon to Sun)
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // Calculate starting day of week (0 = Sun, 1 = Mon, ..., 6 = Sat)
    // Convert to Monday = 0
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Previous month's padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const dateObj = new Date(currentYear, currentMonth - 1, d);
      days.push({
        date: d,
        dateStr: toInputDate(dateObj),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      days.push({
        date: d,
        dateStr: toInputDate(dateObj),
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const dateObj = new Date(currentYear, currentMonth + 1, d);
      days.push({
        date: d,
        dateStr: toInputDate(dateObj),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Index bills by dateStr
  const billsByDate = useMemo(() => {
    const map = {};
    bills.forEach((bill) => {
      if (!bill.dueDate) return;
      const key = bill.dueDate.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(bill);
    });
    return map;
  }, [bills]);

  // Bills on selected date
  const selectedDateBills = useMemo(() => {
    return billsByDate[selectedDateStr] || [];
  }, [billsByDate, selectedDateStr]);

  const weekDayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Billing Calendar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize your monthly schedule, due dates, and pending payments.
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleJumpToToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#141A21] overflow-hidden">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-900 dark:text-slate-100 min-w-32 text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 p-3 rounded-xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80">
        <span className="font-semibold text-slate-900 dark:text-slate-200">Indicators:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Paid
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Upcoming
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Due Soon / Today
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Overdue
        </span>
      </div>

      {/* Main Grid + Selected Day Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Columns) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80 p-4 sm:p-6 overflow-hidden shadow-xs">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-slate-400 uppercase tracking-wider mb-2">
            {weekDayHeaders.map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              const dayBills = billsByDate[cell.dateStr] || [];
              const isSelected = selectedDateStr === cell.dateStr;
              const isTodayDate = cell.dateStr === toInputDate(today);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-16 sm:min-h-20 p-1.5 sm:p-2 rounded-xl text-left border flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/30'
                      : isTodayDate
                      ? 'border-blue-300 dark:border-blue-800/80 bg-slate-50/80 dark:bg-slate-900/40'
                      : 'border-slate-100 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#141A21]'
                  } ${!cell.isCurrentMonth ? 'opacity-35' : ''}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-semibold font-mono tabular-nums ${
                        isTodayDate
                          ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {cell.date}
                    </span>

                    {dayBills.length > 0 && (
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        {dayBills.length}
                      </span>
                    )}
                  </div>

                  {/* Bill Badges on Date */}
                  <div className="mt-1 space-y-1 w-full overflow-hidden">
                    {dayBills.slice(0, 2).map((b) => {
                      const st = getBillStatus(b);
                      return (
                        <div
                          key={b.id}
                          className={`truncate text-[10px] px-1 py-0.5 rounded font-medium flex items-center gap-1 ${st.bgClass} ${st.textClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dotClass}`} />
                          <span className="truncate">{b.name}</span>
                        </div>
                      );
                    })}
                    {dayBills.length > 2 && (
                      <span className="text-[9px] text-slate-400 block text-right font-mono">
                        +{dayBills.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Selected Date
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {formatDate(selectedDateStr, 'long')}
                </h3>
              </div>

              <span className="text-xs font-mono font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {selectedDateBills.length} {selectedDateBills.length === 1 ? 'bill' : 'bills'}
              </span>
            </div>

            {/* List of bills on this date */}
            <div className="mt-4 space-y-3">
              {selectedDateBills.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No bills scheduled for this date.
                </div>
              ) : (
                selectedDateBills.map((bill) => {
                  const status = getBillStatus(bill);
                  return (
                    <div
                      key={bill.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F14] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {bill.name}
                          </h4>
                          <span className="text-xs text-slate-500">
                            {bill.category} · {bill.paymentMethod}
                          </span>
                        </div>
                        <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                          {formatCurrency(bill.amount)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className={`text-xs font-medium ${status.textClass} flex items-center gap-1`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                          {status.label}
                        </span>

                        {!bill.isPaid && (
                          <button
                            onClick={() => openPayModal(bill)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={openAddModal}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Bill on this day
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
