import React from 'react';
import { FormField } from '../../../common/FormField';
import type { CommodityInformation } from '../types';

interface CommodityInformationStepProps {
  data: CommodityInformation;
  onChange: (field: keyof CommodityInformation, value: string) => void;
}

export function CommodityInformationStep({ data, onChange }: CommodityInformationStepProps) {
  return (
    <div className="space-y-6">
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
      />

      <FormField
        label="LTI Quantity Net (MT)"
        description="Enter the net quantity in metric tons"
        type="number"
        value={data.ltiQtyNet}
        onChange={(value) => onChange('ltiQtyNet', value)}
        required
      />

      <FormField
        label="LTI Quantity Gross (MT)"
        description="Enter the gross quantity in metric tons"
        type="number"
        value={data.ltiQtyGross}
        onChange={(value) => onChange('ltiQtyGross', value)}
        required
      />

      <FormField
        label="TPO Number"
        description="Enter the TPO number"
        value={data.tpoNumber}
        onChange={(value) => onChange('tpoNumber', value)}
      />
    </div>
  );
}