import React, { useState } from 'react';
import { X, CalendarDays, Upload, ArrowRight, Paperclip, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function TimeOffModal({ onClose, onSubmitSuccess }) {
  const { currentUser } = useAuth();
  const { submitTimeOffRequest } = useData();

  const [timeOffType, setTimeOffType] = useState('Paid time off');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [allocationDays, setAllocationDays] = useState(1.0);
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await submitTimeOffRequest({
        employeeId: currentUser.id,
        timeOffType,
        startDate,
        endDate,
        allocationDays,
        attachmentUrl
      });
      if (onSubmitSuccess) onSubmitSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachmentUrl(file.name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">New Time Off Request</h3>
            <p className="text-xs text-slate-500">Submit leave for HR & Admin approval</p>
          </div>
        </div>

        {error && <div className="mb-4 text-xs font-semibold text-rose-700 bg-rose-50 p-3 rounded-2xl">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Employee</label>
            <input
              type="text"
              readOnly
              value={currentUser?.name || 'Padmesh T'}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Time Off Type</label>
            <select
              value={timeOffType}
              onChange={(e) => setTimeOffType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option>Paid time off</option>
              <option>Sick Leave</option>
              <option>Unpaid Leaves</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Allocation Days</label>
            <input
              type="number"
              step="0.5"
              value={allocationDays}
              onChange={(e) => setAllocationDays(parseFloat(e.target.value) || 1.0)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Attachment (For Sick Leave Certificate)</label>
            <label className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition">
              <span className="text-slate-500 truncate flex items-center space-x-1.5">
                <Paperclip className="h-4 w-4 text-indigo-600" />
                <span>{attachmentUrl || 'Upload certificate/document...'}</span>
              </span>
              <Upload className="h-4 w-4 text-slate-400 shrink-0" />
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
