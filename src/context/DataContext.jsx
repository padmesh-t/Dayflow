import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialEmployees, initialAttendance, initialTimeOff } from '../data/mockData';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('dayflow_employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('dayflow_attendance');
    return saved ? JSON.parse(saved) : initialAttendance;
  });

  const [timeOffRequests, setTimeOffRequests] = useState(() => {
    const saved = localStorage.getItem('dayflow_timeoff');
    return saved ? JSON.parse(saved) : initialTimeOff;
  });

  useEffect(() => {
    localStorage.setItem('dayflow_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('dayflow_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('dayflow_timeoff', JSON.stringify(timeOffRequests));
  }, [timeOffRequests]);

  // CRUD actions
  const addEmployee = (newEmp) => {
    const created = {
      ...newEmp,
      id: `emp-${Date.now()}`,
      empCode: `EMP-${1000 + employees.length + 1}`,
      paidTimeOffBalance: 24,
      sickTimeOffBalance: 7,
      status: 'Active'
    };
    setEmployees(prev => [created, ...prev]);
    return created;
  };

  const updateEmployee = (id, updatedFields) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updatedFields } : emp));
  };

  const addAttendanceRecord = (record) => {
    const created = {
      ...record,
      id: `att-${Date.now()}`
    };
    setAttendance(prev => [created, ...prev]);
  };

  const submitTimeOffRequest = (request) => {
    const newReq = {
      ...request,
      id: `to-${Date.now()}`,
      status: 'Pending'
    };
    setTimeOffRequests(prev => [newReq, ...prev]);
  };

  const updateTimeOffStatus = (id, status) => {
    setTimeOffRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
  };

  // Automated Payslip Calculation Logic
  // Basic = Wage * (Basic% / 100)
  // HRA = Basic * (HRA% / 100)
  // PF = Basic * (PF% / 100)
  // Professional Tax = 200
  const calculatePayslip = (empId, monthDays = 30) => {
    const emp = employees.find(e => e.id === empId) || employees[0];
    const wage = Number(emp.wage) || 250000;
    const basicPercent = Number(emp.basicPercent) || 50;
    const hraPercent = Number(emp.hraPercent) || 50;
    const pfPercent = Number(emp.pfPercent) || 12;
    const profTax = Number(emp.professionalTax) || 200;

    const basic = (wage * basicPercent) / 100;
    const hra = (basic * hraPercent) / 100;
    const pf = (basic * pfPercent) / 100;

    // Count present days and unpaid leaves
    const empAtt = attendance.filter(a => a.empId === emp.id);
    const presentDays = empAtt.length > 0 ? empAtt.length : 22;
    const unpaidLeaves = timeOffRequests.filter(r => r.empId === emp.id && r.timeOffType === 'Unpaid Leaves' && r.status === 'Approved').length;

    const totalPayableDays = Math.max(0, monthDays - unpaidLeaves);
    const grossEarnings = basic + hra;
    const totalDeductions = pf + profTax;
    const netSalary = Math.round((grossEarnings - totalDeductions) * (totalPayableDays / monthDays));

    return {
      wage,
      basic,
      hra,
      pf,
      profTax,
      grossEarnings,
      totalDeductions,
      netSalary,
      presentDays,
      unpaidLeaves,
      totalPayableDays,
      monthDays
    };
  };

  return (
    <DataContext.Provider value={{
      employees,
      attendance,
      timeOffRequests,
      addEmployee,
      updateEmployee,
      addAttendanceRecord,
      submitTimeOffRequest,
      updateTimeOffStatus,
      calculatePayslip
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
