import React from 'react';
import { FormField } from '../../../common/FormField';

interface AdditionalInfo {
  tpoNumber: string;
  remarks: string;
}

interface AdditionalInfoStepProps {
  data: AdditionalInfo;
  onChange: (field: keyof AdditionalInfo, value: string) => void;
}

export function AdditionalInfoStep({ data, onChange }: AdditionalInfoStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        label="TPO Number"
        description="Enter the TPO number"
        value={data.tpoNumber}
        onChange={(value) => onChange('tpoNumber', value)}
      />

      <div className="space-y-2">
        <label className="block font-medium">Remarks</label>
        <p className="text-sm text-gray-500">Add any additional notes or remarks</p>
        <textarea
          value={data.remarks}
          onChange={(e) => onChange('remarks', e.target.value)}
          className="w-full h-32 px-3 py-2 border rounded-md resize-y focus:ring-2 focus:ring-primary"
          placeholder="Enter any remarks here..."
        />
      </div>
    </div>
  );
}