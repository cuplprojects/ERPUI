import React, { useState } from 'react';
import { Table, Input, Row, Col, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import themeStore from '../store/themeStore';
import { RollbackOutlined } from '@ant-design/icons';
import { success } from '../CustomHooks/Services/AlertMessageService';

const ArchivedLots = () => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn] = cssClasses;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [sortedInfo, setSortedInfo] = useState({});

  // Sample data - replace with actual API call in production
  const sampleArchivedLots = [
    {
      id: 1,
      lotNumber: 'LOT-2024-001',
      completedPercentage: 85,
      archivedBy: 'John Doe',
      archivedDate: '2024-03-20',
    },
    {
      id: 2,
      lotNumber: 'LOT-2024-002',
      completedPercentage: 92,
      archivedBy: 'Jane Smith',
      archivedDate: '2024-03-19',
    },
    {
      id: 3,
      lotNumber: 'LOT-2024-003',
      completedPercentage: 78,
      archivedBy: 'Mike Johnson',
      archivedDate: '2024-03-18',
    },
  ];

  const handleUnarchive = (record) => {
    // Implement unarchive logic here
    success(t('lotUnarchived'));
  };

  const columns = [
    {
      align: 'center',
      title: t('sn'),
      dataIndex: 'serial',
      key: 'serial',
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: t('lotNumber'),
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      sorter: (a, b) => a.lotNumber.localeCompare(b.lotNumber),
      sortOrder: sortedInfo.columnKey === 'lotNumber' && sortedInfo.order,
    },
    {
      title: t('completedPercentage'),
      dataIndex: 'completedPercentage',
      key: 'completedPercentage',
      sorter: (a, b) => a.completedPercentage - b.completedPercentage,
      sortOrder: sortedInfo.columnKey === 'completedPercentage' && sortedInfo.order,
      render: (percentage) => `${percentage}%`,
    },
    {
      title: t('archivedBy'),
      dataIndex: 'archivedBy',
      key: 'archivedBy',
      sorter: (a, b) => a.archivedBy.localeCompare(b.archivedBy),
      sortOrder: sortedInfo.columnKey === 'archivedBy' && sortedInfo.order,
    },
    {
      title: t('archivedDate'),
      dataIndex: 'archivedDate',
      key: 'archivedDate',
      sorter: (a, b) => new Date(a.archivedDate) - new Date(b.archivedDate),
      sortOrder: sortedInfo.columnKey === 'archivedDate' && sortedInfo.order,
    },
    {
      title: t('action'),
      key: 'action',
      render: (_, record) => (
        <Button
          className={`${customBtn} d-flex align-items-center justify-content-center`}
          onClick={() => handleUnarchive(record)}
          icon={<RollbackOutlined />}
        >
        </Button>
      ),
    }
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const filteredLots = sampleArchivedLots.filter(lot =>
    Object.values(lot).some(value =>
      value && value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <>
      <Row justify="end" align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          <Input.Search
            placeholder={t('searchLots')}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: '300px' }}
          />
        </Col>
      </Row>

      <div className="table-responsive">
        <Table
          columns={columns}
          dataSource={filteredLots}
          onChange={handleTableChange}
          pagination={{
            className: 'p-3 rounded rounded-top-0',
            current: currentPage,
            pageSize: pageSize,
            total: filteredLots.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} ${t('of')} ${total} ${t('items')}`,
            pageSizeOptions: ['10', '15', '20']
          }}
          rowKey="id"
          bordered
          scroll={{ x: 'max-content' }}
          className={`${customDark === "default-dark" ? "thead-default" : ""}
              ${customDark === "red-dark" ? "thead-red" : ""}
              ${customDark === "green-dark" ? "thead-green" : ""}
              ${customDark === "blue-dark" ? "thead-blue" : ""}
              ${customDark === "dark-dark" ? "thead-dark" : ""}
              ${customDark === "pink-dark" ? "thead-pink" : ""}
              ${customDark === "purple-dark" ? "thead-purple" : ""}
              ${customDark === "light-dark" ? "thead-light" : ""}
              ${customDark === "brown-dark" ? "thead-brown" : ""} custom-pagination`}
        />
      </div>
    </>
  );
};

export default ArchivedLots;
