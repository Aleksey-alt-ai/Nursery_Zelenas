import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Проверяем, что пользователь аутентифицирован И имеет роль owner
  // И что токен начинается с 'mock-token-' (значит прошел через страницу входа)
  const token = localStorage.getItem('token');
  const isValidToken = token && token.startsWith('mock-token-');
  
  // Дополнительная проверка - проверяем, что пользователь действительно прошел через страницу входа
  const hasVisitedLogin = sessionStorage.getItem('hasVisitedLogin');
  
  console.log('AdminRoute check:', {
    isAuthenticated,
    userRole: user?.role,
    isValidToken,
    hasVisitedLogin,
    token
  });
  
  if (!isAuthenticated || user?.role !== 'owner' || !isValidToken || !hasVisitedLogin) {
    console.log('Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute; 