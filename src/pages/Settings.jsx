import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Bell,
  Wallet,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
} from 'lucide-react';
import { useBills } from '../context/BillContext';
import { formatCurrency } from '../utils/dateUtils';
import { REMINDER_OPTIONS } from '../components/BillForm';
import { calculateDashboardMetrics } from '../utils/billCalculations';

export default function Settings() {
  const {
    settings,
    updateBudget,
    updateSettings,
    theme,
    toggleTheme,
    clearDemoData,
    resetDemoData,
    requestBrowserNotification,
    bills,
    paymentHistory,
  } = useBills();

  const [budgetInput, setBudgetInput] = useState(String(settings.budget || 30000));
  const [budgetSavedMessage, setBudgetSavedMessage] = useState(false);
  const metrics = calculateDashboardMetrics(bills, paymentHistory, settings.budget);

  const handleBudgetSave = (e) => {
    e.preventDefault();
    updateBudget(budgetInput);
    setBudgetSavedMessage(true);
    setTimeout(() => setBudgetSavedMessage(false), 2000);
  };

  const handleExportBackup = () => {
    const backupData = {
      bills,
      paymentHistory,
      settings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill_reminder_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        if (parsed && Array.isArray(parsed.bills)) {
          updateSettings(parsed.settings || {});
          alert('Backup restored successfully! Refreshing view.');
          window.location.reload();
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Could not parse backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Settings & Preferences
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Configure monthly budgets, notification alerts, appearance theme, and data backups.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Monthly Budget Configuration */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Monthly Bill Budget
              </h3>
              <p className="text-xs text-slate-500">Set maximum target for monthly expenses</p>
            </div>
          </div>

          <form onSubmit={handleBudgetSave} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Target Budget (Rs.)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 font-mono">
                  Rs.
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg text-sm font-mono tabular-nums bg-slate-50 dark:bg-[#0B0F14] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {budgetSavedMessage ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Budget saved
                </span>
              ) : (
                <span className="text-xs text-slate-400">Currency: Nepalese Rupee (Rs.)</span>
              )}
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors"
              >
                Save Target
              </button>
            </div>
          </form>

          {/* Budget Snapshot */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Committed Bills:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(metrics.totalDue)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Remaining Buffer:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(Math.max(0, metrics.remainingBudget))}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Budget Burn Rate:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {metrics.budgetUsedPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Appearance & Theme */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Appearance Theme
              </h3>
              <p className="text-xs text-slate-500">Choose between light and dark modes</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                theme === 'light'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 text-slate-900'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-6 h-6 text-amber-500" />
              <span className="text-xs font-semibold">Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'border-blue-500 bg-[#0B0F14] ring-2 ring-blue-500/20 text-slate-100'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
              }`}
            >
              <Moon className="w-6 h-6 text-blue-400" />
              <span className="text-xs font-semibold">Dark Mode</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Selected preference is stored locally in your browser and preserved between visits.
          </p>
        </div>

        {/* 3. Smart Reminder Preferences */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Payment Reminders
              </h3>
              <p className="text-xs text-slate-500">In-app notifications & browser alerts</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Default Alert Timing
              </label>
              <select
                value={settings.reminderDays}
                onChange={(e) => updateSettings({ reminderDays: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0B0F14] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {REMINDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Browser Notifications
                </p>
                <p className="text-[11px] text-slate-500">
                  {settings.notificationsEnabled
                    ? 'Granted · You receive browser notification banners'
                    : 'Not active · Click activate to grant browser permission'}
                </p>
              </div>

              <button
                type="button"
                onClick={requestBrowserNotification}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  settings.notificationsEnabled
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {settings.notificationsEnabled ? 'Active ✓' : 'Enable'}
              </button>
            </div>
          </div>
        </div>

        {/* 4. Demo Data & Backup Control */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Data Management
              </h3>
              <p className="text-xs text-slate-500">Manage sample data and JSON backups</p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear all demo data and start with an empty account?')) {
                    clearDemoData();
                  }
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Demo Data
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Restore initial sample demo bills?')) {
                    resetDemoData();
                  }
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Demo Data
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON Backup
              </button>

              <label className="w-full py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Import JSON Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
