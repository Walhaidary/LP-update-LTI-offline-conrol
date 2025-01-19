import React from 'react';
import { RegistrationForm } from '../auth/RegistrationForm';

export function UserRegistration() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold mb-6">Register New User</h2>
        <RegistrationForm />
      </div>
    </div>
  );
}