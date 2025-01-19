import type { Database } from '../types/database';

type ShipmentUpdate = Database['public']['Tables']['shipments_updates']['Row'];

export function calculateTotalBySerialNumber(updates: ShipmentUpdate[], serialNumber: string): number {
  // Filter updates for the given serial number
  const shipmentUpdates = updates.filter(update => update.serial_number === serialNumber);
  
  // If no updates found, return 0
  if (shipmentUpdates.length === 0) return 0;

  // Get unique PKs for this serial number
  const uniquePks = [...new Set(shipmentUpdates.map(update => update.pk))];

  // Sum the totals for each unique PK
  return uniquePks.reduce((sum, pk) => {
    const update = shipmentUpdates.find(u => u.pk === pk);
    return sum + (update?.total || 0);
  }, 0);
}