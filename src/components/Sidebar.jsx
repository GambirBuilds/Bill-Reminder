import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  Clock,
  AlertTriangle,
  Repeat,
  Calendar,
  BarChart3,
  History,
  Settings,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useBills } from '../context/BillContext';
import { calculateDashboardMetrics } from '../utils/billCalculations';

export default function Sidebar({ onCloseMobile }) {
  const { bills, paymentHistory, settings } = useBills();
  const metrics = calculateDashboardMetrics(bills, paymentHistory, settings.budget);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/bills', label: 'All Bills', icon: Receipt, badge: metrics.unpaidCount },
    { to: '/upcoming', label: 'Upcoming', icon: Clock },
    {
      to: '/overdue',
      label: 'Overdue',
      icon: AlertTriangle,
      badge: metrics.overdueCount > 0 ? metrics.overdueCount : null,
      badgeDanger: true,
    },
    { to: '/subscriptions', label: 'Subscriptions', icon: Repeat },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/history', label: 'History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 flex flex-col h-full bg-white dark:bg-[#141A21] border-r border-slate-200 dark:border-slate-800/80 transition-colors">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <NavLink
          to="/"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Bill Reminder
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Never miss a payment
            </span>
          </div>
        </NavLink>
      </div>

      {/* Primary Action Button */}
      <div className="p-4">
        <NavLink
          to="/add-bill"
          onClick={onCloseMobile}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          Add Bill
        </NavLink>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge !== null && (
                <span
                  className={`text-xs font-mono tabular-nums px-2 py-0.5 rounded-md font-semibold ${
                    item.badgeDanger
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Mini Status */}
      <div className="p-4 m-3 rounded-xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-slate-800/80 text-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span>Active Bills</span>
          <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-200">
            {metrics.unpaidCount}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span>Monthly Budget</span>
          <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-200">
            Rs. {settings.budget?.toLocaleString('en-IN') || '30,000'}
          </span>
        </div>
      </div>
    </aside>
  );
}
