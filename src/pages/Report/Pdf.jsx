import React from 'react';
import { Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

    // Define headers based on visible columns
    const headers = [
      visibleColumns.catchNo && "Catch No",
      visibleColumns.subject && "Subject",
      visibleColumns.course && "Course",
      visibleColumns.paper && "Paper",
      visibleColumns.examDate && "Exam Date",
      visibleColumns.examTime && "Exam Time",
      visibleColumns.quantity && "Quantity",
      visibleColumns.pageNo && "Pages",
      visibleColumns.status && "Status",
      visibleColumns.innerEnvelope && "Inner Envelope",
      visibleColumns.outerEnvelope && "Outer Envelope",
      visibleColumns.dispatchDate && "Dispatch Date"
    ].filter(Boolean);

    // Format data for table based on visible columns
    const tableData = data.map(sheet => {
      const row = [
        visibleColumns.catchNo && sheet.catchNo,
        visibleColumns.subject && sheet.subject,
        visibleColumns.course && sheet.course,
        visibleColumns.paper && sheet.paper,
        visibleColumns.examDate && new Date(sheet.examDate).toLocaleDateString(),
        visibleColumns.examTime && sheet.examTime,
        visibleColumns.quantity && sheet.quantity,
        visibleColumns.pageNo && sheet.pages,
        visibleColumns.status && sheet.catchStatus,
        visibleColumns.innerEnvelope && sheet.innerEnvelope,
        visibleColumns.outerEnvelope && sheet.outerEnvelope,
        visibleColumns.dispatchDate && sheet.dispatchDate
      ].filter((_, index) => headers[index]); // Only include data for visible columns
      return row;
    });

    // Calculate column widths based on visible columns
    const columnStyles = {};
    let currentIndex = 0;

    if (visibleColumns.catchNo) {
      columnStyles[currentIndex++] = { fontStyle: 'bold', width: 15 };
    }
    if (visibleColumns.subject) {
      columnStyles[currentIndex++] = { width: 25 };
    }
    if (visibleColumns.course) {
      columnStyles[currentIndex++] = { width: 20 };
    }
    if (visibleColumns.paper) {
      columnStyles[currentIndex++] = { width: 25 };
    }
    if (visibleColumns.examDate) {
      columnStyles[currentIndex++] = { width: 18 };
    }
    if (visibleColumns.examTime) {
      columnStyles[currentIndex++] = { width: 15 };
    }
    if (visibleColumns.quantity) {
      columnStyles[currentIndex++] = { halign: 'right', width: 12 };
    }
    if (visibleColumns.pageNo) {
      columnStyles[currentIndex++] = { width: 15 };
    }
    if (visibleColumns.status) {
      columnStyles[currentIndex++] = { halign: 'center', width: 15 };

    }
    if (visibleColumns.innerEnvelope) {
      columnStyles[currentIndex++] = { width: 15 };
    }
    if (visibleColumns.outerEnvelope) {
      columnStyles[currentIndex++] = { width: 15 };
    }
    if (visibleColumns.dispatchDate) {
      columnStyles[currentIndex++] = { width: 20 };
    }

    // Add table with improved styling for A4
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [189, 195, 199],
        lineWidth: 0.1,
        font: "helvetica",
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [41, 128, 185], // Pleasant blue color for header
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 3,
        minCellHeight: 12
      },
      bodyStyles: {
        textColor: [44, 62, 80],
        fontSize: 8,
        cellPadding: 2,
        minCellHeight: 10
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249] // Light blue-gray for alternate rows
      },
      columnStyles: {
        ...columnStyles,
        // Add specific styling for status column
        [headers.indexOf('Status')]: {
          halign: 'center',
          cellCallback: function(cell, data) {
            if (cell.text === 'Completed') {
              cell.fillColor = [46, 204, 113, 0.2]; // Light green
            } else if (cell.text === 'Running') {
              cell.fillColor = [52, 152, 219, 0.2]; // Light blue
            } else if (cell.text === 'Pending') {
              cell.fillColor = [231, 76, 60, 0.2]; // Light red
            }
          }
        },
        // Right align quantity column
        [headers.indexOf('Quantity')]: {
          halign: 'right'
        }
      },
      margin: { top: 25, right: 15, bottom: 15, left: 15 },
      didDrawPage: function(data) {
        // Add continuation text on subsequent pages (without headers)
        if (data.pageNumber > 1) {
          doc.setFontSize(10);
          doc.setTextColor(44, 62, 80);
          doc.text('Quantity Sheets Report - Continued', doc.internal.pageSize.width/2, 15, {align: 'center'});
        }
        
        // Add footer with page number
        doc.setFontSize(8);
        doc.setTextColor(127, 140, 141);
        doc.text(
          `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`,
          doc.internal.pageSize.width/2, 
          doc.internal.pageSize.height - 10,
          {align: 'center'}
        );

        // Add watermark-style timestamp
        doc.setFontSize(8);
        doc.setTextColor(189, 195, 199);
        doc.text(
          `Generated: ${new Date().toLocaleString()}`,
          15,
          doc.internal.pageSize.height - 10
        );
      },
      showHead: 'firstPage',
      theme: 'grid',
      tableLineColor: [189, 195, 199],
      tableLineWidth: 0.1
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
      className="ms-2 px-3"
    >
      Export PDF
    </Button>
  );
};

export default PdfExport;
