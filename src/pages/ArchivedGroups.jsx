import React, { useState } from 'react';
import { Table, Input, Row, Col, Button, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import themeStore from '../store/themeStore';
import { RollbackOutlined } from '@ant-design/icons';
import { success } from '../CustomHooks/Services/AlertMessageService';
import { useMediaQuery } from 'react-responsive';
import { FaSearch } from "react-icons/fa";

const ArchivedGroups = () => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [sortedInfo, setSortedInfo] = useState({});

  const isMobile = useMediaQuery({ maxWidth: 767 });

  // Sample data - replace with actual API call in production
  const sampleArchivedGroups = [
    {
      id: 1,
      groupName: 'Group H - Booklet',
      archivedBy: 'John Doe',
      archivedDate: '2024-03-20',
    },
    {
      id: 2,
      groupName: 'Group Alpha - Paper',
      archivedBy: 'Jane Smith',
      archivedDate: '2024-03-19',
    },
  ];

  const handleUnarchive = (record) => {
    // Implement unarchive logic here
    success(t('groupUnarchived'));
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
      title: t('groupName'),
      dataIndex: 'groupName',
      key: 'groupName',
      sorter: (a, b) => a.groupName.localeCompare(b.groupName),
      sortOrder: sortedInfo.columnKey === 'groupName' && sortedInfo.order,
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
          title={t('unarchive')}
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

  const filteredGroups = sampleArchivedGroups.filter(group =>
    Object.values(group).some(value =>
      value && value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <div style={{
      padding: isMobile ? '10px' : '20px',
      background: '#fff',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      overflowX: 'auto'
    }}
    className={`rounded-2 ${customDark === "dark-dark" ? `${customDark} border text-white` : `${customDarkText}`}`}>
      <Divider className={`fs-3 mt-0 ${customDarkText}`}>
        {t("archivedGroups")}
      </Divider>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: isMobile ? '10px' : '20px'
      }}>
        <div className="d-flex align-items-center">
          <Input
            placeholder={t('searchGroups')}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200, height: 32 }}
            className={`mb-2 rounded-2 ${customDark === "dark-dark" ? ` ${customLightBorder} text-dark` : `${customDarkText}`} ${customDarkBorder} rounded-end-0`}
            allowClear
          />
          <Button
            className={`mb-2 rounded-2 ${customBtn} ${customDark === "dark-dark" ? `border-white` : `border-0`} rounded-start-0`}
            style={{ height: 32 }}
          >
            <FaSearch />
          </Button>
        </div>
      </div>

      <div className="table-responsive">
        <Table
          columns={columns}
          dataSource={filteredGroups}
          onChange={handleTableChange}
          pagination={{
            className: 'p-3 rounded rounded-top-0',
            current: currentPage,
            pageSize: pageSize,
            total: filteredGroups.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} ${t('of')} ${total} ${t('items')}`,
            pageSizeOptions: ['10', '15', '20']
          }}
          rowKey="id"
          bordered
          scroll={{ x: 'max-content' }}
          size={isMobile ? 'small' : 'middle'}
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
    </div>
  );
};

export default ArchivedGroups;
