import React from 'react';
import { User, Shield, CreditCard, Building, Phone, Mail, Calendar, Key, MapPin } from 'lucide-react';

export default function MyProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-slate-500">Personal information, security, bank details, and salary info.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        <div className="h-24 w-24 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-indigo-100">
          PT
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-bold text-slate-900">Padmesh T</h2>
          <p className="text-sm text-indigo-600 font-medium">Software Engineer • IT Department</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3 text-xs text-slate-500">
            <span className="flex items-center space-x-1"><Mail className="h-3.5 w-3.5" /> padmesh.t01@gmail.com</span>
            <span className="flex items-center space-x-1"><Phone className="h-3.5 w-3.5" /> +91 98765 43210</span>
            <span className="flex items-center space-x-1"><MapPin className="h-3.5 w-3.5" /> Chennai, India</span>
          </div>
        </div>
      </div>
    </div>
  );
}
