import React, { useState } from 'react';
import Navbar from './components/Navbar';
import EmployeesPage from './pages/EmployeesPage';
import AttendancePage from './pages/AttendancePage';
import TimeOffPage from './pages/TimeOffPage';
import MyProfilePage from './pages/MyProfilePage';

export default function App() {
  const [activeTab, setActiveTab] = useState('employees');
  const [currentRole, setRole] = useState('Admin');
  const [currentUser, setCurrentUser] = useState({
    name: 'Padmesh T',
    jobPosition: 'Software Engineer',
    email: 'padmesh.t01@gmail.com'
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'employees':
        return <EmployeesPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'timeoff':
        return <TimeOffPage />;
      case 'profile':
        return <MyProfilePage />;
      default:
        return <EmployeesPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentRole={currentRole} 
        setRole={setRole}
        currentUser={currentUser}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        Dayflow HR, Attendance & Payroll System &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
