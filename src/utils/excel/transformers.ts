import type { InventoryRow } from '../../types/inventory';

export function transformRow(row: Partial<InventoryRow>): InventoryRow {
  // Helper function to parse Excel date number
  const parseExcelDate = (value: any): string | undefined => {
    if (!value) return undefined;
    
    // If it's already a date string, return it as ISO string
    if (typeof value === 'string') {
      const date = new Date(value);
      return !isNaN(date.getTime()) ? date.toISOString() : undefined;
    }
    
    // Handle Excel numeric dates (days since 1900-01-01)
    if (typeof value === 'number') {
      // Excel's epoch starts from 1900-01-01
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(excelEpoch.getTime() + (value - 1) * 24 * 60 * 60 * 1000);
      return !isNaN(date.getTime()) ? date.toISOString() : undefined;
    }

    return undefined;
  };

  return {
    PK: Number(row.PK),
    line_number: String(row.line_number || ''),
    serial_number: String(row.serial_number || ''),
    transporter: String(row.transporter || ''),
    driver_name: String(row.driver_name || ''),
    driver_phone: String(row.driver_phone || ''),
    vehicle: String(row.vehicle || ''),
    values: String(row.values || ''),
    total: row.total ? Number(row.total) : 0,
    approval_date: parseExcelDate(row.approval_date),
    destination_state: row.destination_state ? String(row.destination_state) : undefined,
    destination_locality: row.destination_locality ? String(row.destination_locality) : undefined
  };
}