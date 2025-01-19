import React from 'react';

interface FormFieldProps {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}

export function FormField({
  label,
  description,
  value,
  onChange,
  type = 'text',
  required = false
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <p className="text-sm text-gray-500">{description}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  );
}