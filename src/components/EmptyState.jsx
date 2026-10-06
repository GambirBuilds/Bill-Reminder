import React from 'react';
import { PlusCircle, Search, Calendar, CreditCard, Sparkles } from 'lucide-react';

export default function EmptyState({
  title = 'No bills found',
  description = 'You have no bills matching this criteria.',
  actionText = 'Add a Bill',
  onAction,
  icon: Icon = CreditCard,
}) {
  return (
    <div className="py-12 px-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-[#141A21]/30">
      <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        {description}
      </p>
      {onAction && actionText && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
}
