import React from 'react';

interface TransporterFilterProps {
  value: string;
  onChange: (value: string) => void;
  transporters: string[];
}

export function TransporterFilter({ value, onChange, transporters }: TransporterFilterProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Transporter
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
      >
        <option value="">All Transporters</option>
        {transporters.map((transporter) => (
          <option key={transporter} value={transporter}>
            {transporter}
          </option>
        ))}
      </select>
    </div>
  );
}