import React, { ReactNode } from 'react';

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: ReactNode;
  required?: boolean;
}

export function InputField({ 
  label, 
  type = "text", 
  placeholder, 
  value, 
  onChange,
  error,
  icon,
  required
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`
            w-full px-3 py-2 
            ${icon ? 'pl-10' : 'pl-3'}
            border ${error ? 'border-red-500' : 'border-gray-300'} 
            rounded-md
            text-base 
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            transition-colors
          `}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}