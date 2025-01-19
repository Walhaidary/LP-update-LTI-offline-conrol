import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Database } from '../../types/database';

type ShipmentUpdate = Database['public']['Tables']['shipments_updates']['Row'];

export function generateDeliveredTrucksPDF(trucks: ShipmentUpdate[]) {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('Delivered Trucks Report', 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);

  // Add summary
  doc.setFontSize(12);
  doc.text(`Total Delivered Trucks: ${trucks.length}`, 14, 30);
  
  const totalAmount = trucks.reduce((sum, truck) => sum + truck.total, 0);
  doc.text(`Total Amount: ${totalAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`, 14, 37);

  // Add table
  autoTable(doc, {
    startY: 45,
    head: [[
      'Serial Number',
      'Driver Name',
      'Driver Phone',
      'Vehicle',
      'Transporter',
      'Destination',
      'Total'
    ]],
    body: trucks.map(truck => [
      truck.serial_number,
      truck.driver_name,
      truck.driver_phone,
      truck.vehicle,
      truck.transporter,
      `${truck.destination_state || '-'}\n${truck.destination_locality || '-'}`,
      truck.total.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    ]),
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 136, 204] },
  });

  // Save the PDF
  doc.save('delivered-trucks-report.pdf');
}