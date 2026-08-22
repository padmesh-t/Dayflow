import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext();

const API_BASE = 'http://localhost:5000/api';

export function DataProvider({ children }) {
  const { authHeaders, currentUser, refreshCurrentUser } = useAuth();
  // Start empty. Authenticated users must only ever see data returned by the
  // API for their own company — never the bundled mock dataset, which contains
  // cross-company placeholder employees.
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [timeOffRequests, setTimeOffRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/employees`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (err) {
      console.warn('Employees API error:', err.message);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`${API_BASE}/attendance/logs`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
      }
    } catch (err) {
      console.warn('Attendance API error:', err.message);
    }
  };

  const fetchTimeOff = async () => {
    try {
      const res = await fetch(`${API_BASE}/timeoff`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setTimeOffRequests(data);
      }
    } catch (err) {
      console.warn('TimeOff API error:', err.message);
    }
  };

  // Re-fetch all scoped data whenever the authenticated user changes (e.g. after login)
  useEffect(() => {
    if (!currentUser?.id) return;
    fetchEmployees();
    fetchAttendance();
    fetchTimeOff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const addEmployee = async (newEmp) => {
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: authHeaders(),
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
        headers: authHeaders(),
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        await fetchEmployees();
        if (refreshCurrentUser) await refreshCurrentUser();
      }
    } catch (err) {
      console.error('Error updating employee:', err);
    }
  };

  const checkIn = async (employeeId) => {
    try {
      const res = await fetch(`${API_BASE}/attendance/check-in`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ employeeId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check-in failed');
      await fetchEmployees();
      await fetchAttendance();
      if (refreshCurrentUser) await refreshCurrentUser();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const checkOut = async (employeeId) => {
    try {
      const res = await fetch(`${API_BASE}/attendance/check-out`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ employeeId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check-out failed');
      await fetchEmployees();
      await fetchAttendance();
      if (refreshCurrentUser) await refreshCurrentUser();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const submitTimeOffRequest = async (request) => {
    try {
      const res = await fetch(`${API_BASE}/timeoff`, {
        method: 'POST',
        headers: authHeaders(),
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
        headers: authHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Status update failed');
      await fetchTimeOff();
      await fetchEmployees();
      if (refreshCurrentUser) await refreshCurrentUser();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const fetchPayslip = async (empId, monthDays = 30) => {
    try {
      const res = await fetch(`${API_BASE}/payroll/payslip/${empId}?monthDays=${monthDays}`, { headers: authHeaders() });
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
      fetchAttendance,
      fetchTimeOff,
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
