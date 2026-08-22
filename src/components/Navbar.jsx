import React from 'react';
import { 
  Building2, 
  Users, 
  Clock, 
  CalendarDays, 
  UserCircle,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentRole, setRole, currentUser }) {
  const tabs = [
    { id: 'employees', label: 'Employees', icon: Users, roleRequired: 'all' },
    { id: 'attendance', label: 'Attendance', icon: Clock, roleRequired: 'all' },
    { id: 'timeoff', label: 'Time Off', icon: CalendarDays, roleRequired: 'all' },
    { id: 'profile', label: 'My Profile', icon: UserCircle, roleRequired: 'all' },
  ];

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
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-800">{currentUser?.name || 'Padmesh T'}</span>
              <span className="text-[11px] text-slate-500 font-medium">{currentUser?.jobPosition || 'Software Engineer'}</span>
            </div>
            
            <div className="relative group">
              <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 border border-slate-200/80 transition-all">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                <span className="capitalize">{currentRole}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
