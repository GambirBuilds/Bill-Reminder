import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  Calendar,
  Repeat,
  X,
} from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import BillFormModal from './BillFormModal';
import PaymentModal from './PaymentModal';
import { useBills } from '../context/BillContext';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    activeModal,
    selectedBillForEdit,
    selectedBillForPay,
    closeModal,
    openAddModal,
  } = useBills();

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0B0F14] text-[#0F172A] dark:text-[#F8FAFC] overflow-hidden antialiased font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar onCloseMobile={() => {}} />
      </div>

      {/* Mobile Slide-over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[80vw] bg-white dark:bg-[#141A21] z-50 shadow-2xl">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#141A21]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1 flex items-center justify-around">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/bills"
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <Receipt className="w-5 h-5 mb-0.5" />
            <span>Bills</span>
          </NavLink>

          <button
            type="button"
            onClick={openAddModal}
            className="flex flex-col items-center justify-center -mt-4 w-11 h-11 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
            aria-label="Add new bill"
          >
            <PlusCircle className="w-6 h-6" />
          </button>

          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span>Calendar</span>
          </NavLink>

          <NavLink
            to="/subscriptions"
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <Repeat className="w-5 h-5 mb-0.5" />
            <span>Subs</span>
          </NavLink>
        </nav>
      </div>

      {/* Global Modals */}
      <BillFormModal
        isOpen={activeModal === 'add' || activeModal === 'edit'}
        onClose={closeModal}
        billToEdit={selectedBillForEdit}
      />

      {activeModal === 'pay' && selectedBillForPay && (
        <PaymentModal bill={selectedBillForPay} onClose={closeModal} />
      )}
    </div>
  );
}
