import React from 'react';
import { ShieldOff } from 'lucide-react';

export function RestrictedAccess() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <ShieldOff className="w-16 h-16 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-700 mb-2">Access Restricted</h1>
        <p className="text-gray-500">
          You don't have permission to access this page.
        </p>
      </div>
    </div>
  );
}