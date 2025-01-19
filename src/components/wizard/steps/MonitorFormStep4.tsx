import React from 'react';

interface MonitorFormStep4Props {
  data: string;
  onChange: (value: string) => void;
}

export function MonitorFormStep4({ data, onChange }: MonitorFormStep4Props) {
  return (
    <div className="space-y-2">
      <label className="block font-medium">Additional Notes</label>
      <p className="text-sm text-gray-500">Add any special instructions or notes for this shipment</p>
      <textarea
        value={data}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-32 px-3 py-2 border rounded-md resize-y"
        placeholder="Enter any additional notes here..."
      />
    </div>
  );
}