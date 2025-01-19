import * as XLSX from 'xlsx';
import { InventoryRow, COLUMN_MAPPINGS } from '../types/inventory';

export async function parseExcel(file: File): Promise<InventoryRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        // Map and validate data
        const validatedData = rawData.map((row: any, index) => {
          const mappedRow: Partial<InventoryRow> = {};

          // Map each column using the COLUMN_MAPPINGS
          Object.entries(row).forEach(([key, value]) => {
            const mappedKey = COLUMN_MAPPINGS[key as keyof typeof COLUMN_MAPPINGS];
            if (mappedKey) {
              mappedRow[mappedKey] = value;
            }
          });

          // Validate required fields
          const requiredFields: (keyof InventoryRow)[] = [
            'PK',
            'line_number',
            'serial_number',
            'driver_name',
            'driver_phone',
            'vehicle'
          ];

          const missingFields = requiredFields.filter(field => !mappedRow[field]);
          if (missingFields.length > 0) {
            throw new Error(
              `Row ${index + 2} is missing required fields: ${missingFields.join(', ')}`
            );
          }

          // Convert types
          return {
            PK: Number(mappedRow.PK),
            line_number: String(mappedRow.line_number),
            serial_number: String(mappedRow.serial_number),
            driver_name: String(mappedRow.driver_name),
            driver_phone: String(mappedRow.driver_phone),
            vehicle: String(mappedRow.vehicle),
            values: mappedRow.values ? Number(mappedRow.values) : 0,
            total: mappedRow.total ? Number(mappedRow.total) : 0
          };
        });

        resolve(validatedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}