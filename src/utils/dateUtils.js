/**
 * Date and currency utility functions for Bill Reminder
 */

export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return 'Rs. 0';
  }
  const num = Number(amount);
  const formatted = num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
  });
  return `Rs. ${formatted}`;
}

export function parseDate(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  // If string in 'YYYY-MM-DD' format, parse in local timezone
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }
  return new Date(dateStr);
}

export function toInputDate(date = new Date()) {
  const d = date instanceof Date ? date : parseDate(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(dateStr, style = 'medium') {
  if (!dateStr) return '';
  const d = parseDate(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  if (style === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (style === 'long') {
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Calculates calendar day difference between target date and base date (default today).
 * Positive: due in future
 * 0: due today
 * Negative: overdue
 */
export function getDaysDifference(targetDateStr, baseDate = new Date()) {
  const target = parseDate(targetDateStr);
  const base = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = targetDay.getTime() - base.getTime();
  return Math.round(diffMs / msPerDay);
}

export function getRelativeStatusText(dueDateStr, isPaid = false, paidDateStr = null) {
  if (isPaid) {
    if (paidDateStr) {
      return `Paid on ${formatDate(paidDateStr, 'short')}`;
    }
    return 'Paid';
  }

  const diff = getDaysDifference(dueDateStr);
  if (diff < 0) {
    const days = Math.abs(diff);
    return `Overdue by ${days} ${days === 1 ? 'day' : 'days'}`;
  }
  if (diff === 0) {
    return 'Due today';
  }
  if (diff === 1) {
    return 'Due tomorrow';
  }
  return `Due in ${diff} days`;
}

export function isSameDay(date1Str, date2Str) {
  const d1 = parseDate(date1Str);
  const d2 = parseDate(date2Str);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isToday(dateStr, base = new Date()) {
  return isSameDay(dateStr, toInputDate(base));
}

export function isThisWeek(dateStr, base = new Date()) {
  const d = parseDate(dateStr);
  const diff = getDaysDifference(dateStr, base);
  // Due between today and 7 days from today
  return diff >= 0 && diff <= 7;
}

export function isThisMonth(dateStr, base = new Date()) {
  const d = parseDate(dateStr);
  return d.getFullYear() === base.getFullYear() && d.getMonth() === base.getMonth();
}

export function isNextMonth(dateStr, base = new Date()) {
  const d = parseDate(dateStr);
  const nextMonthYear = base.getMonth() === 11 ? base.getFullYear() + 1 : base.getFullYear();
  const nextMonth = (base.getMonth() + 1) % 12;
  return d.getFullYear() === nextMonthYear && d.getMonth() === nextMonth;
}

/**
 * Calculates the next expected due date based on current due date and frequency
 */
export function calculateNextDueDate(currentDueDateStr, frequency = 'monthly') {
  if (!currentDueDateStr || frequency === 'one-time') return null;

  const current = parseDate(currentDueDateStr);
  const next = new Date(current.getTime());

  switch (frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly': {
      const day = current.getDate();
      next.setMonth(next.getMonth() + 1);
      // Handle end of month rollover
      if (next.getDate() !== day) {
        next.setDate(0);
      }
      break;
    }
    case 'quarterly': {
      const day = current.getDate();
      next.setMonth(next.getMonth() + 3);
      if (next.getDate() !== day) {
        next.setDate(0);
      }
      break;
    }
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      return null;
  }

  return toInputDate(next);
}
