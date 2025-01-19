import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface LTILine {
  id: string;
  lineNumber: string;
  batchNumber: string;
  commodityDescription: string;
  netQuantity: string;
  grossQuantity: string;
  remarks: string;
}

interface LinesStepProps {
  lines: LTILine[];
  onAddLine: () => void;
  onRemoveLine: (id: string) => void;
  onLineChange: (id: string, field: keyof LTILine, value: string) => void;
}

export function LinesStep({ lines, onAddLine, onRemoveLine, onLineChange }: LinesStepProps) {
  return (
    <div className="space-y-6">
      {lines.map((line) => (
        <div key={line.id} className="bg-gray-50 p-6 rounded-lg relative">
          <button
            onClick={() => onRemoveLine(line.id)}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-500"
            title="Remove line"
            disabled={lines.length === 1}
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Line Number</label>
              <input
                type="text"
                value={line.lineNumber}
                disabled
                className="mt-1 w-full px-3 py-2 bg-gray-100 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Batch Number</label>
              <input
                type="text"
                value={line.batchNumber}
                onChange={(e) => onLineChange(line.id, 'batchNumber', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Commodity Description</label>
            <input
              type="text"
              value={line.commodityDescription}
              onChange={(e) => onLineChange(line.id, 'commodityDescription', e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Net Quantity (MT)</label>
              <input
                type="number"
                step="0.01"
                value={line.netQuantity}
                onChange={(e) => onLineChange(line.id, 'netQuantity', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gross Quantity (MT)</label>
              <input
                type="number"
                step="0.01"
                value={line.grossQuantity}
                onChange={(e) => onLineChange(line.id, 'grossQuantity', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Line Remarks</label>
            <textarea
              value={line.remarks}
              onChange={(e) => onLineChange(line.id, 'remarks', e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary resize-y"
              rows={2}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAddLine}
        className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Line
      </button>
    </div>
  );
}