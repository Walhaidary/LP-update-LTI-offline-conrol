import type { Database } from '../types/database';

type ShipmentUpdate = Database['public']['Tables']['shipments_updates']['Row'];

export function calculateStageDelay(shipment: ShipmentUpdate, allUpdates: ShipmentUpdate[]): number {
  // Sort updates by created_at in ascending order
  const updates = allUpdates
    .filter(update => update.serial_number === shipment.serial_number)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Find the initial report date (first sc_approved status)
  const reportDate = updates.find(update => update.status === 'sc_approved')?.created_at;
  if (!reportDate) return 0;

  // Find when the current status was first achieved
  const statusDate = updates.find(update => update.status === shipment.status)?.created_at;
  if (!statusDate) return 0;

  // Calculate the difference in days
  const start = new Date(reportDate);
  const end = new Date(statusDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}