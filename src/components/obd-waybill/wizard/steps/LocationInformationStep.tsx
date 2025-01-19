import React from 'react';
import { FormField } from '../../../common/FormField';
import type { LocationInformation } from '../types';

interface LocationInformationStepProps {
  data: LocationInformation;
  onChange: (field: keyof LocationInformation, value: string) => void;
}

export function LocationInformationStep({ data, onChange }: LocationInformationStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        label="Loading Date"
        description="Select the loading date"
        type="date"
        value={data.loadingDate}
        onChange={(value) => onChange('loadingDate', value)}
        required
      />

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Departure"
          description="Enter the departure location"
          value={data.departure}
          onChange={(value) => onChange('departure', value)}
          required
        />

        <FormField
          label="Destination"
          description="Enter the destination location"
          value={data.destination}
          onChange={(value) => onChange('destination', value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Unloading Point"
          description="Enter the unloading point"
          value={data.unloadingPoint}
          onChange={(value) => onChange('unloadingPoint', value)}
        />

        <FormField
          label="FRN/CF Number"
          description="Enter the FRN/CF number"
          value={data.frnCfNumber}
          onChange={(value) => onChange('frnCfNumber', value)}
        />
      </div>
    </div>
  );
}