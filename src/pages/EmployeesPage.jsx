import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  LayoutGrid, 
  Table, 
  Mail, 
  Eye,
  Plane
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export default function EmployeesPage({ onAddClick, onSelectEmployee }) {
  const { employees } = useData();
  const { isHROfficer } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

  const departments = ['All', 'Engineering', 'Human Resources', 'Administration'];

  const filteredEmployees = employees.filter(emp => {
    const name = emp.name || '';
    const email = emp.email || '';
    const jobPosition = emp.job_position || emp.jobPosition || '';
    const empCode = emp.emp_code || emp.empCode || '';
    const dept = emp.department || '';

    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'All' || dept === selectedDept;

    return matchesSearch && matchesDept;
  });

  const getStatusBadge = (status) => {
    if (status === 'Present') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60" title="Employee Present">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>Present</span>
        </span>
      );
    } else if (status === 'On Leave') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200/60" title="Employee On Leave">
          <Plane className="h-3 w-3 text-indigo-600" />
          <span>On Leave</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200/60" title="Employee Absent">
          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          <span>Absent</span>
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employees Directory</h1>
          <p className="text-sm text-slate-500">Workforce directory, status indicators, and department cards.</p>
        </div>

        {isHROfficer && (
          <button 
            onClick={onAddClick}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition transform active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>NEW Employee</span>
          </button>
        )}
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, position or code..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center space-x-1 overflow-x-auto py-1">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedDept === dept
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <Table className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or Table */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Employees Found</h3>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => (
            <div 
              key={emp.id} 
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
              onClick={() => onSelectEmployee && onSelectEmployee(emp)}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    {emp.avatar_url && emp.avatar_url.startsWith('data:') ? (
                      <img src={emp.avatar_url} alt={emp.name} className="h-12 w-12 rounded-2xl object-cover border border-slate-200 shadow-xs" />
                    ) : (
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
                        {emp.name ? emp.name.substring(0, 2).toUpperCase() : 'EM'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">{emp.name}</h3>
                      <span className="text-xs font-medium text-slate-500 block">{emp.job_position || emp.jobPosition}</span>
                    </div>
                  </div>
                  {getStatusBadge(emp.status)}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Emp Code:</span>
                    <span className="font-mono font-semibold text-slate-700">{emp.emp_code || emp.empCode || 'EMP-1001'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Department:</span>
                    <span className="font-semibold text-slate-700">{emp.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Email:</span>
                    <span className="truncate max-w-[180px] font-medium text-slate-700">{emp.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 text-slate-700 text-xs font-semibold transition">
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Details Profile</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Emp Code</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Position</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition cursor-pointer" onClick={() => onSelectEmployee && onSelectEmployee(emp)}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                          {emp.name ? emp.name.substring(0, 2).toUpperCase() : 'EM'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{emp.name}</p>
                          <p className="text-xs text-slate-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold">{emp.emp_code || emp.empCode}</td>
                    <td className="py-3.5 px-4 font-medium">{emp.department}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{emp.job_position || emp.jobPosition}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(emp.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-xs text-indigo-600 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition">
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
