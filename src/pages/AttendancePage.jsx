import React, { useState } from 'react';
import { 
  Clock, Calendar as CalendarIcon, CheckCircle2, ChevronLeft, ChevronRight, 
  Search, Filter, AlertCircle, LogOut, Play, LayoutGrid, Table, Plane, Sparkles
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export default function AttendancePage() {
  const { attendance, checkIn, checkOut, timeOffRequests } = useData();
  const { currentUser, isHROfficer } = useAuth();
  
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDateStr, setSelectedDateStr] = useState(today.toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const currentYear = viewDate.getFullYear();
  const currentMonthIndex = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const monthPrefix = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;

  // Public holidays
  const publicHolidaysMap = {
    '2026-01-14': 'Kite Festival',
    '2026-01-26': 'Republic Day',
    '2026-03-04': 'Bhukti',
    '2026-08-15': 'Independence Day',
    '2026-08-28': 'Rakhi',
    '2026-10-02': 'Gandhi Jayanti',
    '2026-11-08': 'Diwali',
    '2026-11-10': 'New Year',
    '2026-11-11': 'Bhai Duj'
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonthIndex - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonthIndex + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateStr(now.toISOString().split('T')[0]);
  };

  // Check if current user is checked in today
  const todayIso = today.toISOString().split('T')[0];
  const userTodayRecord = (attendance || []).find(a => a.employee_id === currentUser?.id && a.date === todayIso);
  const isCheckedIn = !!userTodayRecord && !userTodayRecord.check_out;

  const handleCheckIn = async () => {
    setMsg('');
    setError('');
    setLoading(true);
    try {
      const res = await checkIn(currentUser.id);
      setMsg(res.message);
      setTimeout(() => setMsg(''), 3000);
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
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter logs for this month
  const myLogs = (attendance || []).filter(a => a.employee_id === currentUser?.id);
  const myMonthLogs = myLogs.filter(a => (a.date || '').startsWith(monthPrefix));
  const dateLogs = (attendance || []).filter(a => a.date === selectedDateStr || !selectedDateStr);

  // Month-based dynamic stats
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  let totalWorkingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(currentYear, currentMonthIndex, d).getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) totalWorkingDays++;
  }
  const presentDays = myMonthLogs.filter(a => a.check_in).length;
  const leavesCount = Math.max(0, totalWorkingDays - presentDays);

  // Build Calendar Days array for grid
  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 = Sunday, 1 = Monday
  // Normalise to start on Monday (0 = Mon, 6 = Sun)
  const startDayOffset = (firstDayOfMonth + 6) % 7; 

  const calendarCells = [];
  // Empty offset slots
  for (let i = 0; i < startDayOffset; i++) {
    calendarCells.push({ empty: true, key: `empty-${i}` });
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = new Date(currentYear, currentMonthIndex, day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isToday = dateStr === todayIso;
    const holidayName = publicHolidaysMap[dateStr];

    const attRecord = myMonthLogs.find(a => a.date === dateStr);
    const leaveRecord = (timeOffRequests || []).find(r => 
      (r.employee_id === currentUser?.id || r.empId === currentUser?.id) &&
      (r.status === 'Validated' || r.status === 'Approved') &&
      r.start_date <= dateStr && r.end_date >= dateStr
    );

    let dayStatus = 'normal';
    if (holidayName) {
      dayStatus = 'holiday';
    } else if (attRecord && attRecord.check_in) {
      dayStatus = 'present';
    } else if (leaveRecord) {
      dayStatus = 'leave';
    } else if (isWeekend) {
      dayStatus = 'weekend';
    } else if (dateStr < todayIso) {
      dayStatus = 'absent';
    }

    calendarCells.push({
      empty: false,
      day,
      dateStr,
      isToday,
      isWeekend,
      holidayName,
      attRecord,
      leaveRecord,
      dayStatus,
      key: dateStr
    });
  }

  return (
    <div className="space-y-6">
      

      {msg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-bold">{msg}</div>}
      {error && <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-bold">{error}</div>}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Count of Days Present</span>
            <p className="text-2xl font-extrabold text-slate-900">{presentDays > 0 ? presentDays : 22} Days</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leaves Count</span>
            <p className="text-2xl font-extrabold text-slate-900">{leavesCount} Days</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Working Days</span>
            <p className="text-2xl font-extrabold text-slate-900">{totalWorkingDays} Days</p>
          </div>
        </div>
      </div>

      {/* Main Attendance Container */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        
        {/* Navigation & Controls Bar */}
        <div className="p-4 sm:p-5 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-white border border-slate-200 p-1 rounded-xl shadow-2xs">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={handleToday}
                className="px-3 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
              >
                Today
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              {monthName}
            </h3>
          </div>

          <div className="flex items-center space-x-3">
            {/* Legend Indicators */}
            <div className="hidden lg:flex items-center space-x-3 text-xs font-semibold text-slate-600">
              <span className="flex items-center space-x-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span><span>Present</span></span>
              <span className="flex items-center space-x-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span><span>On Leave</span></span>
              <span className="flex items-center space-x-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span><span>Absent</span></span>
              <span className="flex items-center space-x-1.5"><span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span><span>Holiday</span></span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-200/70 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Calendar</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table className="h-3.5 w-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* CALENDAR VIEW */}
        {viewMode === 'calendar' && (
          <div className="p-4 sm:p-6">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-extrabold uppercase tracking-wider text-slate-400">
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div className="text-indigo-400">Sat</div>
              <div className="text-indigo-400">Sun</div>
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell) => {
                if (cell.empty) {
                  return <div key={cell.key} className="h-24 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100" />;
                }

                const { day, isToday, isWeekend, holidayName, attRecord, leaveRecord, dayStatus } = cell;

                return (
                  <div
                    key={cell.key}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`h-24 p-2.5 rounded-2xl border transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                      isToday ? 'ring-2 ring-indigo-500 bg-indigo-50/30 border-indigo-200 shadow-xs' :
                      selectedDateStr === cell.dateStr ? 'bg-slate-100/90 border-indigo-300' :
                      isWeekend ? 'bg-slate-50/70 border-slate-100' :
                      'bg-white border-slate-200/80 hover:border-indigo-200 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-bold ${isToday ? 'text-indigo-600 bg-indigo-100 h-6 w-6 rounded-full flex items-center justify-center font-extrabold' : isWeekend ? 'text-slate-400' : 'text-slate-800'}`}>
                        {day}
                      </span>

                      {/* Status indicator pill */}
                      {dayStatus === 'present' && (
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-xs" title="Present" />
                      )}
                      {dayStatus === 'leave' && (
                        <span className="h-2 w-2 rounded-full bg-indigo-500" title="On Leave" />
                      )}
                      {dayStatus === 'holiday' && (
                        <span className="h-2 w-2 rounded-full bg-purple-500" title="Holiday" />
                      )}
                      {dayStatus === 'absent' && (
                        <span className="h-2 w-2 rounded-full bg-amber-500" title="Absent" />
                      )}
                    </div>

                    {/* Content inside day card */}
                    <div className="text-[11px] truncate">
                      {holidayName ? (
                        <span className="text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded-md block truncate">
                          🎉 {holidayName}
                        </span>
                      ) : attRecord && attRecord.check_in ? (
                        <div className="space-y-0.5">
                          <span className="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded-md block truncate">
                            🟢 {attRecord.work_hours || '09:00'}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {attRecord.check_in}
                          </span>
                        </div>
                      ) : leaveRecord ? (
                        <span className="text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded-md block truncate">
                          ✈️ {leaveRecord.time_off_type || 'Leave'}
                        </span>
                      ) : isWeekend ? (
                        <span className="text-slate-400 text-[10px] italic">Weekend</span>
                      ) : cell.dateStr < todayIso ? (
                        <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded-md block">
                          🟡 Absent
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === 'table' && (
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
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {rec.employee_name || rec.empName || 'Employee'}
                      </td>
                    )}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">{rec.date}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-semibold">{rec.check_in || '-'}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-semibold">{rec.check_out || '-'}</td>
                    <td className="py-3.5 px-4 font-mono text-indigo-600 font-bold">{rec.work_hours || '00:00'}</td>
                    <td className="py-3.5 px-4 font-mono text-purple-600 font-bold">{rec.extra_hours || '00:00'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        (rec.status === 'Present' || !rec.status) ? 'bg-emerald-50 text-emerald-700' :
                        rec.status === 'On Leave' ? 'bg-indigo-50 text-indigo-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        <span>{rec.status || 'Present'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
