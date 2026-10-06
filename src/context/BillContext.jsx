import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  loadData,
  saveData,
  loadTheme,
  saveTheme,
  clearAllData as clearStorage,
  resetToDemoData as resetStorage,
} from '../utils/storage';
import { calculateNextDueDate, toInputDate } from '../utils/dateUtils';

const BillContext = createContext(null);

export function BillProvider({ children }) {
  const [data, setData] = useState(() => loadData());
  const [theme, setThemeState] = useState(() => loadTheme());
  const [activeModal, setActiveModal] = useState(null); // 'add' | 'edit' | 'pay' | null
  const [selectedBillForEdit, setSelectedBillForEdit] = useState(null);
  const [selectedBillForPay, setSelectedBillForPay] = useState(null);

  // Sync theme to DOM html class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Persist data updates to localStorage
  useEffect(() => {
    saveData(data);
  }, [data]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const addBill = useCallback((billInput) => {
    const id = 'bill-' + Date.now();
    const newBill = {
      ...billInput,
      id,
      amount: Number(billInput.amount) || 0,
      createdAt: new Date().toISOString(),
      isPaid: Boolean(billInput.isPaid),
    };

    setData((prev) => ({
      ...prev,
      bills: [newBill, ...prev.bills],
    }));

    return newBill;
  }, []);

  const updateBill = useCallback((id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      bills: prev.bills.map((b) =>
        b.id === id
          ? {
              ...b,
              ...updatedFields,
              amount:
                updatedFields.amount !== undefined
                  ? Number(updatedFields.amount) || 0
                  : b.amount,
            }
          : b
      ),
    }));
  }, []);

  const deleteBill = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      bills: prev.bills.filter((b) => b.id !== id),
    }));
  }, []);

  const markBillAsPaid = useCallback((id, paymentDetails = {}) => {
    setData((prev) => {
      const target = prev.bills.find((b) => b.id === id);
      if (!target) return prev;

      const paidDate = paymentDetails.paidDate || toInputDate();
      const paymentMethod = paymentDetails.paymentMethod || target.paymentMethod || 'Cash';
      const referenceNote = paymentDetails.referenceNote || 'Marked as paid';

      // Create history entry
      const historyItem = {
        id: 'hist-' + Date.now(),
        billId: target.id,
        billName: target.name,
        category: target.category,
        amount: target.amount,
        paidDate,
        paymentMethod,
        referenceNote,
      };

      // Confetti celebration
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#22C55E', '#4F8CFF', '#F59E0B'],
        });
      } catch (e) {
        // Safe fallback
      }

      // If recurring, advance to next due date!
      if (target.isRecurring && target.frequency && target.frequency !== 'one-time') {
        const nextDue = calculateNextDueDate(target.dueDate, target.frequency);
        const updatedBills = prev.bills.map((b) =>
          b.id === id
            ? {
                ...b,
                dueDate: nextDue || b.dueDate,
                lastPaidDate: paidDate,
                isPaid: false, // active for the next cycle
              }
            : b
        );
        return {
          ...prev,
          bills: updatedBills,
          paymentHistory: [historyItem, ...prev.paymentHistory],
        };
      }

      // If one-time, mark as paid
      const updatedBills = prev.bills.map((b) =>
        b.id === id
          ? {
              ...b,
              isPaid: true,
              paidDate,
            }
          : b
      );

      return {
        ...prev,
        bills: updatedBills,
        paymentHistory: [historyItem, ...prev.paymentHistory],
      };
    });
  }, []);

  const unmarkBillAsPaid = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      bills: prev.bills.map((b) =>
        b.id === id
          ? {
              ...b,
              isPaid: false,
              paidDate: null,
            }
          : b
      ),
    }));
  }, []);

  const deleteHistoryItem = useCallback((historyId) => {
    setData((prev) => ({
      ...prev,
      paymentHistory: prev.paymentHistory.filter((h) => h.id !== historyId),
    }));
  }, []);

  const updateBudget = useCallback((newBudget) => {
    const budgetNum = Math.max(0, Number(newBudget) || 0);
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        budget: budgetNum,
      },
    }));
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings,
      },
    }));
  }, []);

  const clearDemoData = useCallback(() => {
    const clean = clearStorage();
    setData(clean);
  }, []);

  const resetDemoData = useCallback(() => {
    const reset = resetStorage();
    setData(reset);
  }, []);

  const requestBrowserNotification = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('Browser notifications are not supported in this browser.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      updateSettings({ notificationsEnabled: granted });
      if (granted) {
        new Notification('Bill Reminder Activated', {
          body: 'You will receive in-app and browser reminders for upcoming bills.',
          icon: '/favicon.ico',
        });
      }
      return granted;
    } catch (e) {
      console.warn('Notification permission error:', e);
      return false;
    }
  }, [updateSettings]);

  // Modal helpers
  const openAddModal = useCallback(() => {
    setSelectedBillForEdit(null);
    setActiveModal('add');
  }, []);

  const openEditModal = useCallback((bill) => {
    setSelectedBillForEdit(bill);
    setActiveModal('edit');
  }, []);

  const openPayModal = useCallback((bill) => {
    setSelectedBillForPay(bill);
    setActiveModal('pay');
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setSelectedBillForEdit(null);
    setSelectedBillForPay(null);
  }, []);

  const value = {
    bills: data.bills,
    paymentHistory: data.paymentHistory,
    settings: data.settings,
    theme,
    toggleTheme,
    addBill,
    updateBill,
    deleteBill,
    markBillAsPaid,
    unmarkBillAsPaid,
    deleteHistoryItem,
    updateBudget,
    updateSettings,
    clearDemoData,
    resetDemoData,
    requestBrowserNotification,
    // modal states
    activeModal,
    selectedBillForEdit,
    selectedBillForPay,
    openAddModal,
    openEditModal,
    openPayModal,
    closeModal,
  };

  return <BillContext.Provider value={value}>{children}</BillContext.Provider>;
}

export function useBills() {
  const context = useContext(BillContext);
  if (!context) {
    throw new Error('useBills must be used within a BillProvider');
  }
  return context;
}
