import React, { useEffect, useState, useRef } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { isAuthenticated, setAuth, logout } = useAuthStore();
  const [checking, setChecking] = useState(!isAuthenticated);
  // Stable refs so the effect runs only on mount without needing the functions as deps
  const setAuthRef = useRef(setAuth);
  const logoutRef = useRef(logout);

  useEffect(() => {
    if (isAuthenticated) return;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      setChecking(false);
      return;
    }

    authService
      .refresh(refreshToken)
      .then(({ data }) => {
        const { user, accessToken, refreshToken: newRT } = data.data;
        setAuthRef.current(user, accessToken, newRT);
      })
      .catch(() => {
        logoutRef.current();
      })
      .finally(() => setChecking(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount — checks stored refresh token

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
