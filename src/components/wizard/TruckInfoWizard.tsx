import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ShipmentForm } from '../shipment/ShipmentForm';
import type { Database } from '../../types/database';

type ShipmentUpdate = Database['public']['Tables']['shipments_updates']['Row'];

interface TruckInfoWizardProps {
  initialSerialNumber: string | null;
}

export function TruckInfoWizard({ initialSerialNumber }: TruckInfoWizardProps) {
  const [serialNumber, setSerialNumber] = useState(initialSerialNumber || '');
  const [showSerialInput, setShowSerialInput] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<'search' | 'create' | null>(null);
  const [nextPk, setNextPk] = useState<number | null>(null);

  const getNextPk = async () => {
    try {
      const { data: maxPk, error: pkError } = await supabase
        .from('shipments_updates')
        .select('pk')
        .order('pk', { ascending: false })
        .limit(1)
        .single();

      if (pkError) throw pkError;
      return (maxPk?.pk || 0) + 1;
    } catch (err) {
      console.error('Error getting next PK:', err);
      throw new Error('Failed to generate PK');
    }
  };

  const handleSerialSearch = async (searchSerialNumber: string) => {
    if (!searchSerialNumber.trim()) {
      setError('Please enter a serial number');
      return;
    }

    try {
      setIsSearching(true);
      setError(null);

      // Get the latest version for this serial number
      const { data: latestVersion, error: versionError } = await supabase
        .from('shipments_updates')
        .select('version')
        .eq('serial_number', searchSerialNumber.trim())
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (versionError) throw versionError;
      if (!latestVersion) {
        throw new Error('No shipment found with this serial number');
      }

      // Get all lines for the latest version
      const { data: updates, error: updatesError } = await supabase
        .from('shipments_updates')
        .select('*')
        .eq('serial_number', searchSerialNumber.trim())
        .eq('version', latestVersion.version)
        .order('line_number', { ascending: true });

      if (updatesError) throw updatesError;
      if (!updates || updates.length === 0) {
        throw new Error('No shipment found with this serial number');
      }

      // Set the selected shipment with all its lines
      setSelectedShipment({
        ...updates[0],
        lines: updates
      });

      setShowSerialInput(false);
      setShowForm(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find shipment');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      const pk = await getNextPk();
      setNextPk(pk);

      // Create a new empty shipment with initial line
      const newShipment = {
        pk,
        driver_name: '',
        driver_phone: '',
        vehicle: '',
        transporter: '',
        status: 'sc_approved',
        lines: [{
          id: '1',
          line_number: '010',
          values: '',
          batch_number: '',
          units: '0',
          warehouse_number: '',
          remarks: '',
          pk
        }]
      };

      setSelectedShipment(newShipment);
      setShowSerialInput(false);
      setShowForm(true);
    } catch (err) {
      console.error('Error initializing new shipment:', err);
      setError('Failed to initialize new shipment');
    }
  };

  const handleSubmit = async (values: Partial<ShipmentUpdate> & { lines?: any[] }) => {
    try {
      setError(null);
      setSuccess(null);

      // Get the authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      if (mode === 'create') {
        // Handle new shipment creation
        if (!nextPk) throw new Error('Invalid PK');

        // Get next version number
        const { data: nextVersion, error: versionError } = await supabase
          .rpc('get_next_version', { p_serial_number: `SHP-${nextPk.toString().padStart(6, '0')}` });

        if (versionError) throw versionError;

        // Process each line
        for (const line of values.lines || []) {
          const serialNumber = `SHP-${nextPk.toString().padStart(6, '0')}`;

          // Create the update record
          const updateData = {
            pk: nextPk,
            line_number: line.line_number,
            serial_number: serialNumber,
            transporter: values.transporter || '',
            driver_name: values.driver_name || '',
            driver_phone: values.driver_phone || '',
            vehicle: values.vehicle || '',
            values: line.values || '',
            total: parseFloat(line.units) || 0,
            status: 'sc_approved',
            updated_by: user.id,
            destination_state: values.destination_state,
            destination_locality: values.destination_locality,
            remarks: line.remarks,
            batch_number: line.batch_number,
            warehouse_number: line.warehouse_number,
            version: nextVersion
          };

          // Insert into shipments_updates table
          const { error: insertError } = await supabase
            .from('shipments_updates')
            .insert(updateData);

          if (insertError) throw insertError;
        }
      } else {
        // Handle existing shipment update
        // Get next version number for this serial number
        const { data: nextVersion, error: versionError } = await supabase
          .rpc('get_next_version', { p_serial_number: selectedShipment.serial_number });

        if (versionError) throw versionError;

        // Process each line
        for (const line of values.lines || []) {
          const updateData = {
            pk: selectedShipment.pk,
            line_number: line.line_number,
            serial_number: selectedShipment.serial_number,
            transporter: values.transporter || '',
            driver_name: values.driver_name || '',
            driver_phone: values.driver_phone || '',
            vehicle: values.vehicle || '',
            values: line.values || '',
            total: parseFloat(line.units) || 0,
            status: values.status || 'sc_approved',
            updated_by: user.id,
            destination_state: values.destination_state,
            destination_locality: values.destination_locality,
            remarks: line.remarks,
            batch_number: line.batch_number,
            warehouse_number: line.warehouse_number,
            version: nextVersion
          };

          // Insert new version into shipments_updates table
          const { error: insertError } = await supabase
            .from('shipments_updates')
            .insert(updateData);

          if (insertError) throw insertError;
        }
      }

      setSuccess(mode === 'create' ? 'Shipment created successfully' : 'Shipment updated successfully');
      
      // Reset form after successful submission
      setTimeout(() => {
        setShowForm(false);
        setSelectedShipment(null);
        setShowSerialInput(true);
        setSerialNumber('');
        setMode(null);
        setNextPk(null);
      }, 2000);
    } catch (err) {
      console.error('Error submitting shipment:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit shipment');
    }
  };

  // Handle initial serial number if provided
  React.useEffect(() => {
    if (initialSerialNumber) {
      handleSerialSearch(initialSerialNumber);
    }
  }, [initialSerialNumber]);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border p-6">
      {showSerialInput && !mode && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode('search')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-md hover:bg-primary-hover"
            >
              <Search className="w-5 h-5" />
              Search Existing Record
            </button>
            <button
              onClick={() => {
                setMode('create');
                handleCreateNew();
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-md hover:bg-primary-hover"
            >
              <Plus className="w-5 h-5" />
              Create New Shipment
            </button>
          </div>
        </div>
      )}

      {showSerialInput && mode === 'search' && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Enter serial number to search..."
              className="w-full pl-9 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setMode(null)}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => handleSerialSearch(serialNumber)}
              disabled={isSearching || !serialNumber.trim()}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}
        </div>
      )}

      {showForm && selectedShipment && (
        <div>
          {mode === 'create' && (
            <div className="mb-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedShipment(null);
                  setShowSerialInput(true);
                  setMode(null);
                  setNextPk(null);
                }}
                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          )}
          <ShipmentForm
            shipment={selectedShipment}
            onSubmit={handleSubmit}
          />
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
          {success}
        </div>
      )}
    </div>
  );
}