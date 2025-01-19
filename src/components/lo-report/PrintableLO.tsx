import React from 'react';
import { Activity } from 'lucide-react';
import type { LOReportData } from '../../types/lo-report';

interface PrintableLOProps {
  data: LOReportData[];
  onClose: () => void;
}

export function PrintableLO({ data, onClose }: PrintableLOProps) {
  // Print after component mounts
  React.useEffect(() => {
    window.print();
  }, []);

  const firstItem = data[0];

  return (
    <div className="fixed inset-0 bg-white overflow-auto">
      <button 
        onClick={onClose}
        className="fixed top-4 right-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover print:hidden z-50"
      >
        Close
      </button>

      <div className="max-w-[210mm] mx-auto p-4 print:p-2">
        {/* Header Table */}
        <table className="w-full mb-4">
          <tbody>
            <tr>
              <td className="w-3/4">
                <div className="flex items-center gap-2">
                  <Activity className="w-12 h-12 text-[#417505]" />
                  <div>
                    <h1 className="text-xl font-bold">Waybill</h1>
                    <p className="text-xs text-gray-600">Original/Issuing office/Warehouse/book</p>
                  </div>
                </div>
              </td>
              <td className="w-1/4 text-right">
                <div className="text-base font-bold">WB</div>
                <div className="text-base">No {firstItem.outbound_delivery_number}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Transaction Details */}
        <div className="mb-4">
          <h2 className="text-lg font-bold bg-gray-100 px-4 py-2 mb-4">I. TRANSACTION DETAILS</h2>
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">
                  <label className="block text-sm font-medium">Origin Location</label>
                  <p className="text-sm">{firstItem.departure}</p>
                </td>
                <td className="border border-gray-300 p-2">
                  <label className="block text-sm font-medium">Origin SL Description</label>
                  <p className="text-sm">{firstItem.storage_location_name}</p>
                </td>
                <td className="border border-gray-300 p-2">
                  <label className="block text-sm font-medium">Destination Location</label>
                  <p className="text-sm">{firstItem.destination}</p>
                </td>
                <td className="border border-gray-300 p-2">
                  <label className="block text-sm font-medium">Destination SL</label>
                  <p className="text-sm">{firstItem.unloading_point || '-'}</p>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">
                  <label className="block text-sm font-medium">Date of Waybill</label>
                  <p className="text-sm">{new Date(firstItem.loading_date).toLocaleDateString()}</p>
                </td>
                <td className="border border-gray-300 p-2">
                  <label className="block text-sm font-medium">Consignee</label>
                  <p className="text-sm">{firstItem.consignee || '-'}</p>
                </td>
                <td className="border border-gray-300 p-2">
                  <label className="block text-sm font-medium">FRN/CF</label>
                  <p className="text-sm">{firstItem.frn_cf_number || '-'}</p>
                </td>
                <td className="border border-gray-300 p-2">
                  <label className="block text-sm font-medium">Transporter</label>
                  <p className="text-sm">{firstItem.transporter_name}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Commodity Details */}
        <div className="mb-8">
          <h2 className="text-lg font-bold bg-gray-100 px-4 py-2 mb-4">II. COMMODITY DETAILS</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 text-sm font-medium">Line No.</th>
                <th className="border border-gray-300 p-2 text-sm font-medium">Commodity</th>
                <th className="border border-gray-300 p-2 text-sm font-medium">Batch No.</th>
                <th className="border border-gray-300 p-2 text-sm font-medium">Units</th>
                <th className="border border-gray-300 p-2 text-sm font-medium">Quantity (MT)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={`${item.outbound_delivery_number}-${item.outbound_delivery_item_number}`}>
                  <td className="border border-gray-300 p-2 text-center">{item.outbound_delivery_item_number}</td>
                  <td className="border border-gray-300 p-2 font-arabic text-right" dir="rtl">
                    {item.material_description}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">{item.batch_number || '-'}</td>
                  <td className="border border-gray-300 p-2 text-center">1</td>
                  <td className="border border-gray-300 p-2 text-right">{item.mt_net.toFixed(3)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-medium">
                <td colSpan={4} className="border border-gray-300 p-2 text-right">Total:</td>
                <td className="border border-gray-300 p-2 text-right">
                  {data.reduce((sum, item) => sum + item.mt_net, 0).toFixed(3)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Certification of Commodities Loaded */}
        <div className="mb-8">
          <h2 className="text-lg font-bold bg-gray-100 px-4 py-2 mb-4">III. CERTIFICATION OF COMMODITIES LOADED</h2>
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 w-1/2">
                  <div className="text-center font-bold mb-2 text-sm">WAREHOUSE/DISPATCH POINT</div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-medium">Name:</div>
                      <div className="border-b border-gray-400 h-4"></div>
                    </div>
                    <div>
                      <div className="text-xs font-medium">Title:</div>
                      <div className="border-b border-gray-400 h-4"></div>
                    </div>
                    <div className="text-xs">
                      I hereby certify the loading of the commodities as described above
                    </div>
                    <div>
                      <div className="text-xs font-medium">Name, Signature and Stamp:</div>
                      <div className="border-b border-gray-400 h-4 mt-2"></div>
                    </div>
                  </div>
                </td>
                <td className="border border-gray-300 p-2 w-1/2">
                  <div className="text-center font-bold mb-2 text-sm">TRANSPORT CONTRACTOR</div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-medium">Driver Name:</div>
                      <div className="text-sm">{firstItem.driver_name}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium">Vehicle Registration:</div>
                      <div className="text-sm">{firstItem.vehicle_plate}</div>
                    </div>
                    <div className="text-xs">
                      On behalf of the transporter I hereby certify the receipt of the commodities 
                      as described above in good condition.
                    </div>
                    <div>
                      <div className="text-xs font-medium">Name, Signature and Stamp:</div>
                      <div className="border-b border-gray-400 h-4 mt-2"></div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Certification of Commodities Received */}
        <div className="mb-8">
          <h2 className="text-lg font-bold bg-gray-100 px-4 py-2 mb-4">IV. CERTIFICATION OF COMMODITIES RECEIVED</h2>
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 w-1/2">
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-medium">Location:</div>
                      <div className="border-b border-gray-400 h-4"></div>
                    </div>
                    <div>
                      <div className="text-xs font-medium">Name:</div>
                      <div className="border-b border-gray-400 h-4"></div>
                    </div>
                    <div>
                      <div className="text-xs font-medium">Arrival Date:</div>
                      <div className="border-b border-gray-400 h-4"></div>
                    </div>
                    <div>
                      <div className="text-xs font-medium">End of Discharge Date:</div>
                      <div className="border-b border-gray-400 h-4"></div>
                    </div>
                  </div>
                </td>
                <td className="border border-gray-300 p-2 w-1/2">
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-medium">Consignee:</div>
                      <div className="border-b border-gray-400 h-4"></div>
                    </div>
                    <div>
                      <div className="text-xs font-medium">Title:</div>
                      <div className="border-b border-gray-400 h-4"></div>
                    </div>
                    <div>
                      <div className="text-xs font-medium">Start of Discharge Date:</div>
                      <div className="border-b border-gray-400 h-4"></div>
                    </div>
                    <div>
                      <div className="text-xs font-medium">Distance (KM):</div>
                      <div className="border-b border-gray-400 h-4"></div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Observations Section */}
        <div>
          <h2 className="text-lg font-bold bg-gray-100 px-4 py-2 mb-4">V. OBSERVATIONS</h2>
          <table className="w-full border-collapse text-sm mb-4">
            <thead>
              <tr>
                <th className="border border-gray-300 p-1 text-xs font-medium">Batch No.</th>
                <th className="border border-gray-300 p-1 text-xs font-medium">Commodity</th>
                <th className="border border-gray-300 p-1 text-xs font-medium">Units</th>
                <th className="border border-gray-300 p-1 text-xs font-medium">Net MT</th>
                <th className="border border-gray-300 p-1 text-xs font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={`obs-${item.outbound_delivery_number}-${item.outbound_delivery_item_number}`}>
                  <td className="border border-gray-300 p-1">{item.batch_number || '-'}</td>
                  <td className="border border-gray-300 p-1 font-arabic text-right" dir="rtl">
                    {item.material_description}
                  </td>
                  <td className="border border-gray-300 p-1 text-center">1</td>
                  <td className="border border-gray-300 p-1 text-right">{item.mt_net.toFixed(3)}</td>
                  <td className="border border-gray-300 p-1">_______</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Final Certification */}
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 w-1/2">
                  <div className="text-xs mb-2">
                    On behalf of the consignee, I hereby certify receipt of the commodities loaded.
                  </div>
                  <div className="h-8"></div>
                  <div className="text-xs font-medium">Name, Signature and Stamp:</div>
                  <div className="text-[10px] text-gray-500">(Please endorse with official stamp)</div>
                  <div className="border-b border-gray-400 mt-1"></div>
                </td>
                <td className="border border-gray-300 p-2 w-1/2">
                  <div className="text-xs mb-2">
                    On behalf of the transport contractor, I hereby certify delivery of the commodities.
                  </div>
                  <div className="h-8"></div>
                  <div className="text-xs font-medium">Name, Signature and Stamp:</div>
                  <div className="text-[10px] text-gray-500">(Please endorse with official stamp)</div>
                  <div className="border-b border-gray-400 mt-1"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}