import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table, Input } from 'antd';
import API from '../CustomHooks/MasterApiHooks/api';
import { useTranslation } from 'react-i18next';
import themeStore from '../store/themeStore';
import { useStore } from 'zustand';

const { Search } = Input;

const CuDetailedAgGrid = ({ projectId , clickedProject }) => {
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
  const { t } = useTranslation();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);

  const [rowData, setRowData] = useState([]);
  const [processNames, setProcessNames] = useState({});
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);

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
          const processData = response.data.processes.map((process, index) => ({
            key: index,
            sn: index + 1,
            processName: processNames[process.processId] || `Process ${process.processId}`,
            totalCatch: process.statistics.totalSheets,
            remainingCatch: process.statistics.totalSheets - process.statistics.completedSheets,
            totalQuantity: process.statistics.totalQuantity,
          }));
          setRowData(processData);
          setFilteredData(processData);
        } catch (error) {
          console.error('Error fetching process data:', error);
        }
      }
    };

    if (Object.keys(processNames).length > 0) {
      fetchData();
    }
  }, [projectId, processNames]);

  useEffect(() => {
    const filtered = rowData.filter(item => 
      Object.values(item).some(val => 
        val?.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
    setFilteredData(filtered);
  }, [searchText, rowData]);

  const columns = [
    {
      title: t('sn'),
      dataIndex: 'sn',
      key: 'sn',
      width: '10%',
      align: 'center',
      className: 'border-right',
      sorter: (a, b) => a.sn - b.sn
    },
    {
      title: t('processes'),
      dataIndex: 'processName',
      key: 'processName',
      width: '20%',
      className: 'border-right',
      sorter: (a, b) => a.processName.localeCompare(b.processName)
    },
    {
      title: t('totalCatches'),
      dataIndex: 'totalCatch',
      key: 'totalCatch',
      width: '15%',
      align: 'center',
      className: 'border-right',
      sorter: (a, b) => a.totalCatch - b.totalCatch
    },
    {
      title: t('remainingCatches'),
      dataIndex: 'remainingCatch',
      key: 'remainingCatch',
      width: '15%',
      align: 'center',
      className: 'border-right',
      sorter: (a, b) => a.remainingCatch - b.remainingCatch
    },
    {
      title: t('totalQuantity'),
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: '10%',
      align: 'center',
      className: 'border-right',
      sorter: (a, b) => a.totalQuantity - b.totalQuantity
    }
  ];

  return (
    <div style={containerStyle}>
      <div id="grid-wrapper" style={{ width: '100%', height: '100%', maxWidth: '850px', margin: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 className={`${customDarkText}`}>
            {clickedProject || t("selectProject")}
          </h4>
          <Search
            placeholder={t('search')}
            allowClear
            onChange={e => setSearchText(e.target.value)}
            style={{ width: '200px', maxWidth: '100%' }}
            // className={`${customDarkBorder} rounded-3`}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            position: ['bottomCenter'],
            pageSize: 8,
            showSizeChanger: true,
            // showQuickJumper: true,
            pageSizeOptions: ['8', '10', '20', '50'],
            showTotal: (total) => `${t("total")} ${total} ${t("items")}`,
            className: `${customDark === "dark-dark"? "bg-white" : `${customMid}`} p-3 rounded-bottom border`
          }}
          size="small"
          bordered
          scroll={{ y: 350 }}
          rowClassName={(record, index) => index % 2 === 0 ? 'striped-row' : ''}
          className={`${customDark === "default-dark" ? "thead-default" : ""}
            ${customDark === "red-dark" ? "thead-red" : ""}
            ${customDark === "green-dark" ? "thead-green" : ""}
            ${customDark === "blue-dark" ? "thead-blue" : ""}
            ${customDark === "dark-dark" ? "thead-dark" : ""}
            ${customDark === "pink-dark" ? "thead-pink" : ""}
            ${customDark === "purple-dark" ? "thead-purple" : ""}
            ${customDark === "light-dark" ? "thead-light" : ""}
            ${customDark === "brown-dark" ? "thead-brown" : ""} `}
          style={{
            height: 'calc(100% - 50px)',
            width: '100%',
            maxWidth: '850px',
            margin: 'auto'
          }}
        />
      </div>
    </div>
  );
};

export default CuDetailedAgGrid;
