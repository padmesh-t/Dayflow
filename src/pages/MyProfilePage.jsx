import React from 'react';
import EmployeeProfileModal from '../components/EmployeeProfileModal';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function MyProfilePage() {
  const { currentUser } = useAuth();
  const { updateEmployee } = useData();

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      <EmployeeProfileModal
        employee={currentUser}
        onClose={() => {}}
        onUpdateEmployee={updateEmployee}
      />
    </div>
  );
}
