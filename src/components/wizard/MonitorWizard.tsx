import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { ShipmentForm } from '../shipment/ShipmentForm';
import { updateShipmentsBySerialNumber } from '../../lib/services/shipments';
import type { Database } from '../../types/database';

type ShipmentUpdate = Database['public']['Tables']['shipments_updates']['Row'];

const emptyShipment: ShipmentUpdate = {
  id: '',
  shipment_id: null,
  pk: 0,
  line_number: '',
  serial_number: '',
  transporter: '',
  driver_name: '',
  driver_phone: '',
  vehicle: '',
  values: '',
  total: 0,
  status: 'sc_approved',
  approval_date: null,
  updated_by: '',
  created_at: new Date().toISOString(),
  destination_state: null,
  destination_locality: null,
  remarks: null
};

export function MonitorWizard() {
  const [selectedShipment, setSelectedShipment] = useState<ShipmentUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleNewShipment = () => {
    setSelectedShipment(emptyShipment);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (values: Partial<ShipmentUpdate>) => {
    if (!selectedShipment) return;
    
    try {
      setError(null);
      setSuccess(null);

      // Validate serial number
      if (!values.serial_number) {
        throw new Error('Serial number is required');
      }

      // Update shipments and create update records
      await updateShipmentsBySerialNumber(
        values.serial_number,
        values
      );

      // Update the selected shipment in the UI
      setSelectedShipment(prev => prev ? { ...prev, ...values } : null);
      setSuccess('Shipment status has been updated successfully');
      
      // Reset form after successful submission
      setTimeout(() => {
        setShowForm(false);
        setSelectedShipment(null);
      }, 2000);
    } catch (err) {
      console.error('Error updating shipment:', err);
      setError(err instanceof Error ? err.message : 'Failed to update shipment status');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border p-6">
      <div className="space-y-6">
        {/* New Shipment Button */}
        {!showForm && (
          <div className="flex justify-center py-8">
            <button
              onClick={handleNewShipment}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Shipment
            </button>
          </div>
        )}

        {/* Shipment Form */}
        {showForm && selectedShipment && (
          <div>
            <h2 className="text-lg font-medium mb-4">Update Status</h2>
            <ShipmentForm 
              shipment={selectedShipment}
              onSubmit={handleSubmit}
            />
          </div>
        )}

        {/* Messages */}
        {success && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-600">
            {success}
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}