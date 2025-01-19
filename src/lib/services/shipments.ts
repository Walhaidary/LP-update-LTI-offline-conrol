import { supabase } from '../supabase';
import type { Database } from '../../types/database';

type ShipmentUpdate = Database['public']['Tables']['shipments_updates']['Row'];

export async function updateShipmentsBySerialNumber(
  serialNumber: string, 
  updates: Partial<ShipmentUpdate>
) {
  if (!serialNumber) {
    throw new Error('Serial number is required');
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('User not authenticated');

  try {
    // Get next version number for this serial number
    const { data: versionData, error: versionError } = await supabase
      .rpc('get_next_version', { p_serial_number: serialNumber });

    if (versionError) throw versionError;
    const nextVersion = versionData;

    // Insert new update record with version number
    const { error: insertError } = await supabase
      .from('shipments_updates')
      .insert({
        serial_number: serialNumber,
        pk: updates.pk || 0,
        line_number: updates.line_number || '',
        transporter: updates.transporter || '',
        driver_name: updates.driver_name || '',
        driver_phone: updates.driver_phone || '',
        vehicle: updates.vehicle || '',
        values: updates.values || '',
        total: updates.total || 0,
        status: updates.status || 'sc_approved',
        approval_date: updates.approval_date,
        updated_by: user.id,
        destination_state: updates.destination_state,
        destination_locality: updates.destination_locality,
        remarks: updates.remarks,
        version: nextVersion
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error(`Failed to create update record: ${insertError.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error in updateShipmentsBySerialNumber:', error);
    throw error instanceof Error 
      ? error 
      : new Error('An unexpected error occurred while updating shipment');
  }
}