import { supabase } from '../supabase';
import type { InventoryRow } from '../../types/inventory';

async function getExistingPKs(): Promise<number[]> {
  const { data, error } = await supabase
    .from('shipments_updates')
    .select('pk');

  if (error) {
    console.error('Error fetching existing PKs:', error);
    throw new Error('Failed to check existing records');
  }

  return data.map(row => row.pk);
}

export async function uploadShipmentUpdates(data: InventoryRow[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get existing PKs
  const existingPKs = await getExistingPKs();

  // Filter out records with existing PKs
  const newRecords = data.filter(row => !existingPKs.includes(row.PK));

  if (newRecords.length === 0) {
    throw new Error('All records already exist in the database');
  }

  // Insert only new records
  const { error } = await supabase
    .from('shipments_updates')
    .insert(newRecords.map(row => ({
      pk: row.PK,
      line_number: row.line_number,
      serial_number: row.serial_number,
      transporter: row.transporter,
      driver_name: row.driver_name,
      driver_phone: row.driver_phone,
      vehicle: row.vehicle,
      values: row.values,
      total: row.total,
      approval_date: row.approval_date || new Date().toISOString(),
      status: 'sc_approved',
      updated_by: user.id,
      destination_state: row.destination_state || null,
      destination_locality: row.destination_locality || null
    })));

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload data: ${error.message}`);
  }

  return {
    uploaded: newRecords.length,
    skipped: data.length - newRecords.length
  };
}