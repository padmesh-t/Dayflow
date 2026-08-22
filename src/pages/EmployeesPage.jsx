import React from 'react';
import { Users, Search, Plus, Filter } from 'lucide-react';

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employees Directory</h1>
          <p className="text-sm text-slate-500">Manage employee details, positions, and company profiles.</p>
        </div>
        <button className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all">
          <Plus className="h-4 w-4" />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, job position or employee code..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <button className="inline-flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200/80 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 transition">
            <Filter className="h-4 w-4 text-slate-500" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
        <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800">Employee System Loaded</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          Full directory listing, search filters, and profile drawer will be attached in Phase 2.
        </p>
      </div>
    </div>
  );
}
