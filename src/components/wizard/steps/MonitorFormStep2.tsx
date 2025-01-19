import React from 'react';
import { FormField } from '../../common/FormField';
import type { DriverDetails } from '../../../types/monitor';

interface MonitorFormStep2Props {
  data: DriverDetails;
  onChange: (data: DriverDetails) => void;
}

export function MonitorFormStep2({ data, onChange }: MonitorFormStep2Props) {
  return (
    <div className="space-y-6">
      <FormField
        label="Driver Name"
        description="Enter the driver's full name"
        value={data.name}
        onChange={(value) => onChange({ ...data, name: value })}
        required
      />

      <FormField
        label="Phone Number"
        description="Enter the driver's contact number"
        value={data.phone}
        onChange={(value) => onChange({ ...data, phone: value })}
        type="tel"
        required
      />

      <FormField
        label="License Number"
        description="Enter the driver's license number"
        value={data.licenseNumber}
        onChange={(value) => onChange({ ...data, licenseNumber: value })}
        required
      />
    </div>
  );
}