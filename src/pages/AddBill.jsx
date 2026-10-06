import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import BillForm from '../components/BillForm';
import { useBills } from '../context/BillContext';

export default function AddBill() {
  const { addBill } = useBills();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (formData) => {
    addBill(formData);
    setSuccessMessage(`"${formData.name}" was successfully added.`);
    setTimeout(() => {
      navigate('/bills');
    }, 900);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button & Page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Add New Bill
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure payment schedule, frequency, and reminder alerts.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage} Redirecting to your bills...</span>
        </div>
      )}

      {/* Main Form Container */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#141A21] border border-slate-200 dark:border-slate-800 shadow-sm">
        <BillForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/bills')}
        />
      </div>
    </div>
  );
}
