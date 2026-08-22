import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('dayflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [otpPendingEmail, setOtpPendingEmail] = useState(null);
  const [demoOtpCode, setDemoOtpCode] = useState('');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dayflow_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dayflow_user');
    }
  }, [currentUser]);

  const signIn = async (loginOrEmail, password) => {
    const res = await fetch(`${API_BASE}/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginOrEmail, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Sign in failed');

    if (data.requiresOtp) {
      setOtpPendingEmail(data.email);
      setDemoOtpCode(data.otpCode || '');
      return { requiresOtp: true, email: data.email };
    }
    return data;
  };

  const verifyOtp = async (email, otpCode) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otpCode })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');

    setCurrentUser(data.user);
    setOtpPendingEmail(null);
    setDemoOtpCode('');
    return data;
  };

  const signUp = async (signUpData) => {
    const res = await fetch(`${API_BASE}/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signUpData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Sign up failed');
    return data;
  };

  const logout = () => {
    setCurrentUser(null);
    setOtpPendingEmail(null);
    localStorage.removeItem('dayflow_user');
  };

  const changePassword = async (oldPassword, newPassword) => {
    if (!currentUser) return;
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, oldPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password update failed');
    
    // Update local user state
    setCurrentUser(prev => ({ ...prev, is_temp_password: 0 }));
    return data;
  };

  const currentRole = currentUser?.role || 'Guest';
  const isAdmin = currentRole === 'Admin';
  const isHROfficer = currentRole === 'HR Officer' || currentRole === 'Admin';
  const isEmployee = currentRole === 'Employee';

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentRole,
      otpPendingEmail,
      setOtpPendingEmail,
      demoOtpCode,
      signIn,
      verifyOtp,
      signUp,
      logout,
      changePassword,
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
