import { supabase } from '../supabase';
import type { Database } from '../../types/database';

type Shipment = Database['public']['Tables']['shipments']['Row'];

export async function createShipmentUpdate(shipment: Shipment, newStatus: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Ensure values are properly formatted
  const updateData = {
    shipment_id: shipment.id,
    pk: shipment.pk,
    line_number: shipment.line_number,
    serial_number: shipment.serial_number,
    transporter: shipment.transporter,
    driver_name: shipment.driver_name,
    driver_phone: shipment.driver_phone,
    vehicle: shipment.vehicle,
    values: shipment.values,
    total: shipment.total,
    status: newStatus,
    updated_by: user.id
  };

  const { error } = await supabase
    .from('shipments_updates')
    .insert(updateData);

  if (error) {
    console.error('Error creating shipment update:', error);
    console.error('Update data:', updateData);
    throw new Error(`Failed to create shipment update: ${error.message}`);
  }
}