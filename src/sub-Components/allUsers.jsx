import React, { useEffect, useState } from 'react';
import { Table, Select, Input, Space, Modal, Button, Typography, Row, Col, Card, Checkbox } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; // Import AntD styles
import { fetchUsers } from '../CustomHooks/ApiServices/userService';

const { Option } = Select;
const { Title } = Typography;

const AllUsers = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [filterType, setFilterType] = useState('none');
  const [filterValue, setFilterValue] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [editingUserId, setEditingUserId] = useState(null);
  const [currentUserData, setCurrentUserData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  // Set initial state for visibleColumns with checkboxes off by default
  const [visibleColumns, setVisibleColumns] = useState({
    profilePicture: false,  // Initially unchecked
    address: false,         // Initially unchecked
    mobileNo: false,        // Initially unchecked
  });
  // Fetch data from the API on mount
  useEffect(() => {
    const GetUsers = async () => {
      try {
        const res = await fetchUsers();
        setFilteredData(res);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    GetUsers();
  }, []);

  const handleFilterChange = (value) => {
    setFilterType(value);
    setFilterValue('');
  };

  const handleSearch = () => {
    let filtered = filteredData;
    if (filterType === 'name' && filterValue) {
      filtered = filteredData.filter(user => user.firstName.toLowerCase().includes(filterValue.toLowerCase()));
    }
    setFilteredData(filtered);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
  };

  const handleColumnVisibilityChange = (e, column) => {
    setVisibleColumns({ ...visibleColumns, [column]: e.target.checked });
  };
  const columns = [
    {
      title: 'Sr. No.',
      key: 'serial',
      render: (text, record, index) => index + 1,
      fixed: 'left',
    },
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
      fixed: 'left',
    },
    {
      title: 'Full Name',
      key: 'fullName',
      render: (record) => `${record.firstName} ${record.middleName} ${record.lastName}`,
      fixed: 'left',
    },
    {
      title: 'Role',
      dataIndex: 'roleId',
      key: 'roleId',
      render: (text) => (text === 1 ? 'Admin' : 'User'), // Assuming roleId 1 is Admin
      fixed: 'left',
    },
    visibleColumns.profilePicture && {
      title: 'Profile Picture',
      dataIndex: 'profilePicturePath',
      key: 'profilePicturePath',
      render: (path) => path ? <img src={path} alt="Profile" width={50} /> : 'No Picture',
    },
    visibleColumns.address && {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    visibleColumns.mobileNo && {
      title: 'Mobile No',
      dataIndex: 'mobileNo',
      key: 'mobileNo',
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      render: (text, record) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => showUserDetails(record)}
            type="default"
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => editUser(record)}
            type="primary"
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ].filter(Boolean); // Filter out false entries (e.g. columns hidden)

  const editUser = (user) => {
    setEditingUserId(user.userId);
    setCurrentUserData({ ...user });
  };

  const showUserDetails = (user) => {
    setCurrentUser(user);
    setModalOpen(true);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card title={<Title level={2}>View All Users</Title>} bordered={false} style={{ marginBottom: '20px' }}>
        <Space style={{ marginBottom: 16 }}>
          <Select
            style={{ width: 150 }}
            defaultValue="none"
            onChange={handleFilterChange}
          >
            <Option value="none">No Filter</Option>
            <Option value="name">Filter by Name</Option>
          </Select>
          {filterType === 'name' && (
            <Input
              placeholder="Search by Name"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 200 }}
            />
          )}
          <Select
            style={{ width: 120 }}
            defaultValue={10}
            onChange={handlePageSizeChange}
          >
            <Option value={5}>5 rows</Option>
            <Option value={10}>10 rows</Option>
            <Option value={20}>20 rows</Option>
          </Select>
          {/* Render checkboxes with initial unchecked state */}
          <Space>
            <Checkbox
              checked={visibleColumns.profilePicture}
              onChange={(e) => handleColumnVisibilityChange(e, 'profilePicture')}
            >
              Profile Picture
            </Checkbox>
            <Checkbox
              checked={visibleColumns.address}
              onChange={(e) => handleColumnVisibilityChange(e, 'address')}
            >
              Address
            </Checkbox>
            <Checkbox
              checked={visibleColumns.mobileNo}
              onChange={(e) => handleColumnVisibilityChange(e, 'mobileNo')}
            >
              Mobile No
            </Checkbox>
          </Space>
        </Space>
      </Card>
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize }}
        bordered
        rowKey="userId"
        responsive={true}
        layout="auto"
      />
      <Modal
        open={modalOpen}
        title="User Details"
        onOk={() => setModalOpen(false)}
        onCancel={() => setModalOpen(false)}
      >
        {currentUser && (
          <Row>
            <Col span={12}>
              <strong>User ID:</strong> {currentUser.userId}
            </Col>
            <Col span={12}>
              <strong>Full Name:</strong> {`${currentUser.firstName} ${currentUser.middleName} ${currentUser.lastName}`}
            </Col>
            <Col span={12}>
              <strong>Mobile No:</strong> {currentUser.mobileNo}
            </Col>
            <Col span={12}>
              <strong>Address:</strong> {currentUser.address}
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
};

export default AllUsers;
