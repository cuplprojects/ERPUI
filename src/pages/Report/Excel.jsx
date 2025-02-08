import { Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { FaFileExcel } from "react-icons/fa";

const ExcelExport = ({ data, projectName, groupName, visibleColumns }) => {
  const handleExcelExport = () => {
    try {
      const wb = XLSX.utils.book_new();

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
      ].filter(Boolean); // Remove false values

      // Create worksheet data
      const wsData = [
        ['Quantity Sheets Report', '', '', 'Group: ' + (groupName || 'N/A'), 'Project: ' + (projectName || 'N/A'), 'Date: ' + new Date().toLocaleString()], // Title and metadata in one row
        [], // Empty row
        headers, // Headers
        // Data rows
        ...data.map(sheet => {
          const row = [
            visibleColumns.catchNo && sheet.catchNo,
            visibleColumns.subject && sheet.subject,
            visibleColumns.course && sheet.course,
            visibleColumns.paper && sheet.paper,
            visibleColumns.examDate && new Date(sheet.examDate).toLocaleDateString(),
            visibleColumns.examTime && sheet.examTime,
            visibleColumns.quantity && sheet.quantity,
            visibleColumns.pageNo && sheet.pages,
            visibleColumns.status && sheet.catchStatus, // Changed to directly use catchStatus
            visibleColumns.innerEnvelope && sheet.innerEnvelope,
            visibleColumns.outerEnvelope && sheet.outerEnvelope,
            visibleColumns.dispatchDate && sheet.dispatchDate
          ].filter((_, index) => headers[index]); // Only include data for visible columns
          return row;
        })
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths based on visible columns
      ws['!cols'] = headers.map(() => ({ wch: 15 })); // Default width for all columns

      // Merge cells for title components
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Merge first 3 cells for report title
        { s: { r: 0, c: 3 }, e: { r: 0, c: 3 } }, // Group cell
        { s: { r: 0, c: 4 }, e: { r: 0, c: 4 } }, // Project cell
        { s: { r: 0, c: 5 }, e: { r: 0, c: 5 } }  // Date cell
      ];

      // Define header colors
      const headerColors = [
        "FF0000", "FF8C00", "FFD700", "32CD32", "20B2AA",
        "4169E1", "8A2BE2", "FF1493", "FF4500", "2E8B57"
      ];

      // Apply styles
      headers.forEach((_, i) => {
        try {
          // Style title row
          if (i <= 5) {
            const titleCell = XLSX.utils.encode_cell({r: 0, c: i});
            if (ws[titleCell]) {
              ws[titleCell].s = {
                font: { bold: true, size: 12 },
                fill: { fgColor: { rgb: "90EE90" } },
                alignment: { horizontal: 'center', vertical: 'center' }
              };
            }
          }

          // Style headers
          const headerCell = XLSX.utils.encode_cell({r: 2, c: i});
          if (ws[headerCell]) {
            ws[headerCell].s = {
              font: { bold: true, color: { rgb: "FFFFFF" }, size: 11 },
              fill: { fgColor: { rgb: headerColors[i] } },
              alignment: { horizontal: 'center', vertical: 'center' }
            };
          }

          // Style data cells
          for (let r = 3; r < 3 + data.length; r++) {
            const dataCell = XLSX.utils.encode_cell({r: r, c: i});
            if (ws[dataCell]) {
              ws[dataCell].s = {
                font: { size: 10 },
                alignment: { vertical: 'center', wrapText: true },
                border: {
                  top: { style: 'thin', color: { rgb: "CCCCCC" } },
                  bottom: { style: 'thin', color: { rgb: "CCCCCC" } },
                  left: { style: 'thin', color: { rgb: "CCCCCC" } },
                  right: { style: 'thin', color: { rgb: "CCCCCC" } }
                }
              };

              // Add color to status cells
              if (headers[i] === "Status") {
                const status = ws[dataCell].v;
                if (status === "Completed") {
                  ws[dataCell].s.fill = { fgColor: { rgb: "2ECC71" } }; // Green
                } else if (status === "Running") {
                  ws[dataCell].s.fill = { fgColor: { rgb: "3498DB" } }; // Blue
                } else if (status === "Pending") {
                  ws[dataCell].s.fill = { fgColor: { rgb: "E74C3C" } }; // Red
                }
              }
            }
          }
        } catch (error) {
          console.warn(`Error styling column ${i}:`, error);
        }
      });

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Quantity Sheets");

      // Generate Excel file
      const dateStr = new Date().toISOString().slice(0,10);
      const fileName = projectName ? 
        `quantity-sheets-${projectName}-${dateStr}.xlsx` : 
        `quantity-sheets-report-${dateStr}.xlsx`;

      XLSX.writeFile(wb, fileName);

    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export Excel file");
    }
  };

  return (
    <span 
      className="ms-2"
      onClick={handleExcelExport}
      style={{ cursor: 'pointer' }}
    >
      <FaFileExcel className="p-0" color='green' size={40}/>
      {/* Export Excel */}
    </span>
  );
};

export default ExcelExport;
