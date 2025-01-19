import React from 'react';
import { FormField } from '../../../common/FormField';
import type { BasicInformation } from '../types';

interface BasicInformationStepProps {
  data: BasicInformation;
  onChange: (field: keyof BasicInformation, value: string) => void;
}

export function BasicInformationStep({ data, onChange }: BasicInformationStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        label="LTI Number"
        description="Enter the LTI number"
        value={data.ltiNumber}
        onChange={(value) => onChange('ltiNumber', value)}
        required
      />

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Transporter Name"
          description="Enter the transporter's name"
          value={data.transporterName}
          onChange={(value) => onChange('transporterName', value)}
          required
        />

        <FormField
          label="Transporter Code"
          description="Enter the transporter's code"
          value={data.transporterCode}
          onChange={(value) => onChange('transporterCode', value)}
          required
        />
      </div>

      <FormField
        label="LTI Date"
        description="Select the LTI date"
        type="date"
        value={data.ltiDate}
        onChange={(value) => onChange('ltiDate', value)}
        required
      />

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Origin CO"
          description="Enter the origin CO"
          value={data.originCo}
          onChange={(value) => onChange('originCo', value)}
          required
        />

        <FormField
          label="Origin Location"
          description="Enter the origin location"
          value={data.originLocation}
          onChange={(value) => onChange('originLocation', value)}
          required
        />
      </div>

      <FormField
        label="TPO Number"
        description="Enter the TPO number"
        value={data.tpoNumber}
        onChange={(value) => onChange('tpoNumber', value)}
        required
      />
    </div>
  );
}