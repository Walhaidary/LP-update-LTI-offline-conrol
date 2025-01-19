import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { FormField } from '../../../common/FormField';
import { useLTINumbers } from '../../../../hooks/useLTINumbers';
import { useLTIDetails } from '../../../../hooks/useLTIDetails';
import type { BasicInformation } from '../types';

interface BasicInformationStepProps {
  data: BasicInformation;
  onChange: (field: keyof BasicInformation, value: string) => void;
}

export function BasicInformationStep({ data, onChange }: BasicInformationStepProps) {
  const [searchTerm, setSearchTerm] = useState(data.ltiNumber);
  const [showResults, setShowResults] = useState(false);
  const { ltiOptions, isLoading, error, searchLTINumbers } = useLTINumbers();
  const { fetchLTIDetails } = useLTIDetails();

  useEffect(() => {
    const timer = setTimeout(() => {
      searchLTINumbers(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleLTISelect = async (option: typeof ltiOptions[0]) => {
    try {
      const details = await fetchLTIDetails(option.ltiNumber, option.lineNumber);
      if (details) {
        onChange('ltiNumber', option.ltiNumber);
        onChange('departure', details.departure);
        onChange('destination', details.destination);
        onChange('transporterName', details.transporterName);
        onChange('unloadingPoint', details.unloadingPoint);
        onChange('consignee', details.consignee || '');
      }
      setSearchTerm(option.ltiNumber);
      setShowResults(false);
    } catch (err) {
      console.error('Error fetching LTI details:', err);
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
                    key={`${option.ltiNumber}-${option.lineNumber}`}
                    onClick={() => handleLTISelect(option)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <div className="font-medium">{option.ltiNumber}</div>
                    <div className="text-sm text-gray-500">
                      {option.transporter} - {option.destination}
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
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>

      <FormField
        label="Consignee"
        description="Consignee name from LTI"
        value={data.consignee}
        onChange={(value) => onChange('consignee', value)}
        disabled={true}
        required
      />

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
          value={data.transporterName}
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