import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Clock, 
  CalendarDays, 
  UserCircle,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Play,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { currentUser, currentRole, logout } = useAuth();
  const { attendance, checkIn, checkOut } = useData();
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const tabs = [
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'timeoff', label: 'Time Off', icon: CalendarDays },
  ];

  // Check if current user is checked in today
  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayRecord = (attendance || []).find(a => a.employee_id === currentUser?.id && a.date === todayStr);
  const isCheckedIn = !!userTodayRecord && !userTodayRecord.check_out;

  const handleCheckInToggle = async () => {
    if (!currentUser?.id || actionLoading) return;
    setActionLoading(true);
    try {
      if (!isCheckedIn) {
        await checkIn(currentUser.id);
      } else {
        await checkOut(currentUser.id);
      }
    } catch (err) {
      alert(err.message || 'Attendance action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('employees')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                Dayflow
              </span>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                HR & Payroll Hub
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs ring-1 ring-indigo-200/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions: Check In/Out + Status + Role + Avatar */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative">
            
            {/* Top-Right Corner Check-In / Check-Out Toggle Button */}
            {!isCheckedIn ? (
              <button
                onClick={handleCheckInToggle}
                disabled={actionLoading}
                className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition transform active:scale-95 cursor-pointer disabled:opacity-50"
                title="Click to Check In for today"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Check In →</span>
              </button>
            ) : (
              <button
                onClick={handleCheckInToggle}
                disabled={actionLoading}
                className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition transform active:scale-95 cursor-pointer disabled:opacity-50"
                title={`Checked in at ${userTodayRecord?.check_in}. Click to Check Out`}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Check Out ({userTodayRecord?.check_in || 'Now'}) →</span>
              </button>
            )}


            {/* Role Badge */}
            <span className="hidden lg:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span>{currentRole}</span>
            </span>

            {/* User Avatar Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowAvatarDropdown(!showAvatarDropdown)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showAvatarDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-sm text-slate-900 truncate">{currentUser?.name}</p>
                    <p className="text-[11px] font-mono text-indigo-600 font-semibold mt-0.5">{currentUser?.login_id || currentUser?.loginId || 'OIADMI20250001'}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{currentUser?.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setShowAvatarDropdown(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer"
                    >
                      <UserCircle className="h-4 w-4 text-slate-400" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setShowAvatarDropdown(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
