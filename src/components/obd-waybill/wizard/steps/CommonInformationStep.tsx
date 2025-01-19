import React from 'react';
import { FormField } from '../../../common/FormField';
import type { CommonInformation } from '../types';

interface CommonInformationStepProps {
  data: CommonInformation;
  onChange: (field: keyof CommonInformation, value: string) => void;
}

export function CommonInformationStep({ data, onChange }: CommonInformationStepProps) {
  // Generate 8-digit number if not already set
  React.useEffect(() => {
    if (!data.outboundDeliveryNumber) {
      const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
      onChange('outboundDeliveryNumber', randomNumber.toString());
    }
  }, []);

  return (
    <div className="space-y-6">
      <FormField
        label="Outbound LO Number"
        description="Auto-generated outbound LO number"
        value={data.outboundDeliveryNumber}
        onChange={() => {}} // No-op since field is read-only
        disabled={true}
        required
      />

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Driver Name"
          description="Enter the driver's full name"
          value={data.driverName}
          onChange={(value) => onChange('driverName', value)}
          required
        />

        <FormField
          label="Driver License ID"
          description="Enter the driver's license ID"
          value={data.driverLicenseId}
          onChange={(value) => onChange('driverLicenseId', value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Vehicle Plate"
          description="Enter the vehicle plate number"
          value={data.vehiclePlate}
          onChange={(value) => onChange('vehiclePlate', value)}
          required
        />

        <FormField
          label="Transporter Name"
          description="Enter the transporter's name"
          value={data.transporterName}
          onChange={(value) => onChange('transporterName', value)}
          required
        />
      </div>

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