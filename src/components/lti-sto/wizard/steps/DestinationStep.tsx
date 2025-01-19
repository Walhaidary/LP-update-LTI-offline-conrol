import React, { useState, useEffect } from 'react';
import { FormField } from '../../../common/FormField';
import { supabase } from '../../../../lib/supabase';

interface Destination {
  destinationLocation: string;
  destinationSl: string;
  frnCf: string;
  consignee: string;
}

interface DestinationStepProps {
  data: Destination;
  onChange: (field: keyof Destination, value: string) => void;
}

interface Partner {
  id: string;
  name: string;
  vendor_code: string;
}

export function DestinationStep({ data, onChange }: DestinationStepProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setIsLoading(true);
      const { data: providers, error: fetchError } = await supabase
        .from('service_providers')
        .select('id, name, vendor_code')
        .eq('type', 'partner')
        .order('name');

      if (fetchError) throw fetchError;
      setPartners(providers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load partners');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="FRN/CF"
          description="Enter the FRN/CF number"
          value={data.frnCf}
          onChange={(value) => onChange('frnCf', value)}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Consignee
          </label>
          <p className="text-sm text-gray-500">Select the consignee partner</p>
          <select
            value={data.consignee}
            onChange={(e) => onChange('consignee', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          >
            <option value="">Select Consignee</option>
            {partners.map((partner) => (
              <option key={partner.id} value={partner.name}>
                {partner.name} ({partner.vendor_code})
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}