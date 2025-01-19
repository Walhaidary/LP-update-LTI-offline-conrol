import React from 'react';
import type { AdditionalNotes } from '../types';

interface AdditionalNotesStepProps {
  data: AdditionalNotes;
  onChange: (field: keyof AdditionalNotes, value: string) => void;
}

export function AdditionalNotesStep({ data, onChange }: AdditionalNotesStepProps) {
  return (
    <div className="space-y-2">
      <label className="block font-medium">Additional Notes</label>
      <p className="text-sm text-gray-500">Add any special instructions or notes</p>
      <textarea
        value={data.remarks}
        onChange={(e) => onChange('remarks', e.target.value)}
        className="w-full h-32 px-3 py-2 border rounded-md resize-y"
        placeholder="Enter any additional notes here..."
      />
    </div>
  );
}