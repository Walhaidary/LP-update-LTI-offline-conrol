import type { Database } from '../types/database';
import type { LTISTO } from '../types/lti-sto';

type Shipment = Database['public']['Tables']['shipments']['Row'];

export function searchShipments(shipments: Shipment[], searchTerm: string): Shipment[] {
  if (!searchTerm) return shipments;
  
  const term = searchTerm.toLowerCase();
  
  return shipments.filter(shipment => {
    return (
      shipment.pk.toString().includes(term) ||
      shipment.driver_name.toLowerCase().includes(term) ||
      shipment.vehicle.toLowerCase().includes(term) ||
      shipment.transporter.toLowerCase().includes(term) ||
      shipment.serial_number.toLowerCase().includes(term)
    );
  });
}

export function searchLTISTO(items: LTISTO[], searchTerm: string): LTISTO[] {
  if (!searchTerm) return items;
  
  const term = searchTerm.toLowerCase();
  
  return items.filter(item => {
    return (
      item.transporter_name.toLowerCase().includes(term) ||
      item.lti_number.toLowerCase().includes(term) ||
      item.origin_location.toLowerCase().includes(term) ||
      item.destination_location.toLowerCase().includes(term) ||
      item.commodity_description?.toLowerCase().includes(term)
    );
  });
}