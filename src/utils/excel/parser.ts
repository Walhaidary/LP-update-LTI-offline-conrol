import * as XLSX from 'xlsx';
import { InventoryRow, COLUMN_MAPPINGS } from '../../types/inventory';
import { validateRow } from './validators';
import { transformRow } from './transformers';

export async function parseExcel(file: File): Promise<InventoryRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with raw values
        const rawData = XLSX.utils.sheet_to_json(worksheet, { raw: true });

        // Process each row
        const errors: string[] = [];
        const processedData = rawData.map((row: any, index) => {
          const mappedRow: Partial<InventoryRow> = {};

          // Map columns
          Object.entries(row).forEach(([key, value]) => {
            const mappedKey = COLUMN_MAPPINGS[key as keyof typeof COLUMN_MAPPINGS];
            if (mappedKey) {
              mappedRow[mappedKey] = value;
            }
          });

          // Validate
          const rowErrors = validateRow(mappedRow, index);
          if (rowErrors.length > 0) {
            errors.push(...rowErrors);
            return null;
          }

          // Transform
          return transformRow(mappedRow);
        }).filter((row): row is InventoryRow => row !== null);

        if (errors.length > 0) {
          throw new Error(errors.join('\n'));
        }

        resolve(processedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}