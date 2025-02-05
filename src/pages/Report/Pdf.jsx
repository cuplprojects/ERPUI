import React from 'react';
import { Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PdfExport = ({ data, projectName, groupName }) => {
  const exportToPDF = () => {
    // Create PDF in portrait A4 format
    const doc = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, a4 size (210 x 297 mm)
    
    // Add title with styling
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.setFont("helvetica", "bold");
    doc.text('Quantity Sheets Report', doc.internal.pageSize.width/2, 15, {align: 'center'});
    
    // Add project and group info
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    doc.setFont("helvetica", "normal");
    doc.text(`Group: ${groupName || 'N/A'}`, 20, 25);
    doc.text(`Project: ${projectName || 'N/A'}`, 20, 30);
    
    // Add timestamp
    doc.setFontSize(8);
    doc.setTextColor(127, 140, 141);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, doc.internal.pageSize.width - 20, 25, {align: 'right'});

    // Format data for table
    const tableData = data.map(sheet => ([
      sheet.catchNo,
      new Date(sheet.examDate).toLocaleDateString(),
      sheet.examTime,
      sheet.lotNo,
      sheet.quantity,
      sheet.status === 1 ? 'Active' : 'Inactive',
      sheet.transactionData?.zoneDescriptions?.join(', ') || 'N/A',
      sheet.transactionData?.teamDetails?.map(team => 
        `${team.teamName}: ${team.userNames.join(', ')}`
      ).join(' | ') || 'N/A',
      sheet.transactionData?.machineNames?.join(', ') || 'N/A',
      sheet.processNames.join(', ')
    ]));

    // Add table with improved styling for A4
    doc.autoTable({
      head: [[
        'Catch No',
        'Exam Date',
        'Exam Time',
        'Lot No',
        'Quantity',
        'Status',
        'Zone',
        'Team',
        'Machine',
        'Process Names'
      ]],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
        lineColor: [189, 195, 199],
        lineWidth: 0.1,
        font: "helvetica",
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 2
      },
      bodyStyles: {
        textColor: [44, 62, 80]
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249]
      },
      columnStyles: {
        0: { fontStyle: 'bold', width: 15 },  // Catch No
        1: { width: 18 },                     // Exam Date
        2: { width: 15 },                     // Exam Time
        3: { width: 15 },                     // Lot No
        4: { halign: 'right', width: 12 },    // Quantity
        5: { halign: 'center', width: 15 },   // Status
        6: { fontSize: 6, width: 25 },        // Zone
        7: { fontSize: 6, width: 35 },        // Team
        8: { fontSize: 6, width: 25 },        // Machine
        9: { fontSize: 6, width: 25 }         // Process Names
      },
      margin: { top: 25, right: 15, bottom: 15, left: 15 },
      didDrawPage: function(data) {
        // Add page number at bottom
        doc.setFontSize(8);
        doc.text(
          `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`,
          doc.internal.pageSize.width/2, 
          doc.internal.pageSize.height - 10,
          {align: 'center'}
        );
      },
      showHead: 'firstPage'
    });

    // Save PDF with formatted name including project
    const dateStr = new Date().toISOString().slice(0,10);
    const fileName = projectName ? 
      `quantity-sheets-${projectName}-${dateStr}.pdf` : 
      `quantity-sheets-report-${dateStr}.pdf`;
    doc.save(fileName);
  };

  return (
    <Button 
      variant="danger" 
      onClick={exportToPDF}
      className="ms-2"
    >
      Export PDF
    </Button>
  );
};

export default PdfExport;
