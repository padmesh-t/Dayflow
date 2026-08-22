import React, { useState } from 'react';
import { ShieldCheck, Mail, ArrowRight, X, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OtpModal() {
  const { otpPendingEmail, demoOtpCode, verifyOtp, setOtpPendingEmail } = useAuth();
  const [otpInput, setOtpInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!otpPendingEmail) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(otpPendingEmail, otpInput);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
        
        <button
          onClick={() => setOtpPendingEmail(null)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mx-auto flex items-center justify-center mb-3">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Email 2FA Verification</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            We sent a 6-digit security code to <strong className="text-slate-800">{otpPendingEmail}</strong>.
          </p>
        </div>

        {/* Demo Simulated OTP Display Banner */}
        {demoOtpCode && (
          <div className="mt-4 bg-indigo-50/80 border border-indigo-200/80 p-3 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-indigo-800">
              <KeyRound className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>Simulated Mailer Code:</span>
            </div>
            <button
              type="button"
              onClick={() => setOtpInput(demoOtpCode)}
              className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg font-mono font-bold tracking-widest hover:bg-indigo-700 transition cursor-pointer"
            >
              {demoOtpCode} (Click to Fill)
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">
              Enter 6-Digit OTP Code
            </label>
            <input
              type="text"
              maxLength={6}
              required
              autoFocus
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="000000"
              className="block w-full text-center tracking-[0.5em] text-2xl font-mono py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otpInput.length < 6}
            className="w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
