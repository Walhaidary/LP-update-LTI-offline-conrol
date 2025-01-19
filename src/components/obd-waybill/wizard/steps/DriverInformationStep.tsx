import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { FormField } from '../../../common/FormField';
import { supabase } from '../../../../lib/supabase';
import type { DriverInfo } from '../types';

interface DriverInformationStepProps {
  data: DriverInfo;
  onChange: (field: keyof DriverInfo, value: string) => void;
}

export function DriverInformationStep({ data, onChange }: DriverInformationStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipments, setShipments] = useState<any[]>([]);

  useEffect(() => {
    const searchShipments = async () => {
      if (!searchTerm) {
        setShipments([]);
        return;
      }

      try {
        setIsSearching(true);
        setError(null);

        const { data: results, error: searchError } = await supabase
          .from('shipments_updates')
          .select('*')
          .ilike('serial_number', `%${searchTerm}%`)
          .order('created_at', { ascending: false });

        if (searchError) throw searchError;

        // Get latest update for each serial number
        const latestBySerial = results?.reduce((acc, curr) => {
          if (!acc[curr.serial_number] || new Date(curr.created_at) > new Date(acc[curr.serial_number].created_at)) {
            acc[curr.serial_number] = curr;
          }
          return acc;
        }, {} as Record<string, any>);

        setShipments(Object.values(latestBySerial || {}));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search shipments');
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchShipments, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleShipmentSelect = (shipment: any) => {
    onChange('serialNumber', shipment.serial_number);
    onChange('driverName', shipment.driver_name);
    onChange('driverPhone', shipment.driver_phone);
    onChange('vehiclePlate', shipment.vehicle);
    setSearchTerm(shipment.serial_number);
  };

  // Set current date as default loading date when component mounts
  useEffect(() => {
    if (!data.loadingDate) {
      const today = new Date().toISOString().split('T')[0];
      onChange('loadingDate', today);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Serial Number <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500">Search and select the shipment serial number</p>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by serial number..."
              className="w-full pl-9 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              </div>
            )}
          </div>

          {searchTerm && shipments.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
              {shipments.map((shipment) => (
                <button
                  key={shipment.id}
                  onClick={() => handleShipmentSelect(shipment)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                >
                  <div className="font-medium">{shipment.serial_number}</div>
                  <div className="text-sm text-gray-500">
                    {shipment.driver_name} - {shipment.vehicle}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Driver Name"
          description="Driver's name from shipment"
          value={data.driverName}
          onChange={() => {}}
          disabled={true}
          required
        />

        <FormField
          label="Driver Phone"
          description="Driver's phone number from shipment"
          value={data.driverPhone}
          onChange={() => {}}
          disabled={true}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Vehicle Plate"
          description="Vehicle plate number from shipment"
          value={data.vehiclePlate}
          onChange={() => {}}
          disabled={true}
          required
        />

        <FormField
          label="Loading Date"
          description="Select the loading date"
          type="date"
          value={data.loadingDate}
          onChange={(value) => onChange('loadingDate', value)}
          required
        />
      </div>
    </div>
  );
}