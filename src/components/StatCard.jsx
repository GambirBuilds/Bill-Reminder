import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'default', // 'default' | 'danger' | 'warning' | 'success' | 'primary'
}) {
  const variantStyles = {
    default: {
      border: 'border-slate-200 dark:border-slate-800/80',
      iconBg: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400',
    },
    primary: {
      border: 'border-blue-200/60 dark:border-blue-900/40',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    },
    danger: {
      border: 'border-rose-200/60 dark:border-rose-900/40',
      iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    },
    warning: {
      border: 'border-amber-200/60 dark:border-amber-900/40',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    },
    success: {
      border: 'border-emerald-200/60 dark:border-emerald-900/40',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`p-5 rounded-xl bg-white dark:bg-[#141A21] border ${style.border} transition-colors`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg ${style.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
          {value}
        </div>
        {subtext && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
