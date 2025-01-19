import React from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { Notification } from '../common/Notification';
import { parseExcel } from '../../utils/excel';
import { uploadShipmentUpdates } from '../../lib/services/uploadService';
import type { InventoryRow } from '../../types/inventory';

interface ExcelUploadProps {
  onSuccess?: () => void;
}

export function ExcelUpload({ onSuccess }: ExcelUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      setSuccess(null);

      const data = await parseExcel(file);
      const result = await uploadShipmentUpdates(data);

      setSuccess(`Upload successful! ${result.uploaded} records uploaded, ${result.skipped} records skipped (already exist).`);
      event.target.value = ''; // Reset file input
      onSuccess?.(); // Refresh the table data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload data');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-6">
      {error && <Notification type="error" message={error} />}
      {success && <Notification type="success" message={success} />}
      
      <label className="relative flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary cursor-pointer group">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <div className="flex items-center gap-3 text-gray-600 group-hover:text-primary">
          <Upload className="w-5 h-5" />
          <span className="text-sm font-medium">
            {isUploading ? 'Uploading...' : 'Upload Excel File'}
          </span>
        </div>
      </label>

      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
        <AlertCircle className="w-4 h-4" />
        <span>Supported formats: .xlsx, .xls</span>
      </div>
    </div>
  );
}