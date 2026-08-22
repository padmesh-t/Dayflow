import React, { useState } from 'react';
import { 
  CalendarDays, Plus, CheckCircle, XCircle, Clock, Calendar as CalendarIcon, Filter, Check, X, Shield, Search
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import TimeOffModal from '../components/TimeOffModal';

export default function TimeOffPage() {
  const { timeOffRequests, updateTimeOffStatus, fetchTimeOff, fetchEmployees, employees } = useData();
  const { currentUser, isHROfficer } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState('timeoff'); // 'timeoff' or 'allocation'
  const [searchQuery, setSearchQuery] = useState('');
  const [msg, setMsg] = useState('');

  const publicHolidays = [
    { date: 'Jan 14, 2026', name: 'Kite Festival' },
    { date: 'Jan 26, 2026', name: 'Republic Day' },
    { date: 'Mar 04, 2026', name: 'Bhukti' },
    { date: 'Aug 15, 2026', name: 'Independence Day' },
    { date: 'Aug 28, 2026', name: 'Rakhi' },
    { date: 'Oct 02, 2026', name: 'Gandhi Jayanti' },
    { date: 'Nov 08, 2026', name: 'Diwali' },
    { date: 'Nov 10, 2026', name: 'New Year' },
    { date: 'Nov 11, 2026', name: 'Bhai Duj' },
  ];

  const handleApprove = async (id) => {
    try {
      await updateTimeOffStatus(id, 'Validated');
      setMsg('Time off request approved successfully.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await updateTimeOffStatus(id, 'Refused');
      setMsg('Time off request rejected.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const myRequests = timeOffRequests.filter(r => r.employee_id === currentUser?.id || r.empId === currentUser?.id);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Time Off & Leaves Management</h1>
          <p className="text-sm text-slate-500">Request leave allocations, view approval calendar, and manage holidays.</p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition transform active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>NEW Request</span>
        </button>
      </div>

      {msg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-bold">{msg}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(() => {
          const myApprovedReqs = timeOffRequests.filter(r => (r.employee_id === currentUser?.id || r.empId === currentUser?.id) && (r.status === 'Validated' || r.status === 'Approved'));
          const usedPaid = myApprovedReqs.filter(r => {
            const t = (r.time_off_type || '').toLowerCase();
            return !t.includes('sick') && !t.includes('medical');
          }).reduce((acc, curr) => acc + Number(curr.allocation_days || 1), 0);
          const usedSick = myApprovedReqs.filter(r => {
            const t = (r.time_off_type || '').toLowerCase();
            return t.includes('sick') || t.includes('medical');
          }).reduce((acc, curr) => acc + Number(curr.allocation_days || 1), 0);

          const paidAvail = Math.max(0, 24 - usedPaid);
          const sickAvail = Math.max(0, 7 - usedSick);
          return (
            <>
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-6 rounded-3xl shadow-lg border border-indigo-500 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider opacity-80">Paid Time Off</span>
                  <p className="text-3xl font-black mt-1">{paidAvail} Days Available</p>
                  <span className="text-xs opacity-90 mt-2 block font-medium">{usedPaid} days approved out of 24 allocated</span>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                  <CalendarDays className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-indigo-800 text-white p-6 rounded-3xl shadow-lg border border-purple-500 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider opacity-80">Sick Time Off</span>
                  <p className="text-3xl font-black mt-1">{sickAvail} Days Available</p>
                  <span className="text-xs opacity-90 mt-2 block font-medium">{usedSick} days approved out of 7 allocated</span>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                  <CalendarIcon className="h-6 w-6" />
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* ADMIN & HR OFFICER APPROVAL & ALLOCATION SECTION */}
      {isHROfficer && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          
          {/* Sub-Tabs: Time Off | Allocation */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center space-x-2 bg-slate-200/70 p-1 rounded-xl">
              <button
                onClick={() => setAdminSubTab('timeoff')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  adminSubTab === 'timeoff' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Time Off Requests</span>
              </button>
              <button
                onClick={() => setAdminSubTab('allocation')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  adminSubTab === 'allocation' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Allocation Management</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-xl shrink-0">
                {timeOffRequests.filter(r => r.status === 'Pending').length} Pending
              </span>
            </div>
          </div>

          {/* SUB-TAB 1: TIME OFF REQUESTS APPROVAL TABLE */}
          {adminSubTab === 'timeoff' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Start Date</th>
                    <th className="py-3 px-4">End Date</th>
                    <th className="py-3 px-4">Time Off Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Approve / Reject Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-xs">
                  {timeOffRequests
                    .filter(r => !searchQuery || (r.employee_name || r.empName || '').toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {req.employee_name || req.empName || 'Employee'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">{req.start_date || req.startDate}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold">{req.end_date || req.endDate}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{req.time_off_type || req.timeOffType}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          req.status === 'Validated' || req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                          req.status === 'Refused' || req.status === 'Rejected' ? 'bg-rose-50 text-rose-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          <span>{req.status === 'Validated' ? 'Validated (Approved)' : req.status === 'Refused' ? 'Refused (Rejected)' : 'Pending Approval'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {req.status === 'Pending' ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleReject(req.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                              title="Reject ❌"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition cursor-pointer"
                              title="Approve ✅"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-semibold">Action Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SUB-TAB 2: ALLOCATION MANAGEMENT TABLE */}
          {adminSubTab === 'allocation' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Paid Leave Balance</th>
                    <th className="py-3 px-4">Sick Leave Balance</th>
                    <th className="py-3 px-4">Used Leaves This Year</th>
                    <th className="py-3 px-4 text-right">Total Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-xs">
                  {employees
                    .filter(e => !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(emp => {
                      const empReqs = timeOffRequests.filter(r => (r.employee_id === emp.id || r.empId === emp.id) && (r.status === 'Validated' || r.status === 'Approved'));
                      const usedPaid = empReqs.filter(r => {
                        const t = (r.time_off_type || '').toLowerCase();
                        return !t.includes('sick') && !t.includes('medical');
                      }).reduce((acc, curr) => acc + Number(curr.allocation_days || 1), 0);
                      const usedSick = empReqs.filter(r => {
                        const t = (r.time_off_type || '').toLowerCase();
                        return t.includes('sick') || t.includes('medical');
                      }).reduce((acc, curr) => acc + Number(curr.allocation_days || 1), 0);
                      const paidBal = Math.max(0, 24 - usedPaid);
                      const sickBal = Math.max(0, 7 - usedSick);
                      const totalUsed = usedPaid + usedSick;
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {emp.name}
                            <span className="block text-[11px] font-normal text-slate-400">{emp.department} • {emp.login_id || emp.loginId}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-indigo-600">{paidBal} Days Left</span>
                            <span className="block text-[11px] text-slate-400 font-medium">{usedPaid} used / 24 total</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-purple-600">{sickBal} Days Left</span>
                            <span className="block text-[11px] text-slate-400 font-medium">{usedSick} used / 7 total</span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">{totalUsed} Days Used</td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 text-sm">
                            {paidBal + sickBal} Days Available
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* EMPLOYEE CALENDAR & HOLIDAYS VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Legend & Requests List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-wrap justify-between items-center mb-4 border-b border-slate-100 pb-3 gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Time Off Status Legend & Calendar</h3>
              <div className="flex items-center space-x-3 text-xs font-semibold">
                <span className="flex items-center space-x-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span><span>Validated</span></span>
                <span className="flex items-center space-x-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span><span>To Approve</span></span>
                <span className="flex items-center space-x-1"><span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span><span>Refused</span></span>
              </div>
            </div>

            {/* Year-round calendar month cards */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              {months.map((m, idx) => {
                const monthNumStr = String(idx + 1).padStart(2, '0');
                const validatedLeaves = myRequests.filter(r => (r.start_date || '').includes(`-${monthNumStr}-`) && (r.status === 'Validated' || r.status === 'Approved'));
                const pendingLeaves = myRequests.filter(r => (r.start_date || '').includes(`-${monthNumStr}-`) && r.status === 'Pending');
                const refusedLeaves = myRequests.filter(r => (r.start_date || '').includes(`-${monthNumStr}-`) && (r.status === 'Refused' || r.status === 'Rejected'));

                return (
                  <div key={m} className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between h-20 hover:border-indigo-300 transition">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">{m} 2026</span>
                      <span className="text-[10px] text-slate-400 font-mono">M{idx+1}</span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      {validatedLeaves.length > 0 && (
                        <span className="h-4 px-1.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold flex items-center justify-center" title={`${validatedLeaves.length} Approved`}>
                          {validatedLeaves.length} ✓
                        </span>
                      )}
                      {pendingLeaves.length > 0 && (
                        <span className="h-4 px-1.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold flex items-center justify-center" title={`${pendingLeaves.length} Pending`}>
                          {pendingLeaves.length} ⏳
                        </span>
                      )}
                      {refusedLeaves.length > 0 && (
                        <span className="h-4 px-1.5 bg-rose-100 text-rose-800 rounded-md text-[10px] font-bold flex items-center justify-center" title={`${refusedLeaves.length} Refused`}>
                          {refusedLeaves.length} ✕
                        </span>
                      )}
                      {validatedLeaves.length === 0 && pendingLeaves.length === 0 && refusedLeaves.length === 0 && (
                        <span className="text-[10px] text-slate-300 italic">No leaves</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* My Requests List */}
            <div className="space-y-2">
              {myRequests.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  No time off requests submitted yet. Click "NEW Request" above to submit one.
                </p>
              ) : (
                myRequests.map(r => (
                  <div key={r.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs hover:bg-slate-100/60 transition">
                    <div>
                      <span className="font-bold text-slate-900 block">{r.time_off_type || r.timeOffType}</span>
                      <span className="text-slate-500 font-mono">{r.validity_period || `${r.startDate || r.start_date} to ${r.endDate || r.end_date}`} • {r.allocation_days || 1} Days</span>
                    </div>
                    <span className={`font-bold px-3 py-1 rounded-full ${
                      r.status === 'Validated' || r.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      r.status === 'Refused' || r.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {r.status || 'Pending'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Public Holidays Panel */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-purple-600" />
            <span>Public Holidays (2026)</span>
          </h3>

          <div className="space-y-2 text-xs">
            {publicHolidays.map((h, i) => (
              <div key={i} className="p-2.5 bg-slate-50 rounded-xl flex justify-between items-center">
                <span className="font-bold text-slate-800">{h.name}</span>
                <span className="font-mono text-purple-600 font-semibold">{h.date}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {showModal && (
        <TimeOffModal
          onClose={() => setShowModal(false)}
          onSubmitSuccess={() => {
            fetchTimeOff();
            fetchEmployees();
          }}
        />
      )}

    </div>
  );
}
