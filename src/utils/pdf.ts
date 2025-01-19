import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { STATUS_LABELS } from './constants';
import { calculateStageDelay } from './stageDelay';
import { calculateTotalBySerialNumber } from './calculations';
import type { Database } from '../types/database';

type ShipmentUpdate = Database['public']['Tables']['shipments_updates']['Row'];

export function generateTrucksStatusPDF(reports: { status: string; shipments: ShipmentUpdate[] }[], allUpdates: ShipmentUpdate[]) {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('Trucks Status Report', 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);

  let yPos = 30;

  reports.forEach((report) => {
    // Add status header
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(STATUS_LABELS[report.status as keyof typeof STATUS_LABELS], 14, yPos);
    
    // Calculate totals
    const totalTrucks = report.shipments.length;
    const grandTotal = report.shipments.reduce((total, shipment) => {
      return total + calculateTotalBySerialNumber(allUpdates, shipment.serial_number);
    }, 0);

    doc.setFontSize(10);
    doc.text(`Trucks: ${totalTrucks} | Total Amount: ${grandTotal.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`, 14, yPos + 6);

    // Add table
    autoTable(doc, {
      startY: yPos + 10,
      head: [[
        'Serial Number',
        'Driver Name',
        'Driver Phone',
        'Vehicle',
        'Transporter',
        'Destination',
        'Stage Delay',
        'Remarks',
        'Total'
      ]],
      body: report.shipments.map(shipment => [
        shipment.serial_number,
        shipment.driver_name,
        shipment.driver_phone,
        shipment.vehicle,
        shipment.transporter,
        `${shipment.destination_state || '-'}\n${shipment.destination_locality || '-'}`,
        `${calculateStageDelay(shipment, allUpdates)} days`,
        shipment.remarks || '-',
        calculateTotalBySerialNumber(allUpdates, shipment.serial_number).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      ]),
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 136, 204] },
    });

    // Update Y position for next section
    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Add new page if needed
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Save the PDF
  doc.save('trucks-status-report.pdf');
}