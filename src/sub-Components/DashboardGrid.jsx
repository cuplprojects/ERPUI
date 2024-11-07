import React, { useMemo, useState, useCallback, useEffect } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
import "./../styles/DashboardGrid.css";
import API from '../CustomHooks/MasterApiHooks/api';

// Register AG Grid Modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const DashboardGrid = ({ projectId, lotNo }) => {
  // Set grid container width to 800px and allow it to take full height
  const containerStyle = useMemo(() => ({ height: "100vh" }), []);

  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

  const [rowData, setRowData] = useState([]);
  const [transactionData, setTransactionData] = useState([]); // Added to hold transaction data

  const [columnDefs, setColumnDefs] = useState([

    { field: "quantitySheetId", headerName: "Serial No.", cellStyle: { textAlign: "center" }, headerClass: "center-header" },
    { field: "catchNo", headerName: "Catch No.", cellStyle: { textAlign: "center" }, headerClass: "center-header" },
    { field: "paper", headerName: "Paper", cellStyle: { textAlign: "center" }, headerClass: "center-header" },
    { field: "course", headerName: "Course", cellStyle: { textAlign: "center" }, headerClass: "center-header" },
    { field: "subject", headerName: "Subject", cellStyle: { textAlign: "center" }, headerClass: "center-header" },
    // { field: "innerEnvelope", headerName: "Inner Envelope", cellStyle: { textAlign: "center" }, headerClass: "center-header" },
    // { field: "outerEnvelope", headerName: "Outer Envelope", cellStyle: { textAlign: "center" }, headerClass: "center-header" },
    { field: "quantity", headerName: "Quantity", cellStyle: { textAlign: "center" }, headerClass: "center-header" },
    { field: "percentageCatch", headerName: "Percentage Catch", cellStyle: { textAlign: "center" }, headerClass: "center-header", valueFormatter: params => params.value.toFixed(2) },
    { field: "status", headerName: "Status", cellStyle: { textAlign: "center" }, headerClass: "center-header", valueFormatter: params => {
      const transactionStatus = transactionData.find(transaction => transaction.catchNo === params.data.catchNo)?.status;
      switch (transactionStatus) {
        case 1:
          return "Started";
        case 2:
          return "Completed";
        default:
          return "Pending";
      }
    } },
  ]);

  const defaultColDef = useMemo(() => ({
    editable: true,
    filter: true,
    resizable: true,
    flex: 1 // This will make columns use the available space
  }), []);

  // Auto-size columns when the grid is ready
  const onGridReady = useCallback((params) => {
    setTimeout(() => {
      const allColumnIds = params.columnApi.getAllColumns().map(col => col.getId());
      params.columnApi.autoSizeColumns(allColumnIds, false);
    }, 0);
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await API.get(`/QuantitySheet/Catch?ProjectId=${projectId}&lotNo=${lotNo}`);
        setRowData(response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    const fetchTransactionData = async () => {
      try {
        const response = await API.get(`https://localhost:7212/api/Transactions?ProjectId=${projectId}&ProcessId=${lotNo}`);
        setTransactionData(response.data);
      } catch (error) {
        console.error("Error fetching transaction data:", error);
      }
    };

    fetchTransactions();
    fetchTransactionData();
  }, [projectId, lotNo]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <div style={{ height: '100%', width: '100%' }} className="ag-theme-quartz-dark">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          paginationPageSize={10} // Set default pagination to 10
          pagination={true}
          autoHeight={true}
          width={300}
          height={300}
          paginationOptions={{
            pageSize: 10,
            pageSizes: [10, 25, 50],
          }}
        />
      </div>
    </div>
  );
};

export default DashboardGrid;
