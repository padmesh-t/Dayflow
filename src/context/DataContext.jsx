import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialEmployees, initialAttendance, initialTimeOff } from '../data/mockData';

const DataContext = createContext();

const API_BASE = 'http://localhost:5000/api';

export function DataProvider({ children }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [timeOffRequests, setTimeOffRequests] = useState(initialTimeOff);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/employees`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setEmployees(data);
      }
    } catch (err) {
      console.warn('API offline, using fallback state:', err.message);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`${API_BASE}/attendance/logs`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setAttendance(data);
      }
    } catch (err) {
      console.warn('Attendance API error:', err.message);
    }
  };

  const fetchTimeOff = async () => {
    try {
      const res = await fetch(`${API_BASE}/timeoff`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setTimeOffRequests(data);
      }
    } catch (err) {
      console.warn('TimeOff API error:', err.message);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
    fetchTimeOff();
  }, []);

  const addEmployee = async (newEmp) => {
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmp)
      });
      if (res.ok) {
        await fetchEmployees();
      }
    } catch (err) {
      console.error('Error adding employee:', err);
    }
  };

  const updateEmployee = async (id, updatedFields) => {
    try {
      const res = await fetch(`${API_BASE}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        await fetchEmployees();
      }
    } catch (err) {
      console.error('Error updating employee:', err);
    }
  };

  const checkIn = async (employeeId) => {
    try {
      const res = await fetch(`${API_BASE}/attendance/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check-in failed');
      await fetchEmployees();
      await fetchAttendance();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const checkOut = async (employeeId) => {
    try {
      const res = await fetch(`${API_BASE}/attendance/check-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check-out failed');
      await fetchEmployees();
      await fetchAttendance();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const submitTimeOffRequest = async (request) => {
    try {
      const res = await fetch(`${API_BASE}/timeoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      await fetchTimeOff();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateTimeOffStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/timeoff/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Status update failed');
      await fetchTimeOff();
      await fetchEmployees();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const fetchPayslip = async (empId, monthDays = 30) => {
    try {
      const res = await fetch(`${API_BASE}/payroll/payslip/${empId}?monthDays=${monthDays}`);
      if (!res.ok) throw new Error('Payslip fetch failed');
      return await res.json();
    } catch (err) {
      throw err;
    }
  };

  return (
    <DataContext.Provider value={{
      employees,
      attendance,
      timeOffRequests,
      fetchEmployees,
      addEmployee,
      updateEmployee,
      checkIn,
      checkOut,
      submitTimeOffRequest,
      updateTimeOffStatus,
      fetchPayslip
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
