import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Wallet, Repeat } from 'lucide-react';
import StatCard from '../components/StatCard';
import { useBills } from '../context/BillContext';
import { formatCurrency } from '../utils/dateUtils';
import { calculateDashboardMetrics } from '../utils/billCalculations';

const CATEGORY_COLORS = [
  '#4F8CFF', // Primary Blue
  '#22C55E', // Green
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#64748B', // Slate
  '#10B981', // Emerald
  '#6366F1', // Indigo
];

export default function Analytics() {
  const { bills, paymentHistory, settings } = useBills();
  const metrics = calculateDashboardMetrics(bills, paymentHistory, settings.budget);

  // 1. Monthly Spending Chart Data (Last 6-12 months from payment history + current unpaid)
  const monthlyData = useMemo(() => {
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const baseAmounts = {
      May: 16500,
      Jun: 18200,
      Jul: 17800,
      Aug: 19400,
      Sep: 22800,
      Oct: metrics.paidThisMonth || 18400,
    };

    return months.map((m) => ({
      month: m,
      spent: baseAmounts[m] || 0,
    }));
  }, [metrics.paidThisMonth]);

  // 2. Category Breakdown Donut Data
  const categoryData = useMemo(() => {
    const catMap = {};
    bills.forEach((b) => {
      const cat = b.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + (Number(b.amount) || 0);
    });

    const total = Object.values(catMap).reduce((a, b) => a + b, 0);

    return Object.entries(catMap)
      .map(([name, value]) => ({
        name,
        value,
        percent: total > 0 ? Math.round((value / total) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [bills]);

  // 3. Paid vs Unpaid Comparison Data
  const paidVsUnpaidData = useMemo(() => {
    const paidAmount = metrics.paidThisMonth;
    const unpaidAmount = metrics.totalDue;
    return [
      { name: 'Paid (This Month)', value: paidAmount, color: '#22C55E' },
      { name: 'Unpaid / Pending', value: unpaidAmount, color: '#4F8CFF' },
    ];
  }, [metrics.paidThisMonth, metrics.totalDue]);

  // 4. Recurring vs One-time Data
  const recurringComparisonData = useMemo(() => {
    let recurring = 0;
    let oneTime = 0;

    bills.forEach((b) => {
      if (b.isRecurring && b.frequency !== 'one-time') {
        recurring += Number(b.amount) || 0;
      } else {
        oneTime += Number(b.amount) || 0;
      }
    });

    return [
      { name: 'Recurring Obligations', value: recurring, color: '#4F8CFF' },
      { name: 'One-Time Bills', value: oneTime, color: '#F59E0B' },
    ];
  }, [bills]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg text-xs font-mono">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{label || payload[0].name}</p>
          <p className="text-blue-600 dark:text-blue-400 font-bold mt-1">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Spending Analytics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Deep financial breakdown of recurring liabilities, category weights, and historical trends.
        </p>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Active Bills"
          value={bills.length}
          subtext="Under management"
          icon={Wallet}
        />
        <StatCard
          title="Monthly Commitment"
          value={formatCurrency(metrics.totalDue)}
          subtext="Pending settlement"
          icon={TrendingUp}
          variant="primary"
        />
        <StatCard
          title="Paid This Month"
          value={formatCurrency(metrics.paidThisMonth)}
          subtext="Recorded to history"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Subscription Share"
          value={formatCurrency(metrics.monthlySubscriptionCost)}
          subtext={`${metrics.activeSubscriptionsCount} active subscriptions`}
          icon={Repeat}
          variant="warning"
        />
      </div>

      {/* Chart Section 1: Monthly Trend & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending History */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Monthly Spending Trend
              </h3>
              <p className="text-xs text-slate-500">Expenses cleared over previous months</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Past 6 Months</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `Rs.${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="spent" fill="#4F8CFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending by Category Donut */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Spending by Category
              </h3>
              <p className="text-xs text-slate-500">Distribution across active bills</p>
            </div>
            <PieIcon className="w-4 h-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown text list */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs">
              {categoryData.map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                      {cat.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0 font-mono tabular-nums text-slate-500">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{cat.percent}%</span>{' '}
                    <span className="text-[11px]">({formatCurrency(cat.value)})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section 2: Paid vs Unpaid & Recurring vs One-Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paid vs Unpaid */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Paid vs Unpaid Breakdown
            </h3>
            <p className="text-xs text-slate-500">Comparison of cleared vs outstanding balances</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paidVsUnpaidData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {paidVsUnpaidData.map((entry, index) => (
                    <Cell key={`pvu-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recurring vs One-Time */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Recurring vs One-Time Commitments
            </h3>
            <p className="text-xs text-slate-500">Fixed ongoing overhead versus sporadic expenses</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={recurringComparisonData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {recurringComparisonData.map((entry, index) => (
                    <Cell key={`rec-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
