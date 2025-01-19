import React from 'react';
import { FormField } from '../../../common/FormField';
import type { DestinationInformation } from '../types';

interface DestinationInformationStepProps {
  data: DestinationInformation;
  onChange: (field: keyof DestinationInformation, value: string) => void;
}

export function DestinationInformationStep({ data, onChange }: DestinationInformationStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="FRN/CF"
          description="Enter the FRN/CF number"
          value={data.frnCf}
          onChange={(value) => onChange('frnCf', value)}
          required
        />

        <FormField
          label="Consignee"
          description="Enter the consignee"
          value={data.consignee}
          onChange={(value) => onChange('consignee', value)}
          required
        />
      </div>

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
    </div>
  );
}