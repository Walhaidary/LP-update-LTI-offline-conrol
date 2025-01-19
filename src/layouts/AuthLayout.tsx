import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { GradientSection } from '../components/GradientSection';

interface AuthLayoutProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export function AuthLayout({ onLogin }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <GradientSection />
      <LoginForm onLogin={onLogin} />
    </div>
  );
}