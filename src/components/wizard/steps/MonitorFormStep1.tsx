import React from 'react';
import { FormField } from '../../common/FormField';
import type { ShipmentDetails } from '../../../types/monitor';

interface MonitorFormStep1Props {
  data: ShipmentDetails;
  onChange: (data: ShipmentDetails) => void;
}

export function MonitorFormStep1({ data, onChange }: MonitorFormStep1Props) {
  return (
    <div className="space-y-6">
      <FormField
        label="Shipment ID"
        description="Enter the unique shipment identifier"
        value={data.shipmentId}
        onChange={(value) => onChange({ ...data, shipmentId: value })}
        required
      />

      <FormField
        label="Transporter ID"
        description="Enter the transporter's identification number"
        value={data.transporterId}
        onChange={(value) => onChange({ ...data, transporterId: value })}
        required
      />

      <FormField
        label="Vehicle ID"
        description="Enter the vehicle's registration number"
        value={data.vehicleId}
        onChange={(value) => onChange({ ...data, vehicleId: value })}
        required
      />
    </div>
  );
}