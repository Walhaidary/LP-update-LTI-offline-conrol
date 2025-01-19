import type { Database } from './database';

type ShipmentStatus = Database['public']['Tables']['shipments']['Row']['status'];

export interface InventoryRow {
  PK: number;
  line_number: string;
  serial_number: string;
  transporter: string;
  driver_name: string;
  driver_phone: string;
  vehicle: string;
  values: string;
  total: number;
  approval_date?: string;
  destination_state?: string;
  destination_locality?: string;
}

export const COLUMN_MAPPINGS = {
  'PK': 'PK',
  'line number': 'line_number',
  'Serial Number': 'serial_number',
  'Transporter': 'transporter',
  'Driver Name': 'driver_name',
  'Driver Cell Number': 'driver_phone',
  'Truck Plate Number': 'vehicle',
  'Values': 'values',
  'Total': 'total',
  'Approval Date': 'approval_date',
  'Destination State': 'destination_state',
  'Destination Locality': 'destination_locality'
} as const;