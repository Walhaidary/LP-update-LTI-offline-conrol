import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { LTISTO } from '../../types/lti-sto';

export function generateLTISTOPDF(data: LTISTO[]) {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('LTI/STO Report', 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);

  // Add summary
  doc.setFontSize(12);
  doc.text('Summary', 14, 30);
  
  const totalNet = data.reduce((sum, item) => sum + item.lti_qty_net, 0);
  const totalGross = data.reduce((sum, item) => sum + item.lti_qty_gross, 0);
  
  doc.setFontSize(10);
  doc.text(`Total LTIs/STOs: ${data.length}`, 14, 37);
  doc.text(`Total Net Quantity: ${totalNet.toFixed(2)} MT`, 14, 44);
  doc.text(`Total Gross Quantity: ${totalGross.toFixed(2)} MT`, 14, 51);

  // Add table
  autoTable(doc, {
    startY: 60,
    head: [[
      'LTI Number',
      'Transporter',
      'Origin',
      'Destination',
      'Commodity',
      'Net Qty (MT)',
      'Gross Qty (MT)',
      'Date'
    ]],
    body: data.map(item => [
      item.lti_number,
      item.transporter_name,
      item.origin_location,
      item.destination_location,
      item.commodity_description || '-',
      item.lti_qty_net.toFixed(2),
      item.lti_qty_gross.toFixed(2),
      new Date(item.lti_date).toLocaleDateString()
    ]),
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 136, 204] },
  });

  // Save the PDF
  doc.save('lti-sto-report.pdf');
}