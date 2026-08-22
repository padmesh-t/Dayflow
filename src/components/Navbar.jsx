import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Clock, 
  CalendarDays, 
  UserCircle,
  ShieldCheck,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { currentUser, currentRole, setRole, switchUser } = useAuth();
  const { employees } = useData();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const tabs = [
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'timeoff', label: 'Time Off', icon: CalendarDays },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
  ];

  const roles = ['Admin', 'HR Officer', 'Employee'];

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
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
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

          {/* User Profile & Role Switcher Badge */}
          <div className="flex items-center space-x-3 relative">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-800">{currentUser?.name || 'Padmesh T'}</span>
              <span className="text-[11px] text-slate-500 font-medium">{currentUser?.jobPosition || 'Software Engineer'}</span>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 border border-slate-200/80 transition-all cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                <span className="capitalize">{currentRole}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Switch View Role</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {roles.map(r => (
                        <button
                          key={r}
                          onClick={() => { setRole(r); setShowRoleDropdown(false); }}
                          className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                            currentRole === r 
                              ? 'bg-indigo-600 text-white font-semibold' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-3 py-1.5 border-t border-slate-100 mt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Logged In As</span>
                    <div className="mt-1.5 space-y-1">
                      {employees.map(emp => (
                        <button
                          key={emp.id}
                          onClick={() => {
                            switchUser(emp, emp.jobPosition.includes('HR') ? 'HR Officer' : emp.jobPosition.includes('Admin') ? 'Admin' : 'Employee');
                            setShowRoleDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition ${
                            currentUser?.id === emp.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="truncate">
                            <p className="truncate font-medium">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{emp.jobPosition}</p>
                          </div>
                          {currentUser?.id === emp.id && <UserCheck className="h-3.5 w-3.5 text-indigo-600 shrink-0 ml-1" />}
                        </button>
                      ))}
                    </div>
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
