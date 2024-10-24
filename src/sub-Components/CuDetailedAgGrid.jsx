import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';

// Register AG Grid Modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const CuDetailedAgGrid = ({ clickData }) => {
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    if (clickData && clickData.processes) { console.log(clickData);
      setRowData(clickData.processes);
    }
  }, [clickData]);

  // Default column definition for styling headers
  const defaultColDef = useMemo(() => ({
    autoHeaderHeight: true,
    headerClass: 'header-wrap',
    cellStyle: { borderRight: '1px solid #ccc' } // Add vertical line between columns
  }), []);

  const columnDefs = useMemo(() => [
    {
      headerName: 'S.No',
      valueGetter: (params) => params.node.rowIndex + 1,
      minWidth: 70,
      maxWidth: 90,
      cellStyle: { textAlign: 'center', borderRight: '1px solid #ccc', borderLeft: '1px solid #ccc' }
    },
    { field: 'processName', headerName: 'Processes', minWidth: 150, cellStyle: { borderRight: '1px solid #ccc' } },
    { field: 'totalCatch', headerName: 'Total Catch', minWidth: 100, cellStyle: { textAlign: 'center', borderRight: '1px solid #ccc' } },
    { field: 'remainingCatch', headerName: 'Remaining Catch', minWidth: 100, cellStyle: { textAlign: 'center' } },
    { field: 'totalQuantity', headerName: 'Total Quantity', minWidth: 95, cellStyle: { textAlign: 'center', borderRight: '1px solid #ccc' } },
    { field: 'remainingQuantity', headerName: 'Remaining Quantity', minWidth: 100, cellStyle: { textAlign: 'center', borderRight: '1px solid #ccc' } }
    
  ], []);

  const getRowClass = useCallback((params) => {
    return params.node.rowIndex % 2 === 0 ? 'striped-row' : '';
  }, []);

  const onGridSizeChanged = useCallback((params) => {
    const gridWidth = document.querySelector('.ag-body-viewport')?.clientWidth;
    if (!gridWidth) return;

    const columnsToShow = [];
    const columnsToHide = [];
    let totalColsWidth = 0;

    const allColumns = params?.columnApi?.getAllColumns();
    if (allColumns && allColumns?.length > 0) {
      for (let i = 0; i < allColumns?.length; i++) {
        const column = allColumns[i];
        totalColsWidth += column.getMinWidth();
        if (totalColsWidth > gridWidth) {
          columnsToHide.push(column.getColId());
        } else {
          columnsToShow.push(column.getColId());
        }
      }
    }

    params?.columnApi?.setColumnsVisible(columnsToShow, true);
    params?.columnApi?.setColumnsVisible(columnsToHide, false);

    params?.api.sizeColumnsToFit();
  }, []);

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  return (
    <div style={containerStyle}>
      <style>
        {`
          .header-wrap .ag-header-cell-label {
            display: flex;
            align-items: center;
            justify-content: center;
            white-space: normal;
            text-align: center;
          }
        `}
      </style>

      <div id="grid-wrapper" style={{ width: '850px', height: '100%' }}>
        <div style={gridStyle} className="ag-theme-quartz-dark">
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            getRowClass={getRowClass}
            onGridSizeChanged={onGridSizeChanged}
            onFirstDataRendered={onFirstDataRendered}
          />
        </div>
      </div>
    </div>
  );
};

export default CuDetailedAgGrid;
