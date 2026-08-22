import React, { useState } from 'react';
import { X, UserPlus, Sparkles, CheckCircle2, Copy, Upload, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AddEmployeeModal({ onClose, onAddSuccess }) {
  const { authHeaders } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [jobPosition, setJobPosition] = useState('Software Engineer');
  const [monthlyWage, setMonthlyWage] = useState(100000);
  const [role, setRole] = useState('Employee');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdResult, setCreatedResult] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name,
          email,
          phone,
          department,
          jobPosition,
          monthlyWage,
          role,
          avatar_url: avatarUrl,
          dateOfJoining: new Date().toISOString().split('T')[0]
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create employee');

      setCreatedResult(data);
      if (onAddSuccess) onAddSuccess(data.employee);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {!createdResult ? (
          <>
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Add New Employee</h3>
                <p className="text-xs text-slate-500">Auto-generates Login ID & temporary password</p>
              </div>
            </div>

            {error && <div className="mb-4 text-xs font-semibold text-rose-700 bg-rose-50 p-3 rounded-2xl">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              
              {/* Profile Picture Upload */}
              <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Preview" className="h-12 w-12 rounded-xl object-cover border border-slate-200 shadow-xs" />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {name ? name.substring(0, 2).toUpperCase() : 'EMP'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-2xs cursor-pointer text-xs transition">
                    <Camera className="h-3.5 w-3.5 text-indigo-600" />
                    <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">Optional profile picture (PNG, JPG)</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option>Engineering</option>
                    <option>Human Resources</option>
                    <option>Administration</option>
                    <option>Marketing</option>
                    <option>Sales</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Job Position</label>
                  <input
                    type="text"
                    value={jobPosition}
                    onChange={(e) => setJobPosition(e.target.value)}
                    placeholder="e.g. Senior Developer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Monthly Wage (₹)</label>
                  <input
                    type="number"
                    value={monthlyWage}
                    onChange={(e) => setMonthlyWage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Access Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option>Employee</option>
                    <option>HR Officer</option>
                    <option>Admin</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-md shadow-indigo-200"
                >
                  {loading ? 'Creating Employee...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* SUCCESS RESULT BOX WITH AUTO-GENERATED LOGIN ID & TEMP PASSWORD */
          <div className="text-center py-4 space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Employee Created Successfully!</h3>
            <p className="text-xs text-slate-500">Welcome credentials sent to {createdResult.employee.email}</p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 text-left">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Auto Login ID:</span>
                <span className="font-mono font-extrabold text-indigo-600 text-sm">{createdResult.loginId}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Temporary Password:</span>
                <span className="font-mono font-bold text-slate-900">{createdResult.tempPassword}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
            >
              Done & Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
