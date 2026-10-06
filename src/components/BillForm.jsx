import React, { useState, useEffect } from 'react';
import { toInputDate, calculateNextDueDate } from '../utils/dateUtils';
import { Sparkles, Calendar, DollarSign, Bell, Repeat, Tag, CreditCard } from 'lucide-react';

export const CATEGORIES = [
  'Electricity',
  'Internet',
  'Water',
  'Rent',
  'Phone',
  'Insurance',
  'Subscription',
  'Education',
  'Loan',
  'Credit Card',
  'Transportation',
  'Other',
];

export const PAYMENT_FREQUENCIES = [
  { value: 'one-time', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export const PAYMENT_METHODS = [
  'Cash',
  'Bank',
  'eSewa',
  'Khalti',
  'Card',
  'Mobile Banking',
  'Other',
];

export const REMINDER_OPTIONS = [
  { value: 0, label: 'On due date' },
  { value: 1, label: '1 day before' },
  { value: 3, label: '3 days before' },
  { value: 7, label: '7 days before' },
];

export default function BillForm({ initialData = null, onSubmit, onCancel, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Internet',
    amount: '',
    dueDate: toInputDate(),
    frequency: 'monthly',
    paymentMethod: 'eSewa',
    reminderDaysBefore: 3,
    reminderDate: '',
    notes: '',
    isRecurring: true,
    isSubscription: false,
    lastUsedDate: toInputDate(),
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || 'Internet',
        amount: initialData.amount !== undefined ? String(initialData.amount) : '',
        dueDate: initialData.dueDate || toInputDate(),
        frequency: initialData.frequency || 'monthly',
        paymentMethod: initialData.paymentMethod || 'eSewa',
        reminderDaysBefore: initialData.reminderDaysBefore ?? 3,
        reminderDate: initialData.reminderDate || '',
        notes: initialData.notes || '',
        isRecurring: Boolean(initialData.isRecurring),
        isSubscription: Boolean(initialData.isSubscription || initialData.category === 'Subscription'),
        lastUsedDate: initialData.lastUsedDate || toInputDate(),
      });
    }
  }, [initialData]);

  // Recalculate reminder date automatically when due date or reminder days change
  useEffect(() => {
    if (formData.dueDate) {
      const d = new Date(formData.dueDate);
      d.setDate(d.getDate() - Number(formData.reminderDaysBefore));
      setFormData((prev) => ({
        ...prev,
        reminderDate: toInputDate(d),
      }));
    }
  }, [formData.dueDate, formData.reminderDaysBefore]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;

    if (name === 'category' && value === 'Subscription') {
      setFormData((prev) => ({
        ...prev,
        category: value,
        isSubscription: true,
        isRecurring: true,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Bill name is required';
    }

    const numAmount = Number(formData.amount);
    if (!formData.amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      amount: numAmount,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Bill Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Bill Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          placeholder="e.g. WorldLink Fiber, Electricity, Rent"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-white dark:bg-[#0B0F14] border ${
            errors.name
              ? 'border-rose-500 focus:ring-rose-500'
              : 'border-slate-300 dark:border-slate-700 focus:border-blue-500'
          } text-slate-900 dark:text-slate-100 focus:outline-none transition-colors`}
        />
        {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
      </div>

      {/* Category & Amount Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white dark:bg-[#0B0F14] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Amount (Rs.) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 font-mono">
              Rs.
            </span>
            <input
              type="number"
              step="any"
              min="0"
              name="amount"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              className={`w-full pl-12 pr-3.5 py-2.5 rounded-lg text-sm font-mono tabular-nums bg-white dark:bg-[#0B0F14] border ${
                errors.amount
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:border-blue-500'
              } text-slate-900 dark:text-slate-100 focus:outline-none transition-colors`}
            />
          </div>
          {errors.amount && <p className="mt-1 text-xs text-rose-500">{errors.amount}</p>}
        </div>
      </div>

      {/* Due Date & Frequency Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Due Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-white dark:bg-[#0B0F14] border ${
              errors.dueDate
                ? 'border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 dark:border-slate-700 focus:border-blue-500'
            } text-slate-900 dark:text-slate-100 focus:outline-none transition-colors`}
          />
          {errors.dueDate && <p className="mt-1 text-xs text-rose-500">{errors.dueDate}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Payment Frequency
          </label>
          <select
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white dark:bg-[#0B0F14] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          >
            {PAYMENT_FREQUENCIES.map((freq) => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payment Method & Reminder Preference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Payment Method
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white dark:bg-[#0B0F14] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Reminder Preference
          </label>
          <select
            name="reminderDaysBefore"
            value={formData.reminderDaysBefore}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white dark:bg-[#0B0F14] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          >
            {REMINDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recurring & Subscription Checkboxes */}
      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={handleChange}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-[#0B0F14]"
          />
          <div>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
              Recurring Bill
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automatically calculate next due date when marked as paid
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isSubscription"
            checked={formData.isSubscription}
            onChange={handleChange}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-[#0B0F14]"
          />
          <div>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
              Track as Subscription
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Include in subscription tracker and usage monitoring
            </p>
          </div>
        </label>
      </div>

      {/* Subscription Usage Tracking (only if subscription checked) */}
      {formData.isSubscription && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Last Used Date (For Usage Monitoring)
          </label>
          <input
            type="date"
            name="lastUsedDate"
            value={formData.lastUsedDate}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white dark:bg-[#0B0F14] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-slate-500">
            Helps notify you if a subscription is going unused for over 30 days.
          </p>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Notes & Account Info (Optional)
        </label>
        <textarea
          name="notes"
          rows={2}
          placeholder="e.g. Account number, billing cycle details, contact info"
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white dark:bg-[#0B0F14] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* Submit / Cancel Buttons */}
      <div className="pt-2 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {initialData ? 'Update Bill' : 'Save Bill'}
        </button>
      </div>
    </form>
  );
}
