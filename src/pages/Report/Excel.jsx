import { Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';

const ExcelExport = ({ data, projectName, groupName, visibleColumns }) => {
  const handleExcelExport = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Define headers based on visible columns
      const headers = [
        visibleColumns.catchNo && "Catch No",
        visibleColumns.subject && "Subject",
        visibleColumns.course && "Course",
        visibleColumns.examDate && "Exam Date",
        visibleColumns.examTime && "Exam Time",
        visibleColumns.quantity && "Quantity",
        visibleColumns.pageNo && "Page No",
        visibleColumns.status && "Status",
        visibleColumns.dispatchDate && "Dispatch Date"
      ].filter(Boolean); // Remove false values

      // Create worksheet data
      const wsData = [
        ['Quantity Sheets Report'], // Title
        [], // Empty row
        ['Group:', groupName || 'N/A'],
        ['Project:', projectName || 'N/A'],
        ['Generated on:', new Date().toLocaleString()],
        [], // Empty row
        headers, // Headers
        // Data rows
        ...data.map(sheet => {
          const row = [
            visibleColumns.catchNo && sheet.catchNo,
            visibleColumns.subject && sheet.paper,
            visibleColumns.course && sheet.course,
            visibleColumns.examDate && new Date(sheet.examDate).toLocaleDateString(),
            visibleColumns.examTime && sheet.examTime,
            visibleColumns.quantity && sheet.quantity,
            visibleColumns.pageNo && sheet.pages,
            visibleColumns.status && sheet.catchStatus,
            visibleColumns.dispatchDate && sheet.dispatchDate
          ].filter((_, index) => headers[index]); // Only include data for visible columns
          return row;
        })
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths based on visible columns
      ws['!cols'] = headers.map(() => ({ wch: 15 })); // Default width for all columns

      // Merge cells for title
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
      ];

      // Define header colors
      const headerColors = [
        "FF0000", "FF8C00", "FFD700", "32CD32", "20B2AA",
        "4169E1", "8A2BE2", "FF1493", "FF4500", "2E8B57"
      ];

      // Apply styles
      headers.forEach((_, i) => {
        // Style title
        if (i === 0) {
          const titleCell = XLSX.utils.encode_cell({r: 0, c: i});
          ws[titleCell].s = {
            font: { bold: true, size: 16 },
            fill: { fgColor: { rgb: "90EE90" } },
            alignment: { horizontal: 'center' }
          };
        }

        // Style metadata
        for (let r = 2; r <= 4; r++) {
          const metaCell = XLSX.utils.encode_cell({r: r, c: i});
          if (ws[metaCell]) {
            ws[metaCell].s = {
              font: { bold: true, size: 11 },
              fill: { fgColor: { rgb: "E0EEE0" } },
              alignment: { horizontal: 'left' }
            };
          }
        }

        // Style headers
        const headerCell = XLSX.utils.encode_cell({r: 6, c: i});
        if (ws[headerCell]) {
          ws[headerCell].s = {
            font: { bold: true, color: { rgb: "FFFFFF" }, size: 11 },
            fill: { fgColor: { rgb: headerColors[i] } },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        }

        // Style data cells
        for (let r = 7; r < 7 + data.length; r++) {
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
          }
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
    <Button 
      variant="success" 
      className="ms-2"
      onClick={handleExcelExport}
    >
      Export Excel
    </Button>
  );
};

export default ExcelExport;
