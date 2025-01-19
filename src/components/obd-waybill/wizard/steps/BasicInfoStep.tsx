import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { FormField } from '../../../common/FormField';
import { supabase } from '../../../../lib/supabase';
import type { BasicInfo } from '../types';

interface LTIDetails {
  departure: string;
  destination: string;
  transporterName: string;
  unloadingPoint: string;
  consignee: string;
  frn_cf: string;
}

interface LTIOption {
  lti_number: string;
  lti_line: string;
  transporter_name: string;
  destination_location: string;
  frn_cf: string | null;
}

interface BasicInfoStepProps {
  data: BasicInfo;
  onChange: (field: keyof BasicInfo, value: string) => void;
}

export function BasicInfoStep({ data, onChange }: BasicInfoStepProps) {
  const [searchTerm, setSearchTerm] = useState(data.ltiNumber);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ltiOptions, setLTIOptions] = useState<LTIOption[]>([]);

  useEffect(() => {
    const searchLTI = async () => {
      if (!searchTerm) {
        setLTIOptions([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data: results, error: searchError } = await supabase
          .from('lti_sto')
          .select('lti_number, lti_line, transporter_name, destination_location, frn_cf')
          .ilike('lti_number', `%${searchTerm}%`)
          .order('created_at', { ascending: false });

        if (searchError) throw searchError;

        // Create unique options based on LTI number
        const uniqueOptions = results?.reduce((acc: LTIOption[], curr) => {
          if (!acc.find(opt => opt.lti_number === curr.lti_number)) {
            acc.push(curr);
          }
          return acc;
        }, []) || [];

        setLTIOptions(uniqueOptions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search LTI numbers');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(searchLTI, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchLTIDetails = async (ltiNumber: string): Promise<LTIDetails | null> => {
    try {
      // Get the first line of the LTI to get the common details
      const { data, error: fetchError } = await supabase
        .from('lti_sto')
        .select('origin_location, destination_location, transporter_name, destination_sl, consignee, frn_cf')
        .eq('lti_number', ltiNumber)
        .order('lti_line', { ascending: true })
        .limit(1)
        .single();

      if (fetchError) throw fetchError;
      if (!data) return null;

      return {
        departure: data.origin_location,
        destination: data.destination_location,
        transporterName: data.transporter_name,
        unloadingPoint: data.destination_sl,
        consignee: data.consignee || '',
        frn_cf: data.frn_cf || ''
      };
    } catch (err) {
      console.error('Error fetching LTI details:', err);
      return null;
    }
  };

  const handleLTISelect = async (ltiNumber: string) => {
    try {
      const details = await fetchLTIDetails(ltiNumber);
      if (details) {
        onChange('ltiNumber', ltiNumber);
        onChange('departure', details.departure);
        onChange('destination', details.destination);
        onChange('transporter', details.transporterName);
        onChange('unloadingPoint', details.unloadingPoint);
        onChange('consignee', details.consignee);
        onChange('frn', details.frn_cf);
      }
      setSearchTerm(ltiNumber);
      setShowResults(false);
    } catch (err) {
      console.error('Error selecting LTI:', err);
    }
  };

  return (
    <div className="space-y-6">
      <FormField
        label="Outbound LO Number"
        description="Auto-generated outbound LO number"
        value={data.outboundDeliveryNumber}
        onChange={() => {}}
        disabled={true}
        required
      />

      <div className="space-y-2">
        <label className="block font-medium">
          LTI Number <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500">Search and select the LTI reference number</p>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Type to search LTI numbers..."
              className="w-full pl-9 pr-3 py-2 bg-white border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {showResults && searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
              {ltiOptions.length > 0 ? (
                ltiOptions.map((option) => (
                  <button
                    key={`${option.lti_number}-${option.lti_line}`}
                    onClick={() => handleLTISelect(option.lti_number)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <div className="font-medium">{option.lti_number}</div>
                    <div className="text-sm text-gray-500">
                      {option.transporter_name} - {option.destination_location}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No matching LTI numbers found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="FRN Number"
          description="FRN number from LTI/STO"
          value={data.frn}
          onChange={() => {}}
          disabled={true}
        />

        <FormField
          label="Consignee"
          description="Consignee name from LTI"
          value={data.consignee}
          onChange={() => {}}
          disabled={true}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Departure"
          description="Departure location from LTI"
          value={data.departure}
          onChange={() => {}}
          disabled={true}
          required
        />

        <FormField
          label="Destination"
          description="Destination location from LTI"
          value={data.destination}
          onChange={() => {}}
          disabled={true}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Transporter"
          description="Transporter name from LTI"
          value={data.transporter}
          onChange={() => {}}
          disabled={true}
          required
        />

        <FormField
          label="Unloading Point"
          description="Enter unloading point"
          value={data.unloadingPoint}
          onChange={(value) => onChange('unloadingPoint', value)}
          required
        />
      </div>
    </div>
  );
}