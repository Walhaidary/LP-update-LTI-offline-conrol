import React from 'react';
import { FileDown, Printer } from 'lucide-react';
import { Pagination } from '../common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { generateLOReportPDF } from '../../utils/pdf/loReport';
import { PrintableLO } from './PrintableLO';
import type { LOReportData } from '../../types/lo-report';

interface LOReportTableProps {
  data: LOReportData[];
  isLoading: boolean;
}

export function LOReportTable({ data, isLoading }: LOReportTableProps) {
  const [showPrintable, setShowPrintable] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState<LOReportData[]>([]);
  
  const {
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    paginate,
    totalPages,
  } = usePagination(10);

  const handleDownloadPDF = () => {
    generateLOReportPDF(data);
  };

  const handlePrintLO = (items: LOReportData | LOReportData[]) => {
    const itemsToPrint = Array.isArray(items) ? items : [items];
    setSelectedItems(itemsToPrint);
    setShowPrintable(true);
  };

  // Group items by LO number for batch printing
  const groupedByLO = React.useMemo(() => {
    return data.reduce((acc, item) => {
      if (!acc[item.outbound_delivery_number]) {
        acc[item.outbound_delivery_number] = [];
      }
      acc[item.outbound_delivery_number].push(item);
      return acc;
    }, {} as Record<string, LOReportData[]>);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (showPrintable) {
    return (
      <PrintableLO 
        data={selectedItems} 
        onClose={() => setShowPrintable(false)} 
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded hover:bg-gray-50"
        >
          <FileDown className="w-4 h-4" />
          Download Report
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-gray-500">
              <th className="px-4 py-3 font-medium">Actions</th>
              <th className="px-4 py-3 font-medium">LO Number</th>
              <th className="px-4 py-3 font-medium">Line Number</th>
              <th className="px-4 py-3 font-medium">LTI Reference</th>
              <th className="px-4 py-3 font-medium">Driver</th>
              <th className="px-4 py-3 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Transporter</th>
              <th className="px-4 py-3 font-medium">Commodity</th>
              <th className="px-4 py-3 font-medium">Storage Location</th>
              <th className="px-4 py-3 font-medium">Gate Number</th>
              <th className="px-4 py-3 font-medium">Batch Number</th>
              <th className="px-4 py-3 font-medium">Loading Date</th>
              <th className="px-4 py-3 font-medium">MT Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginate(data).map((item) => (
              <tr key={`${item.outbound_delivery_number}-${item.outbound_delivery_item_number}`} className="hover:bg-gray-50">
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => handlePrintLO(item)}
                    className="p-1 text-gray-500 hover:text-primary"
                    title="Print Single Line"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  {groupedByLO[item.outbound_delivery_number]?.length > 1 && (
                    <button
                      onClick={() => handlePrintLO(groupedByLO[item.outbound_delivery_number])}
                      className="p-1 text-gray-500 hover:text-primary"
                      title="Print All Lines"
                    >
                      <Printer className="w-4 h-4" />
                      <span className="text-xs">All</span>
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">{item.outbound_delivery_number}</td>
                <td className="px-4 py-3 text-sm">{item.outbound_delivery_item_number}</td>
                <td className="px-4 py-3 text-sm">{item.lti}</td>
                <td className="px-4 py-3 text-sm">{item.driver_name}</td>
                <td className="px-4 py-3 text-sm">{item.vehicle_plate}</td>
                <td className="px-4 py-3 text-sm">{item.transporter_name}</td>
                <td className="px-4 py-3 text-sm font-arabic text-right" dir="rtl">
                  {item.material_description}
                </td>
                <td className="px-4 py-3 text-sm">{item.storage_location_name}</td>
                <td className="px-4 py-3 text-sm">{item.gate_number}</td>
                <td className="px-4 py-3 text-sm">{item.batch_number}</td>
                <td className="px-4 py-3 text-sm">
                  {new Date(item.loading_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {item.mt_net.toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages(data.length)}
        itemsPerPage={itemsPerPage}
        totalItems={data.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(items) => {
          setItemsPerPage(items);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}