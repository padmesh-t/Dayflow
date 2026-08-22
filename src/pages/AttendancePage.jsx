import React from 'react';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Tracking</h1>
        <p className="text-sm text-slate-500">Day-wise attendance tracking, check-ins, work hours, and extra hours.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Days Present</span>
            <p className="text-2xl font-bold text-slate-900">22 Days</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Leaves Count</span>
            <p className="text-2xl font-bold text-slate-900">02 Days</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Working Days</span>
            <p className="text-2xl font-bold text-slate-900">24 Days</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
        <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800">Attendance Module Online</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          Day-wise logs and Check-in/Check-out system will be populated in Phase 3.
        </p>
      </div>
    </div>
  );
}
