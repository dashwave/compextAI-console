import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';

export function LoginPage() {
  const token = localStorage.getItem('api_token');
  
  if (token) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}