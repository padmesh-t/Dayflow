import React, { useState } from 'react';
import { 
  Clock, Calendar, CheckCircle2, ChevronLeft, ChevronRight, Search, Filter, AlertCircle, LogOut, Play
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export default function AttendancePage() {
  const { attendance, checkIn, checkOut } = useData();
  const { currentUser, isHROfficer } = useAuth();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }));
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Check if current user is checked in today
  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayRecord = attendance.find(a => a.employee_id === currentUser?.id && a.date === todayStr);
  const isCheckedIn = !!userTodayRecord && !userTodayRecord.check_out;

  const handleCheckIn = async () => {
    setMsg('');
    setError('');
    setLoading(true);
    try {
      const res = await checkIn(currentUser.id);
      setMsg(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setMsg('');
    setError('');
    setLoading(true);
    try {
      const res = await checkOut(currentUser.id);
      setMsg(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter logs for employee view or admin view
  const myLogs = attendance.filter(a => a.employee_id === currentUser?.id);
  const dateLogs = attendance.filter(a => a.date === selectedDate || !selectedDate);

  return (
    <div className="space-y-6">
      
      {/* Header & Check-In / Check-Out Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance Tracking</h1>
          <p className="text-xs text-indigo-200 mt-1">
            Log working hours, view day-wise logs, and monitor company attendance.
          </p>
        </div>

        {/* Live Check-In / Check-Out Button */}
        <div className="flex items-center space-x-3 bg-white/10 p-2.5 rounded-2xl border border-white/10 backdrop-blur-xs">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block">Status</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center justify-end space-x-1">
              <span className={`h-2 w-2 rounded-full ${isCheckedIn ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{isCheckedIn ? `Checked In (${userTodayRecord?.check_in})` : 'Checked Out'}</span>
            </span>
          </div>

          {!isCheckedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Check In →</span>
            </button>
          ) : (
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="inline-flex items-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Check Out →</span>
            </button>
          )}
        </div>
      </div>

      {msg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-bold">{msg}</div>}
      {error && <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-bold">{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Count of Days Present</span>
            <p className="text-2xl font-extrabold text-slate-900">{myLogs.length > 0 ? myLogs.length : 22} Days</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leaves Count</span>
            <p className="text-2xl font-extrabold text-slate-900">02 Days</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Working Days</span>
            <p className="text-2xl font-extrabold text-slate-900">24 Days</p>
          </div>
        </div>
      </div>

      {/* Attendance Logs Table (Admin/HR vs Employee) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        
        {/* Table Controls Header */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            <span>{isHROfficer ? 'All Employee Attendance Records' : 'My Day-Wise Attendance'}</span>
          </h3>

          <div className="flex items-center space-x-2">
            {isHROfficer && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
              />
            )}
            <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              {selectedMonth}
            </span>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200 tracking-wider">
              <tr>
                {isHROfficer && <th className="py-3 px-4">Employee</th>}
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Work Hours</th>
                <th className="py-3 px-4">Extra Hours</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-xs">
              {(isHROfficer ? dateLogs : myLogs).map((rec, idx) => (
                <tr key={rec.id || idx} className="hover:bg-slate-50/60 transition">
                  {isHROfficer && (
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {rec.employee_name || rec.empName || 'Employee'}
                    </td>
                  )}
                  <td className="py-3 px-4 font-mono font-semibold text-slate-700">{rec.date}</td>
                  <td className="py-3 px-4 text-slate-800 font-semibold">{rec.check_in || rec.checkIn || '10:00'}</td>
                  <td className="py-3 px-4 text-slate-800 font-semibold">{rec.check_out || rec.checkOut || '19:00'}</td>
                  <td className="py-3 px-4 font-mono text-indigo-600 font-bold">{rec.work_hours || rec.workHours || '09:00'}</td>
                  <td className="py-3 px-4 font-mono text-purple-600 font-bold">{rec.extra_hours || rec.extraHours || '01:00'}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                      <span>Present</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
