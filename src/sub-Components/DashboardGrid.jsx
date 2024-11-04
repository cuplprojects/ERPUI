import React, { useMemo, useState, useCallback } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
import "./../styles/DashboardGrid.css";
import Data from './../store/dummyData.json';

// Register AG Grid Modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const DashboardGrid = () => {
  // Set grid container width to 800px and allow it to take full height
  const containerStyle = useMemo(() => ({ height: "100vh" }), []);

  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

  const [rowData, setRowData] = useState(Data);

  const [columnDefs, setColumnDefs] = useState([
    {
      field: "srNo",
      headerName: "S.No",
      cellStyle: { textAlign: "center" },
      headerClass: "center-header",
      minWidth: 70, // Reduce the width for the "S.No" column
      maxWidth: 100  // Set a maximum width for the "S.No" column
    },
    { field: "catchNumber", headerName: "Catch No.", cellStyle: { textAlign: "center" }, headerClass: "center-header"},
    { field: "quantity", headerName: "Quantity", cellStyle: { textAlign: "center" }, headerClass: "center-header"},
    { field: "status", headerName: "Status", cellStyle: { textAlign: "center" }, headerClass: "center-header"},
    { field: "interimQuantity", headerName: "Interim Quantity", cellStyle: { textAlign: "center" }, headerClass: "center-header"},
    { field: "remarks", headerName: "Remarks", cellStyle: { textAlign: "center" }, headerClass: "center-header"},
  ]);

  const defaultColDef = useMemo(() => ({
    editable: true,
    filter: true,
    resizable: true,
  }), []);

  // Auto-size columns when the grid is ready
  const onGridReady = useCallback((params) => {
    setTimeout(() => {
      const allColumnIds = params.columnApi.getAllColumns().map(col => col.getId());
      params.columnApi.autoSizeColumns(allColumnIds, false);
    }, 0);
  }, []);

  return (
    <div style={containerStyle}>
      <div style={gridStyle} className="ag-theme-quartz-dark">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          paginationPageSize={5}
          pagination={true}
        />
      </div>
    </div>
  );
};

export default DashboardGrid;
