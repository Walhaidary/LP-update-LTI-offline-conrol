import type { InventoryRow } from '../../types/inventory';

export const REQUIRED_FIELDS: (keyof InventoryRow)[] = [
  'PK',
  'line_number',
  'serial_number',
  'transporter',
  'driver_name',
  'driver_phone',
  'vehicle'
];

export function validateRow(row: Partial<InventoryRow>, index: number): string[] {
  const errors: string[] = [];
  
  const missingFields = REQUIRED_FIELDS.filter(field => !row[field]);
  if (missingFields.length > 0) {
    errors.push(`Row ${index + 2} is missing required fields: ${missingFields.join(', ')}`);
  }

  return errors;
}