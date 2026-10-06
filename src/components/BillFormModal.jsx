import React from 'react';
import { X, PlusCircle, Edit3 } from 'lucide-react';
import BillForm from './BillForm';
import { useBills } from '../context/BillContext';

export default function BillFormModal({ isOpen, onClose, billToEdit = null }) {
  const { addBill, updateBill } = useBills();

  if (!isOpen) return null;

  const handleSubmit = (formData) => {
    if (billToEdit) {
      updateBill(billToEdit.id, formData);
    } else {
      addBill(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="my-8 w-full max-w-lg bg-white dark:bg-[#141A21] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              {billToEdit ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {billToEdit ? 'Edit Bill' : 'Add New Bill'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {billToEdit ? 'Update bill details and schedules' : 'Set up reminders and payment schedule'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <BillForm
            initialData={billToEdit}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
