import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BillProvider } from './context/BillContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Bills from './pages/Bills';
import AddBill from './pages/AddBill';
import UpcomingBills from './pages/UpcomingBills';
import OverdueBills from './pages/OverdueBills';
import Subscriptions from './pages/Subscriptions';
import CalendarPage from './pages/CalendarPage';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BillProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="bills" element={<Bills />} />
            <Route path="add-bill" element={<AddBill />} />
            <Route path="upcoming" element={<UpcomingBills />} />
            <Route path="overdue" element={<OverdueBills />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </BillProvider>
  );
}
