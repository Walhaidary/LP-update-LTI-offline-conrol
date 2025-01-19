import React from 'react';
import { Activity } from 'lucide-react';
import type { LTISTO } from '../../types/lti-sto';

interface PrintableLTIProps {
  data: LTISTO[];
  onClose: () => void;
}

export function PrintableLTI({ data, onClose }: PrintableLTIProps) {
  // Print after component mounts
  React.useEffect(() => {
    window.print();
  }, []);

  // Sort data by line number
  const sortedData = [...data].sort((a, b) => {
    const aNum = parseInt(a.lti_line);
    const bNum = parseInt(b.lti_line);
    return aNum - bNum;
  });

  const firstItem = sortedData[0];

  // Group items by 5 for pagination
  const itemGroups = sortedData.reduce<LTISTO[][]>((acc, item, index) => {
    const groupIndex = Math.floor(index / 5);
    if (!acc[groupIndex]) {
      acc[groupIndex] = [];
    }
    acc[groupIndex].push(item);
    return acc;
  }, []);

  return (
    <div className="fixed inset-0 bg-white overflow-auto">
      {/* Print close button - hidden when printing */}
      <button 
        onClick={onClose}
        className="fixed top-4 right-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover print:hidden z-50"
      >
        Close
      </button>

      {/* Render each group of items on a separate page */}
      {itemGroups.map((group, pageIndex) => (
        <div 
          key={pageIndex} 
          className={`
            max-w-[210mm] mx-auto p-8 print:p-4 
            ${pageIndex > 0 ? 'page-break-before-always mt-8 print:mt-0' : ''}
          `}
        >
          {/* Header Section */}
          <div className="flex justify-between items-start border-b border-gray-300 pb-4 mb-6">
            <div className="flex items-center gap-4">
              <Activity className="w-16 h-16 text-[#417505]" />
              <div>
                <h1 className="text-2xl font-bold">Landside Transport Instruction</h1>
                <p className="text-sm text-gray-600">Original/Issuing office/Warehouse/book</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold mb-1">LTI</div>
              <div className="text-lg">No {firstItem.lti_number}</div>
              {pageIndex > 0 && (
                <div className="text-sm text-gray-600">Page {pageIndex + 1}</div>
              )}
            </div>
          </div>

          {/* Transaction Details Section - Show only on first page */}
          {pageIndex === 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold bg-gray-100 px-4 py-2 mb-4">I TRANSACTION DETAILS</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-300 p-3">
                  <label className="text-sm font-medium">Agreement Number/Log No. And Date of Contract</label>
                  <p>{firstItem.frn_cf || '-'}</p>
                </div>
                <div className="border border-gray-300 p-3">
                  <label className="text-sm font-medium">LTI Date</label>
                  <p>{new Date(firstItem.lti_date).toLocaleDateString()}</p>
                </div>
                <div className="border border-gray-300 p-3">
                  <label className="text-sm font-medium">Origin (Location)</label>
                  <p>{firstItem.origin_location}</p>
                  <p className="text-sm mt-2">Point of Reference:</p>
                  <p>{firstItem.origin_sl_desc}</p>
                </div>
                <div className="border border-gray-300 p-3">
                  <label className="text-sm font-medium">Destination (Location)</label>
                  <p>{firstItem.destination_location}</p>
                  <p className="text-sm mt-2">Consignee:</p>
                  <p>{firstItem.consignee || '-'}</p>
                </div>
                <div className="border border-gray-300 p-3">
                  <label className="text-sm font-medium">Commodity Release Note/Order</label>
                  <p>{firstItem.tpo_number || '-'}</p>
                </div>
                <div className="border border-gray-300 p-3">
                  <label className="text-sm font-medium">Transporter</label>
                  <p>{firstItem.transporter_name}</p>
                  <p className="text-sm text-gray-600">{firstItem.transporter_code}</p>
                </div>
              </div>
            </div>
          )}

          {/* Commodity Details Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold bg-gray-100 px-4 py-2 mb-4">
              II COMMODITY DETAILS {pageIndex > 0 ? `(Continued)` : ''}
            </h2>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 text-sm font-medium">COI Number</th>
                  <th className="border border-gray-300 p-2 text-sm font-medium">Commodity</th>
                  <th className="border border-gray-300 p-2 text-sm font-medium">Packing</th>
                  <th className="border border-gray-300 p-2 text-sm font-medium">Number of Units</th>
                  <th className="border border-gray-300 p-2 text-sm font-medium">Net Weight (MT)</th>
                  <th className="border border-gray-300 p-2 text-sm font-medium">Gross Weight (MT)</th>
                  <th className="border border-gray-300 p-2 text-sm font-medium">Unit Weight</th>
                </tr>
              </thead>
              <tbody>
                {group.map((item) => (
                  <tr key={`${item.lti_number}-${item.lti_line}`}>
                    <td className="border border-gray-300 p-2">{item.lti_line}</td>
                    <td className="border border-gray-300 p-2 font-arabic text-right" dir="rtl">
                      {item.commodity_description}
                    </td>
                    <td className="border border-gray-300 p-2">{item.batch_number || '-'}</td>
                    <td className="border border-gray-300 p-2 text-right">1</td>
                    <td className="border border-gray-300 p-2 text-right">{item.lti_qty_net.toFixed(3)}</td>
                    <td className="border border-gray-300 p-2 text-right">{item.lti_qty_gross.toFixed(3)}</td>
                    <td className="border border-gray-300 p-2 text-right">-</td>
                  </tr>
                ))}
                {/* Add subtotal for this page */}
                <tr className="bg-gray-50 font-medium">
                  <td colSpan={4} className="border border-gray-300 p-2 text-right">Page Subtotal:</td>
                  <td className="border border-gray-300 p-2 text-right">
                    {group.reduce((sum, item) => sum + item.lti_qty_net, 0).toFixed(3)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {group.reduce((sum, item) => sum + item.lti_qty_gross, 0).toFixed(3)}
                  </td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Approving Certification Section - Show only on last page */}
          {pageIndex === itemGroups.length - 1 && (
            <>
              <div className="mb-8">
                <h2 className="text-lg font-bold bg-gray-100 px-4 py-2 mb-4">III APPROVING CERTIFICATION</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium mb-2">Issued by:</p>
                    <div className="border-b border-gray-300 h-8 mb-2"></div>
                    <p className="font-medium mb-2">Title:</p>
                    <div className="border-b border-gray-300 h-8 mb-2"></div>
                    <p className="font-medium mb-2">Signature:</p>
                    <div className="border-b border-gray-300 h-8"></div>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Approving Officer:</p>
                    <div className="border-b border-gray-300 h-8 mb-2"></div>
                    <p className="font-medium mb-2">Title:</p>
                    <div className="border-b border-gray-300 h-8 mb-2"></div>
                    <p className="font-medium mb-2">Signature and Stamp:</p>
                    <div className="border-b border-gray-300 h-8"></div>
                  </div>
                </div>
              </div>

              {/* Observations Section */}
              <div>
                <h2 className="text-lg font-bold bg-gray-100 px-4 py-2 mb-4">IV OBSERVATIONS</h2>
                <p className="text-sm text-gray-600 mb-2">Please use this section to indicate important information that can not be included in the boxes above</p>
                <div className="border border-gray-300 min-h-[100px] p-4">
                  {firstItem.remarks || ''}
                </div>
              </div>

              {/* Footer Notes */}
              <div className="mt-4 text-xs text-gray-500">
                <p>1. Origin Type: Please indicate whether vessel, Warehouse or Vehicle</p>
                <p>2. Point of Reference: Please record in this area either the Bill of Lading No, the Warehouse name (silo code)/or waybill no, depending on the item indicated under "Type"</p>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}