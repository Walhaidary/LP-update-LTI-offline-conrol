import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { LOReportData } from '../../types/lo-report';

export function generateLOReportPDF(data: LOReportData[]) {
  const doc = new jsPDF('landscape');
  
  // Add title
  doc.setFontSize(16);
  doc.text('Loading Order Report', 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);

  // Add summary
  doc.setFontSize(12);
  doc.text(`Total Loading Orders: ${data.length}`, 14, 30);
  
  const totalMT = data.reduce((sum, item) => sum + item.mt_net, 0);
  doc.text(`Total MT: ${totalMT.toFixed(3)}`, 14, 37);

  // Add table
  autoTable(doc, {
    startY: 45,
    head: [[
      'LO Number',
      'LTI Reference',
      'Driver',
      'Vehicle',
      'Transporter',
      'Commodity',
      'Storage Location',
      'Gate Number',
      'Batch Number',
      'Loading Date',
      'Created At',
      'Destination',
      'MT Net'
    ]],
    body: data.map(item => [
      item.outbound_delivery_number,
      item.lti,
      item.driver_name,
      item.vehicle_plate,
      item.transporter_name,
      item.material_description,
      item.storage_location_name,
      item.gate_number,
      item.batch_number,
      new Date(item.loading_date).toLocaleDateString(),
      new Date(item.created_at).toLocaleDateString(),
      item.destination,
      item.mt_net.toFixed(3)
    ]),
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 136, 204] },
  });

  // Save the PDF
  doc.save('loading-order-report.pdf');
}