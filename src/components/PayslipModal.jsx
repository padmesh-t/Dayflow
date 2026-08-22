import React, { useState, useEffect } from 'react';
import { X, Printer, Building2, ShieldCheck, Download, DollarSign } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function PayslipModal({ employee, onClose }) {
  const { fetchPayslip } = useData();
  const [payslipData, setPayslipData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employee) {
      fetchPayslip(employee.id)
        .then(data => {
          setPayslipData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [employee]);

  if (!employee) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 print:shadow-none print:border-none print:max-w-none print:w-full">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition print:hidden cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {loading || !payslipData ? (
          <div className="py-12 text-center text-sm text-slate-500 font-medium">Generating Monthly Payslip...</div>
        ) : (
          <div className="space-y-6 print:space-y-4">
            
            {/* Header / Brand */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Odoo India / Dayflow</h2>
                  <p className="text-xs text-slate-500">Official Monthly Salary Slip</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase font-extrabold text-indigo-600 tracking-wider">Payslip for October 2025</span>
                <p className="text-xs font-mono text-slate-400 mt-0.5">Generated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Employee Details Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-400 font-medium block">Employee Name:</span>
                <span className="font-bold text-slate-900">{payslipData.employee.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Login ID:</span>
                <span className="font-mono font-bold text-indigo-600">{payslipData.employee.loginId}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Emp Code:</span>
                <span className="font-mono font-bold text-slate-800">{payslipData.employee.empCode}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Department:</span>
                <span className="font-bold text-slate-800">{payslipData.employee.department}</span>
              </div>
            </div>

            {/* Attendance & Payable Days Summary */}
            <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 text-xs flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800">Total Working Days in Month:</span>
                <span className="ml-2 font-mono font-extrabold text-slate-900">{payslipData.attendanceSummary.totalDaysInMonth} Days</span>
              </div>
              <div>
                <span className="font-bold text-slate-800">Unpaid Leaves:</span>
                <span className="ml-2 font-mono font-bold text-rose-600">{payslipData.attendanceSummary.unpaidLeavesCount} Days</span>
              </div>
              <div>
                <span className="font-bold text-indigo-900">Total Payable Days:</span>
                <span className="ml-2 font-mono font-black text-indigo-700">{payslipData.attendanceSummary.payableDays} Days</span>
              </div>
            </div>

            {/* Salary Breakdown Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Earnings Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 p-2.5 font-bold text-slate-800 uppercase tracking-wider">Gross Earnings</div>
                <div className="p-3 space-y-2 divide-y divide-slate-100">
                  <div className="flex justify-between py-1"><span className="text-slate-600">Basic Salary (50%):</span><span className="font-bold">₹{payslipData.components.basic.toLocaleString()}</span></div>
                  <div className="flex justify-between py-1"><span className="text-slate-600">House Rent Allowance (HRA):</span><span className="font-bold">₹{payslipData.components.hra.toLocaleString()}</span></div>
                  <div className="flex justify-between py-1"><span className="text-slate-600">Standard Allowance:</span><span className="font-bold">₹{payslipData.components.stdAllowance.toLocaleString()}</span></div>
                  <div className="flex justify-between py-1"><span className="text-slate-600">Performance Bonus:</span><span className="font-bold">₹{payslipData.components.bonus.toLocaleString()}</span></div>
                  <div className="flex justify-between py-1"><span className="text-slate-600">Leave Travel Allowance (LTA):</span><span className="font-bold">₹{payslipData.components.lta.toLocaleString()}</span></div>
                  <div className="flex justify-between py-1"><span className="text-slate-600">Fixed Allowance:</span><span className="font-bold">₹{payslipData.components.fixedAllowance.toLocaleString()}</span></div>
                  <div className="flex justify-between pt-2 font-bold text-indigo-700 border-t border-slate-200"><span>Total Earnings:</span><span>₹{payslipData.grossEarnings.toLocaleString()}</span></div>
                </div>
              </div>

              {/* Deductions Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 p-2.5 font-bold text-slate-800 uppercase tracking-wider">Deductions</div>
                <div className="p-3 space-y-2 divide-y divide-slate-100">
                  <div className="flex justify-between py-1"><span className="text-slate-600">PF Employee Contribution (12%):</span><span className="font-bold text-slate-800">₹{payslipData.deductions.pfEmployee.toLocaleString()}</span></div>
                  <div className="flex justify-between py-1"><span className="text-slate-600">Professional Tax:</span><span className="font-bold text-slate-800">₹{payslipData.deductions.profTax.toLocaleString()}</span></div>
                  <div className="flex justify-between pt-2 font-bold text-rose-600 border-t border-slate-200"><span>Total Deductions:</span><span>₹{payslipData.deductions.totalDeductions.toLocaleString()}</span></div>
                </div>
              </div>

            </div>

            {/* Net Salary Payable Box */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl flex justify-between items-center shadow-lg">
              <div>
                <span className="text-xs uppercase font-extrabold text-indigo-300 tracking-wider">Net Salary Payable</span>
                <p className="text-2xl font-black mt-0.5">₹{payslipData.netSalary.toLocaleString()}</p>
              </div>

              <button
                onClick={handlePrint}
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition print:hidden cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print Payslip</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
