import React from 'react';
import { Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaFilePdf } from "react-icons/fa6";

const PdfExport = ({ data, projectName, groupName, visibleColumns }) => {
  const exportToPDF = () => {
    // Create PDF in portrait A4 format
    const doc = new jsPDF('p', 'mm', 'a4');
    
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

    // Map of headers to their corresponding data fields
    const headerMap = {
      'Catch No': sheet => sheet.catchNo,
      'Subject': sheet => sheet.subject,
      'Course': sheet => sheet.course,
      'Paper': sheet => sheet.paper,
      'Exam Date': sheet => new Date(sheet.examDate).toLocaleDateString('en-GB'),
      'Exam Time': sheet => sheet.examTime,
      'Quantity': sheet => sheet.quantity,
      'Pages': sheet => sheet.pages,
      'Status': sheet => sheet.catchStatus === 'Completed' ? 'Completed' :
                        sheet.catchStatus === 'Running' ? 'Running' :
                        sheet.catchStatus === 'Pending' ? 'Pending' : 'N/A',
      'Inner Envelope': sheet => sheet.innerEnvelope,
      'Outer Envelope': sheet => sheet.outerEnvelope,
      'Dispatch Date': sheet => sheet.dispatchDate
    };

    // Column width configurations
    const columnWidthMap = {
      'Catch No': { fontStyle: 'bold', width: 15 },
      'Subject': { width: 25 },
      'Course': { width: 20 },
      'Paper': { width: 20 },
      'Exam Date': { width: 18 },
      'Exam Time': { width: 15 },
      'Quantity': { halign: 'right', width: 12 },
      'Pages': { width: 15 },
      'Status': { halign: 'center', width: 15 },
      'Inner Envelope': { width: 20 },
      'Outer Envelope': { width: 20 },
      'Dispatch Date': { width: 20 }
    };

    // Get visible headers based on visibleColumns
    const headers = Object.entries(visibleColumns)
      .filter(([key, isVisible]) => isVisible)
      .map(([key]) => {
        const headerKey = key.replace(/([A-Z])/g, ' $1').trim(); // Convert camelCase to Title Case
        return headerKey.charAt(0).toUpperCase() + headerKey.slice(1);
      });

    // Format table data using the header map
    const tableData = data.map(sheet => {
      return headers.map(header => {
        const dataFn = headerMap[header];
        return dataFn ? dataFn(sheet) : '';
      });
    });

    // Build column styles object
    const columnStyles = {};
    headers.forEach((header, index) => {
      columnStyles[index] = columnWidthMap[header];
    });

    // Add table with improved styling for A4
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 8,
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
      columnStyles: columnStyles,
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
    <span 
      onClick={exportToPDF}
      className="ms-2 px-3"
      
    >
      <FaFilePdf size={40} color='purple' />
    </span>
  );
};

export default PdfExport;
