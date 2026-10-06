import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  PlusCircle,
  Search,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { useBills } from '../context/BillContext';

export default function Header({ onOpenMobileMenu }) {
  const { theme, toggleTheme, openAddModal, settings, requestBrowserNotification } = useBills();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/bills?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/bills') return 'All Bills';
    if (path === '/add-bill') return 'Add New Bill';
    if (path === '/upcoming') return 'Upcoming Bills';
    if (path === '/overdue') return 'Overdue Bills';
    if (path === '/subscriptions') return 'Subscription Tracker';
    if (path === '/calendar') return 'Billing Calendar';
    if (path === '/analytics') return 'Spending Analytics';
    if (path === '/history') return 'Payment History';
    if (path === '/settings') return 'Settings & Preferences';
    return 'Bill Reminder';
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-white dark:bg-[#141A21] border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors">
      {/* Zone 1: Mobile Hamburger & Page Context */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Zone 2: Global Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden sm:flex items-center flex-1 max-w-md mx-4"
      >
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search bills by name, category, payment method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs sm:text-sm bg-slate-50 dark:bg-[#0B0F14] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </form>

      {/* Zone 3: Actions (Theme Toggle & Add Bill) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification indicator */}
        <button
          type="button"
          onClick={requestBrowserNotification}
          title={
            settings.notificationsEnabled
              ? 'Browser reminders active'
              : 'Click to enable browser reminders'
          }
          className={`p-2 rounded-lg transition-colors ${
            settings.notificationsEnabled
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark/light theme"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Quick Add Button */}
        <button
          type="button"
          onClick={openAddModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-colors whitespace-nowrap"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Quick Add</span>
        </button>
      </div>
    </header>
  );
}
