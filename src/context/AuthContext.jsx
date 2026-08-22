import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('dayflow_current_user');
    return saved ? JSON.parse(saved) : {
      id: 'emp-001',
      name: 'Padmesh T',
      jobPosition: 'Software Engineer',
      email: 'padmesh.t01@gmail.com',
      role: 'Admin'
    };
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('dayflow_role') || 'Admin';
  });

  useEffect(() => {
    localStorage.setItem('dayflow_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('dayflow_role', currentRole);
  }, [currentRole]);

  const setRole = (newRole) => {
    setCurrentRole(newRole);
  };

  const switchUser = (user, role = 'Employee') => {
    setCurrentUser({
      ...user,
      role
    });
    setCurrentRole(role);
  };

  const isAdmin = currentRole === 'Admin';
  const isHROfficer = currentRole === 'HR Officer' || currentRole === 'Admin';
  const isEmployee = currentRole === 'Employee';

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentRole,
      setRole,
      switchUser,
      isAdmin,
      isHROfficer,
      isEmployee
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
