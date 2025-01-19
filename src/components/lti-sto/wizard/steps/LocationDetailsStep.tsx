import React from 'react';
import { FormField } from '../../../common/FormField';
import type { LocationDetails } from '../types';

interface LocationDetailsStepProps {
  data: LocationDetails;
  onChange: (field: keyof LocationDetails, value: string) => void;
}

export function LocationDetailsStep({ data, onChange }: LocationDetailsStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        label="Origin CO"
        description="Enter the origin CO"
        value={data.originCo}
        onChange={(value) => onChange('originCo', value)}
        required
      />

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Destination Location"
          description="Enter the destination location"
          value={data.destinationLocation}
          onChange={(value) => onChange('destinationLocation', value)}
          required
        />

        <FormField
          label="Destination SL"
          description="Enter the destination SL"
          value={data.destinationSl}
          onChange={(value) => onChange('destinationSl', value)}
          required
        />
      </div>

      <FormField
        label="FRN/CF"
        description="Enter the FRN/CF number"
        value={data.frnCf}
        onChange={(value) => onChange('frnCf', value)}
      />
    </div>
  );
}