import React from 'react';
import { FormField } from '../../../common/FormField';
import type { CommonInformation } from '../types';

interface CommonInformationStepProps {
  data: CommonInformation;
  onChange: (field: keyof CommonInformation, value: string) => void;
}

export function CommonInformationStep({ data, onChange }: CommonInformationStepProps) {
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
          label="Destination Location"
          description="Enter the destination location"
          value={data.destinationLocation}
          onChange={(value) => onChange('destinationLocation', value)}
          required
        />
      </div>

      <FormField
        label="Destination SL"
        description="Enter the destination SL"
        value={data.destinationSl}
        onChange={(value) => onChange('destinationSl', value)}
        required
      />

      <div className="grid grid-cols-3 gap-6">
        <FormField
          label="FRN/CF"
          description="Enter the FRN/CF number"
          value={data.frnCf}
          onChange={(value) => onChange('frnCf', value)}
        />

        <FormField
          label="Consignee"
          description="Enter the consignee"
          value={data.consignee}
          onChange={(value) => onChange('consignee', value)}
        />

        <FormField
          label="TPO Number"
          description="Enter the TPO number"
          value={data.tpoNumber}
          onChange={(value) => onChange('tpoNumber', value)}
        />
      </div>
    </div>
  );
}