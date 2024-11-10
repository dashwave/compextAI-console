import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { SignupForm } from '../components/auth/SignupForm';

export function SignupPage() {
  const token = localStorage.getItem('api_token');
  
  if (token) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}