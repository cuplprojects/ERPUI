import React, { useState } from 'react';
import { Table, Select, Input, Space, Modal, Button } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; // Import AntD styles
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing

const { Option } = Select;

// Extended sample data for users, including userId
const sampleData = [
  { key: '1', userId: 'U001', name: 'John Doe', role: 'Software Engineer', department: 'Engineering' },
  { key: '2', userId: 'U002', name: 'Jane Smith', role: 'Product Manager', department: 'Product' },
  { key: '3', userId: 'U003', name: 'Mike Johnson', role: 'UX Designer', department: 'Design' },
  { key: '4', userId: 'U004', name: 'Emily Davis', role: 'Data Scientist', department: 'Engineering' },
  { key: '5', userId: 'U005', name: 'Sarah Brown', role: 'Marketing Specialist', department: 'Marketing' },
  { key: '6', userId: 'U006', name: 'David Wilson', role: 'Sales Executive', department: 'Sales' },
  { key: '7', userId: 'U007', name: 'Jessica Lee', role: 'HR Manager', department: 'Human Resources' },
  { key: '8', userId: 'U008', name: 'Chris White', role: 'UI Designer', department: 'Design' },
  { key: '9', userId: 'U009', name: 'Alex Martinez', role: 'Business Analyst', department: 'Product' },
  { key: '10', userId: 'U010', name: 'Kelly Clark', role: 'DevOps Engineer', department: 'Engineering' },
  { key: '11', userId: 'U011', name: 'Ryan Lewis', role: 'Content Strategist', department: 'Marketing' },
  { key: '12', userId: 'U012', name: 'Laura Harris', role: 'Financial Analyst', department: 'Finance' },
  { key: '13', userId: 'U013', name: 'James Walker', role: 'Project Manager', department: 'Product' },
  { key: '14', userId: 'U014', name: 'Olivia Hall', role: 'Web Developer', department: 'Engineering' },
  { key: '15', userId: 'U015', name: 'Sophia Young', role: 'Customer Support', department: 'Customer Service' },
];

// Unique values for filtering options
const departments = [...new Set(sampleData.map(user => user.department))];
const roles = [...new Set(sampleData.map(user => user.role))];

// Define columns for the table with sorting and actions
const columns = [
  {
    title: 'Sr. No.',
    key: 'serial',
    render: (text, record, index) => index + 1, // Displaying Sr. No. based on row index
  },
  {
    title: 'User ID',
    dataIndex: 'userId',
    key: 'userId',
    sorter: (a, b) => a.userId.localeCompare(b.userId),
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    sorter: (a, b) => a.role.localeCompare(b.role),
  },
  {
    title: 'Department',
    dataIndex: 'department',
    key: 'department',
    sorter: (a, b) => a.department.localeCompare(b.department),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (text, record) => (
      <Space size="middle">
        <Button 
          icon={<EyeOutlined />} 
          onClick={() => showUserDetails(record)} 
          type="link"
        >
          View
        </Button>
        <Button 
          icon={<EditOutlined />} 
          onClick={() => editUser(record)} 
          type="link"
        >
          Edit
        </Button>
      </Space>
    ),
  },
];

const AllUsers = () => {
  const [filteredData, setFilteredData] = useState(sampleData);
  const [filterType, setFilterType] = useState('none');
  const [filterValue, setFilterValue] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false); // Changed from `modalVisible` to `modalOpen`
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate(); // Updated to useNavigate

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

  // Define the showUserDetails function
  const showUserDetails = (user) => {
    setCurrentUser(user);
    setModalOpen(true); // Changed from `setModalVisible(true)` to `setModalOpen(true)`
  };

  // Define the handleModalOk function
  const handleModalOk = () => {
    setModalOpen(false); // Changed from `setModalVisible(false)` to `setModalOpen(false)`
    setCurrentUser(null);
  };

  // Define the handleModalCancel function
  const handleModalCancel = () => {
    setModalOpen(false); // Changed from `setModalVisible(false)` to `setModalOpen(false)`
    setCurrentUser(null);
  };

  // Define the editUser function
  const editUser = (user) => {
    navigate(`/edit-user/${user.userId}`, { state: { user } }); // Updated to use navigate
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>View All Users</h2>
      <Space style={{ marginBottom: 16 }}>
        <Select 
          style={{ width: 120 }} 
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
          />
        )}
        {filterType === 'department' && (
          <Select 
            placeholder="Select Department" 
            style={{ width: 180 }} 
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
            style={{ width: 180 }} 
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
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize }}
        bordered
        rowKey="key"
      />
      <Modal
        open={modalOpen} // Changed from `visible` to `open`
        title="User Details"
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        {currentUser && (
          <div>
            <p><strong>User ID:</strong> {currentUser.userId}</p>
            <p><strong>Name:</strong> {currentUser.name}</p>
            <p><strong>Role:</strong> {currentUser.role}</p>
            <p><strong>Department:</strong> {currentUser.department}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AllUsers;
