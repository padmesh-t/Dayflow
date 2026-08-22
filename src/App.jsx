import React, { useState } from 'react';
import Navbar from './components/Navbar';
import EmployeesPage from './pages/EmployeesPage';
import AttendancePage from './pages/AttendancePage';
import TimeOffPage from './pages/TimeOffPage';
import MyProfilePage from './pages/MyProfilePage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import OtpModal from './components/OtpModal';
import AddEmployeeModal from './components/AddEmployeeModal';
import EmployeeProfileModal from './components/EmployeeProfileModal';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';

function MainApp() {
  const { currentUser } = useAuth();
  const { fetchEmployees, updateEmployee } = useData();
  const [activeTab, setActiveTab] = useState('employees');
  const [authView, setAuthView] = useState('signin');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  if (!currentUser) {
    return (
      <>
        {authView === 'signin' ? (
          <SignIn onNavigateToSignUp={() => setAuthView('signup')} />
        ) : (
          <SignUp 
            onNavigateToSignIn={() => setAuthView('signin')} 
            onSignUpSuccess={() => setAuthView('signin')} 
          />
        )}
        <OtpModal />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'employees':
        return (
          <EmployeesPage 
            onAddClick={() => setShowAddModal(true)} 
            onSelectEmployee={(emp) => setSelectedEmployee(emp)} 
          />
        );
      case 'attendance':
        return <AttendancePage />;
      case 'timeoff':
        return <TimeOffPage />;
      case 'profile':
        return <MyProfilePage />;
      default:
        return (
          <EmployeesPage 
            onAddClick={() => setShowAddModal(true)} 
            onSelectEmployee={(emp) => setSelectedEmployee(emp)} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        Dayflow HR, Attendance & Payroll System &copy; {new Date().getFullYear()}
      </footer>

      <OtpModal />

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onAddSuccess={() => {
            fetchEmployees();
          }}
        />
      )}

      {selectedEmployee && (
        <EmployeeProfileModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onUpdateEmployee={async (id, fields) => {
            await updateEmployee(id, fields);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return <MainApp />;
}
