import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FormField } from '../../../common/FormField';
import type { LTILine } from '../types';

interface LTILinesStepProps {
  lines: LTILine[];
  onAddLine: () => void;
  onRemoveLine: (id: string) => void;
  onLineChange: (id: string, field: keyof LTILine, value: string) => void;
}

export function LTILinesStep({ lines, onAddLine, onRemoveLine, onLineChange }: LTILinesStepProps) {
  return (
    <div className="space-y-8">
      {lines.map((line, index) => (
        <div key={line.id} className="relative p-6 border rounded-lg bg-gray-50">
          <div className="absolute right-4 top-4">
            <button
              onClick={() => onRemoveLine(line.id)}
              className="p-1 text-gray-500 hover:text-red-500"
              disabled={lines.length === 1}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <h4 className="text-lg font-medium mb-4">Line {index + 1}</h4>
          
          <div className="space-y-6">
            <FormField
              label="Line Number"
              description="Auto-generated line number"
              value={line.lineNumber}
              onChange={(value) => onLineChange(line.id, 'lineNumber', value)}
              disabled={true}
              required
            />

            {/* Rest of the fields remain the same */}
          </div>
        </div>
      ))}

      <button
        onClick={onAddLine}
        className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded hover:bg-gray-50"
      >
        <Plus className="w-4 h-4" />
        Add Another Line
      </button>
    </div>
  );
}