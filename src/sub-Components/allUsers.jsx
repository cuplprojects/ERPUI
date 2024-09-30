import React, { useState } from 'react';
import { Table, Select, Input, Space, Modal, Button, Typography, Row, Col, Card } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; // Import AntD styles

const { Option } = Select;
const { Title } = Typography;

// Sample data for users, including userId
const sampleData = [
  { key: '1', userId: 'U001', name: 'John Doe', role: 'Software Engineer', department: 'Engineering' },
  { key: '2', userId: 'U002', name: 'Jane Smith', role: 'Product Manager', department: 'Product' },
  { key: '3', userId: 'U003', name: 'Mike Johnson', role: 'UX Designer', department: 'Design' },
  // Add more sample users as needed
];

const departments = [...new Set(sampleData.map(user => user.department))];
const roles = [...new Set(sampleData.map(user => user.role))];

const AllUsers = () => {
  const [filteredData, setFilteredData] = useState(sampleData);
  const [filterType, setFilterType] = useState('none');
  const [filterValue, setFilterValue] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [editingUserId, setEditingUserId] = useState(null);
  const [currentUserData, setCurrentUserData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleFilterChange = (value) => {
    setFilterType(value);
    setFilterValue('');
  };

  const handleSearch = () => {
    let filtered = sampleData;
    if (filterType === 'name' && filterValue) {
      filtered = sampleData.filter(user => user.name.toLowerCase().includes(filterValue.toLowerCase()));
    } else if (filterType === 'department' && filterValue) {
      filtered = sampleData.filter(user => user.department === filterValue);
    } else if (filterType === 'role' && filterValue) {
      filtered = sampleData.filter(user => user.role === filterValue);
    }
    setFilteredData(filtered);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
  };

  const editUser = (user) => {
    setEditingUserId(user.key);
    setCurrentUserData({ ...user }); // Create a copy of the user data for editing
  };

  const handleSave = () => {
    // Update the filteredData with new user data
    const newData = filteredData.map(item =>
      item.key === editingUserId ? { ...item, ...currentUserData } : item
    );
    setFilteredData(newData);
    setEditingUserId(null); // Reset editing state
  };

  const handleCancel = () => {
    setEditingUserId(null);
    setCurrentUserData({});
  };

  const handleChange = (e, field) => {
    setCurrentUserData({ ...currentUserData, [field]: e.target.value });
  };

  const showUserDetails = (user) => {
    setCurrentUser(user);
    setModalOpen(true);
  };

  const handleModalOk = () => {
    setModalOpen(false);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
  };

  const columns = [
    {
      title: 'Sr. No.',
      key: 'serial',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        editingUserId === record.key ? (
          <Input
            value={currentUserData.name}
            onChange={(e) => handleChange(e, 'name')}
            style={{ width: 200 }}
          />
        ) : (
          <span>{text}</span>
        )
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (text, record) => (
        editingUserId === record.key ? (
          <Input
            value={currentUserData.role}
            onChange={(e) => handleChange(e, 'role')}
            style={{ width: 200 }}
          />
        ) : (
          <span>{text}</span>
        )
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (text, record) => (
        editingUserId === record.key ? (
          <Input
            value={currentUserData.department}
            onChange={(e) => handleChange(e, 'department')}
            style={{ width: 200 }}
          />
        ) : (
          <span>{text}</span>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space size="middle">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => showUserDetails(record)} 
            type="default" // Default button type
            style={{ borderRadius: '4px', padding: '8px 12px' }} // Styled for better appearance
          >
            View
          </Button>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              if (editingUserId === record.key) {
                handleSave(); // Call save if already editing
              } else {
                editUser(record); // Otherwise, initiate edit
              }
            }} 
            type="primary" // Primary button type for emphasis
            style={{ borderRadius: '4px', padding: '8px 12px' }} // Styled for better appearance
          >
            {editingUserId === record.key ? 'Save' : 'Edit'}
          </Button>
          {editingUserId === record.key && (
            <Button 
              onClick={handleCancel} 
              type="danger" // Danger type for cancel action
              style={{ borderRadius: '4px', padding: '8px 12px' }} // Styled for better appearance
            >
              Cancel
            </Button>
          )}
        </Space>
      ),
    },
  ];

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
            <Option value="department">Filter by Department</Option>
            <Option value="role">Filter by Role</Option>
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
          {filterType === 'department' && (
            <Select 
              placeholder="Select Department" 
              style={{ width: 200 }} 
              value={filterValue} 
              onChange={setFilterValue}
              onSelect={handleSearch}
            >
              {departments.map(dept => <Option key={dept} value={dept}>{dept}</Option>)}
            </Select>
          )}
          {filterType === 'role' && (
            <Select 
              placeholder="Select Role" 
              style={{ width: 200 }} 
              value={filterValue} 
              onChange={setFilterValue}
              onSelect={handleSearch}
            >
              {roles.map(role => <Option key={role} value={role}>{role}</Option>)}
            </Select>
          )}
          <Select 
            style={{ width: 120 }} 
            defaultValue={10} 
            onChange={handlePageSizeChange}
          >
            <Option value={5}>5 rows</Option>
            <Option value={10}>10 rows</Option>
            <Option value={20}>20 rows</Option>
            <Option value={50}>50 rows</Option>
          </Select>
        </Space>
      </Card>
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize }}
        bordered
        rowKey="key"
        style={{ backgroundColor: '#f9f9f9' }}
      />
      <Modal
        open={modalOpen}
        title="User Details"
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        {currentUser && (
          <Row>
            <Col span={12}>
              <strong>User ID:</strong> {currentUser.userId}
            </Col>
            <Col span={12}>
              <strong>Name:</strong> {currentUser.name}
            </Col>
            <Col span={12}>
              <strong>Role:</strong> {currentUser.role}
            </Col>
            <Col span={12}>
              <strong>Department:</strong> {currentUser.department}
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
};

export default AllUsers;
