import * as XLSX from 'xlsx';
import { LTISTOExcelRow, LTI_STO_COLUMN_MAPPINGS } from '../../types/lti-sto';

export function parseLTISTOExcel(file: File): Promise<LTISTOExcelRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with raw values
        const rawData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: true,
          dateNF: 'yyyy-mm-dd'
        });

        // Validate and transform the data
        const validatedData = rawData
          .map((row: any) => {
            // Check if all required fields are present
            const requiredFields = [
              'Transporter name', 'Transporter code', 'LTI number', 
              'LTI line', 'LTI date', 'Origin CO', 'Origin loc.',
              'Origin SL Desc.', 'Dest. Loc.', 'Dest. SL',
              'LTI qty (MT) Net', 'LTI qty (MT) Gross'
            ];

            const missingFields = requiredFields.filter(field => !row[field]);
            if (missingFields.length > 0) {
              console.warn(`Row missing required fields: ${missingFields.join(', ')}`);
              return null;
            }

            // Ensure numeric fields are numbers
            if (typeof row['LTI qty (MT) Net'] !== 'number' || 
                typeof row['LTI qty (MT) Gross'] !== 'number') {
              console.warn('Invalid quantity values');
              return null;
            }

            return row as LTISTOExcelRow;
          })
          .filter((row): row is LTISTOExcelRow => row !== null);

        resolve(validatedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}