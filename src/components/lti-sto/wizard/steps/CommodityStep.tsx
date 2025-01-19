import React from 'react';
import { FormField } from '../../../common/FormField';

interface Commodity {
  batchNumber: string;
  commodityDescription: string;
  ltiQtyNet: string;
  ltiQtyGross: string;
}

interface CommodityStepProps {
  data: Commodity;
  onChange: (field: keyof Commodity, value: string) => void;
}

export function CommodityStep({ data, onChange }: CommodityStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Batch Number"
          description="Enter the batch number"
          value={data.batchNumber}
          onChange={(value) => onChange('batchNumber', value)}
        />

        <FormField
          label="Commodity Description"
          description="Enter the commodity description"
          value={data.commodityDescription}
          onChange={(value) => onChange('commodityDescription', value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Net Quantity (MT)"
          description="Enter the net quantity in metric tons"
          type="number"
          step="0.01"
          value={data.ltiQtyNet}
          onChange={(value) => onChange('ltiQtyNet', value)}
          required
        />

        <FormField
          label="Gross Quantity (MT)"
          description="Enter the gross quantity in metric tons"
          type="number"
          step="0.01"
          value={data.ltiQtyGross}
          onChange={(value) => onChange('ltiQtyGross', value)}
          required
        />
      </div>
    </div>
  );
}