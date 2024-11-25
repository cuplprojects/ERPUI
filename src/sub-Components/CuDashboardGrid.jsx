// This component has not been used yet

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import Data from './../store/CuAgGrid.json';
import { useNavigate } from 'react-router-dom';

// Register AG Grid Modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const CuDashboardGrid = ({ setClickData }) => {
  const { getCssClasses } = useStore(themeStore);
  const [
    customDark,
    customMid, 
    customLight,
    customBtn,
    customDarkText,
    customLightText,
    customLightBorder,
    customDarkBorder,
    customThead
  ] = getCssClasses();
  const [hasProcesses, setHasProcesses] = useState(false);
  console.log(setClickData);
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

  // Use your local JSON data
  const [rowData, setRowData] = useState(Data);
  const navigate = useNavigate();

  useEffect(() => {
    setClickData(rowData?.[0]);
  }, []);

  const onRowClicked = useCallback((params) => {
    // Update the clicked data using setClickData prop
    setClickData(params.data);
  }, [setClickData]);

  // Set the columns for S.No, Project Name, Percentage of Completion, and Percentage of Remaining
  const columnDefs = useMemo(() => [
    {
      headerName: 'S.No',
      valueGetter: (params) => params.node.rowIndex + 1, // This generates the serial number
      minWidth: 70,
      maxWidth: 90,
      cellStyle: { textAlign: 'center', borderLeft:'1px solid #ccc', borderRight:'1px solid #ccc'  },
    },
    { 
      field: 'projectName', 
      headerName: 'Project Name', 
      minWidth: 150, 
      cellStyle: { textAlign: 'center', borderRight:'1px solid #ccc' },
      onCellClicked: (params) => {
        onRowClicked(params);
      }
    },
    { field: 'completionPercentage', headerName: 'Completion %', minWidth: 100, cellStyle: { textAlign: 'center', borderRight:'1px solid #ccc' } },
    { field: 'remainingPercentage', headerName: 'Remaining %', minWidth: 100, cellStyle: { textAlign: 'center', borderRight:'1px solid #ccc' } },
  ], [onRowClicked]);

  // Apply striped row styling using getRowClass
  const getRowClass = useCallback((params) => {
    return params.node.rowIndex % 2 === 0 ? 'striped-row' : '';
  }, []);

  const onGridSizeChanged = useCallback((params) => {
    const gridWidth = document.querySelector('.ag-body-viewport').clientWidth;
    const columnsToShow = [];
    const columnsToHide = [];
    let totalColsWidth = 0;

    const allColumns = params.columnApi.getAllColumns();
    if (allColumns && allColumns.length > 0) {
      for (let i = 0; i < allColumns.length; i++) {
        const column = allColumns[i];
        totalColsWidth += column.getMinWidth();
        if (totalColsWidth > gridWidth) {
          columnsToHide.push(column.getColId());
        } else {
          columnsToShow.push(column.getColId());
        }
      }
    }

    params.columnApi.setColumnsVisible(columnsToShow, true);
    params.columnApi.setColumnsVisible(columnsToHide, false);

    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 10);
  }, []);

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  return (
    <div style={containerStyle}>
      <div id="grid-wrapper" style={{ width: '100%', height: '100%' }}>
        <div style={gridStyle} className="ag-theme-quartz-dark">
          {console.log(rowData)}
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            getRowClass={getRowClass} 
            onGridSizeChanged={onGridSizeChanged}
            onFirstDataRendered={onFirstDataRendered}
          />
        </div>
      </div>
    </div>
  );
};

export default CuDashboardGrid;
