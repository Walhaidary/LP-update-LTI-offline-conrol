import React from 'react';
import { Printer } from 'lucide-react';

interface SuccessMessageProps {
  loNumber: string;
  onPrint: () => void;
}

export function SuccessMessage({ loNumber, onPrint }: SuccessMessageProps) {
  return (
    <div className="flex items-center justify-between">
      <span>OBD/Waybill created successfully! Outbound LO Number: {loNumber}</span>
      <button
        onClick={onPrint}
        className="flex items-center gap-2 px-3 py-1 text-green-700 hover:bg-green-50 rounded transition-colors"
      >
        <Printer className="w-4 h-4" />
        Print LO
      </button>
    </div>
  );
}