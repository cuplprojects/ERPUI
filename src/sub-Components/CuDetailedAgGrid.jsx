import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import API from '../CustomHooks/MasterApiHooks/api';
import { useTranslation } from 'react-i18next';

// Register AG Grid Modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const CuDetailedAgGrid = ({ projectId }) => {
  const { t } = useTranslation();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

  const [rowData, setRowData] = useState([]);
  const [processNames, setProcessNames] = useState({});

  useEffect(() => {
    // Fetch process names
    const fetchProcessNames = async () => {
      try {
        const response = await API.get('/Processes');
        const processMap = {};
        response.data.forEach(process => {
          processMap[process.id] = process.name;
        });
        setProcessNames(processMap);
      } catch (error) {
        console.error('Error fetching process names:', error);
      }
    };

    fetchProcessNames();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (projectId) {
        try {
          const response = await API.get(`/Transactions/process-lot-percentages?projectId=${projectId}`);
          const processData = response.data.processes.map(process => ({
            processName: processNames[process.processId] || `Process ${process.processId}`,
            totalCatch: process.statistics.totalSheets,
            remainingCatch: process.statistics.totalSheets - process.statistics.completedSheets,
            totalQuantity: process.statistics.totalQuantity,
            // remainingQuantity: process.statistics.totalQuantity * (1 - process.statistics.overallPercentage / 100)
          }));
          setRowData(processData);
        } catch (error) {
          console.error('Error fetching process data:', error);
        }
      }
    };

    if (Object.keys(processNames).length > 0) {
      fetchData();
    }
  }, [projectId, processNames]);

  // Default column definition for styling headers
  const defaultColDef = useMemo(() => ({
    autoHeaderHeight: true,
    headerClass: 'header-wrap',
    cellStyle: { borderRight: '1px solid #ccc' }
  }), []);

  const columnDefs = useMemo(() => [
    {
      headerName: t('sn'),
      valueGetter: (params) => params.node.rowIndex + 1,
      minWidth: 70,
      maxWidth: 90,
      cellStyle: { textAlign: t('center'), borderRight: '1px solid #ccc', borderLeft: '1px solid #ccc' }
    },
    { field: 'processName', headerName: t('processes'), minWidth: 150, cellStyle: { borderRight: '1px solid #ccc' } },
    { field: 'totalCatch', headerName: t('totalCatches'), minWidth: 100, cellStyle: { textAlign: 'center', borderRight: '1px solid #ccc' } },
    { field: 'remainingCatch', headerName: t('remainingCatches'), minWidth: 100, cellStyle: { textAlign: 'center' } },
    { field: 'totalQuantity', headerName: t('totalQuantity'), minWidth: 95, cellStyle: { textAlign: 'center', borderRight: '1px solid #ccc' } },
    // { field: 'remainingQuantity', headerName: 'Remaining Quantity', minWidth: 100, cellStyle: { textAlign: 'center', borderRight: '1px solid #ccc' } }
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
