import React from 'react';
import { FormField } from '../../common/FormField';
import type { CargoDetails } from '../../../types/monitor';

interface MonitorFormStep3Props {
  data: CargoDetails;
  onChange: (data: CargoDetails) => void;
}

export function MonitorFormStep3({ data, onChange }: MonitorFormStep3Props) {
  return (
    <div className="space-y-6">
      <FormField
        label="Cargo Type"
        description="Specify the type of cargo being transported"
        value={data.type}
        onChange={(value) => onChange({ ...data, type: value })}
        required
      />

      <FormField
        label="Weight (kg)"
        description="Enter the total weight of the cargo"
        value={data.weight}
        onChange={(value) => onChange({ ...data, weight: value })}
        type="number"
        required
      />

      <FormField
        label="Quantity"
        description="Enter the number of items or packages"
        value={data.quantity}
        onChange={(value) => onChange({ ...data, quantity: value })}
        type="number"
        required
      />
    </div>
  );
}