import React from 'react';
import { CalendarDays, Plus } from 'lucide-react';

export default function TimeOffPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Time Off & Leaves</h1>
          <p className="text-sm text-slate-500">Request paid or sick leave and view approval status.</p>
        </div>
        <button className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all">
          <Plus className="h-4 w-4" />
          <span>New Time Off Request</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-2xl shadow-sm">
          <span className="text-xs uppercase font-bold tracking-wider opacity-80">Paid Time Off</span>
          <p className="text-3xl font-extrabold mt-1">24 Days</p>
          <span className="text-xs opacity-90 mt-2 block">Available for ongoing period</span>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-6 rounded-2xl shadow-sm">
          <span className="text-xs uppercase font-bold tracking-wider opacity-80">Sick Time Off</span>
          <p className="text-3xl font-extrabold mt-1">07 Days</p>
          <span className="text-xs opacity-90 mt-2 block">Available for ongoing period</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
        <CalendarDays className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800">Time Off Management Ready</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          Interactive leave request forms & HR approval controls will be enabled in Phase 4.
        </p>
      </div>
    </div>
  );
}
