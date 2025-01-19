import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../../lib/supabase';
import type { LOReportData } from '../../types/lo-report';

interface GroupedItems {
  [storageLocation: string]: LOReportData[];
}

export async function generatePrintableLO(item: LOReportData | LOReportData[]) {
  const items = Array.isArray(item) ? item : [item];
  
  // Group items by storage location
  const groupedItems = items.reduce<GroupedItems>((acc, curr) => {
    const location = curr.storage_location_name;
    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(curr);
    return acc;
  }, {});

  // Generate a separate PDF for each storage location
  Object.entries(groupedItems).forEach(([location, locationItems]) => {
    // Create PDF with Arabic support
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const firstItem = locationItems[0];

    // Header section
    doc.setFontSize(16);
    doc.text('Loading Order', 14, 15);
    
    doc.setFontSize(10);
    doc.text(`LO Number: ${firstItem.outbound_delivery_number}`, 14, 25);
    doc.text(`Date: ${new Date(firstItem.loading_date).toLocaleDateString()}`, 14, 30);
    doc.text(`Storage Location: ${location}`, 14, 35);

    // Driver & Vehicle Info
    doc.text('Driver Information:', 14, 45);
    doc.text(`Name: ${firstItem.driver_name}`, 20, 50);
    doc.text(`Vehicle: ${firstItem.vehicle_plate}`, 20, 55);
    doc.text(`Transporter: ${firstItem.transporter_name}`, 20, 60);

    // Destination Info
    doc.text('Destination Information:', 14, 70);
    doc.text(`Location: ${firstItem.destination}`, 20, 75);

    // Items table with Arabic support
    autoTable(doc, {
      startY: 85,
      head: [[
        'Line No.',
        'Gate No.',
        'Commodity',
        'Batch No.',
        'Quantity (MT)'
      ]],
      body: locationItems.map(item => [
        item.outbound_delivery_item_number,
        item.gate_number || '',
        item.material_description || '',
        item.batch_number || '',
        item.mt_net.toFixed(3)
      ]),
      theme: 'grid',
      styles: { 
        fontSize: 10,
        cellPadding: 5,
        minCellHeight: 12,
        halign: 'center',
        valign: 'middle',
        font: 'helvetica'
      },
      headStyles: { 
        fillColor: [0, 136, 204],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center' },
        2: { halign: 'right' }, // Right align for Arabic text
        4: { halign: 'right' }
      },
      footStyles: { 
        fillColor: [240, 240, 240],
        fontStyle: 'bold'
      },
      foot: [[
        'Total',
        '',
        '',
        '',
        locationItems.reduce((sum, item) => sum + item.mt_net, 0).toFixed(3)
      ]]
    });

    // Signature sections
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.text('Signatures:', 14, finalY + 20);
    doc.text('Driver: _________________', 14, finalY + 30);
    doc.text('Warehouse: _________________', 120, finalY + 30);
    doc.text('Security: _________________', 14, finalY + 40);
    doc.text('Quality: _________________', 120, finalY + 40);

    // Notes section
    doc.text('Notes:', 14, finalY + 55);
    doc.rect(14, finalY + 60, 180, 40);

    // Save with storage location in filename
    const safeLocation = location.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `loading_order_${firstItem.outbound_delivery_number}_${safeLocation}.pdf`;
    doc.save(filename);
  });
}