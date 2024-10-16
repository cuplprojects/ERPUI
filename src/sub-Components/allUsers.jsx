import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Table, Select, Input, Space, Button, Typography, Row, Col, Checkbox } from 'antd';
import { Card, Modal } from 'react-bootstrap';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchUsers } from '../CustomHooks/ApiServices/userService';
import SampleUser from "./../assets/sampleUsers/defaultUser.jpg";
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { FaSearch } from "react-icons/fa";
import { useMediaQuery } from 'react-responsive';
const BaseUrl = import.meta.env.VITE_API_BASE_URL;

const { Option } = Select;
const { Title } = Typography;

const AllUsers = () => {
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, , customLightBorder, customDarkBorder] = cssClasses;

  const [users, setUsers] = useState([]);
  const [filterType, setFilterType] = useState('none');
  const [filterValue, setFilterValue] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [editingUserId, setEditingUserId] = useState(null);
  const [currentUserData, setCurrentUserData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    profilePicture: false,
    address: false,
    mobileNo: false,
  });

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await fetchUsers();
        setUsers(res);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    getUsers();
  }, []);

  const handleFilterChange = useCallback((value) => {
    setFilterType(value);
    setFilterValue('');
  }, []);

  const filteredData = useMemo(() => {
    if (filterType === 'name' && filterValue) {
      return users.filter(user => 
        user.firstName.toLowerCase().includes(filterValue.toLowerCase()) ||
        user.lastName.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return users;
  }, [users, filterType, filterValue]);

  const handlePageSizeChange = useCallback((value) => {
    setPageSize(value);
  }, []);

  const handleColumnVisibilityChange = useCallback((e, column) => {
    setVisibleColumns(prev => ({ ...prev, [column]: e.target.checked }));
  }, []);

  const isValidImageUrl = useCallback((url) => {
    return url && url.match(/\.(jpeg|jpg|gif|png)$/) != null;
  }, []);

  const columns = useMemo(() => [
    {
      align: "center",
      title: 'Sr. No.',
      key: 'serial',
      render: (text, record, index) => index + 1,
      fixed: 'left',
      width: 70,
    },
    {
      title: 'Full Name',
      key: 'fullName',
      render: (record) => `${record.firstName} ${record.middleName} ${record.lastName}`,
      fixed: 'left',
      width: 150,
    },
    {
      title: 'Role',
      dataIndex: 'roleId',
      key: 'roleId',
      render: (text) => (text === 1 ? 'Admin' : 'User'),
      fixed: 'left',
      width: 100,
    },
    visibleColumns.profilePicture && {
      align: "center",
      title: 'Profile Picture',
      dataIndex: 'profilePicturePath',
      key: 'profilePicturePath',
      render: (path) => {
        const fullPath = path ? `${BaseUrl}/${path}` : null;
        return isValidImageUrl(fullPath) ? (
          <img src={fullPath} alt="Profile" width={50} height={50} className='rounded-circle' />
        ) : (
          <img src={SampleUser} alt="Sample User" width={50} height={50} className='rounded-circle' />
        );
      },
      width: 120,
    },
    visibleColumns.address && {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: 200,
    },
    visibleColumns.mobileNo && {
      title: 'Mobile No',
      dataIndex: 'mobileNo',
      key: 'mobileNo',
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (text, record) => (
        <Space size="middle" wrap>
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
  ].filter(Boolean), [visibleColumns, isValidImageUrl]);

  const editUser = useCallback((user) => {
    setEditingUserId(user.userId);
    setCurrentUserData({ ...user });
  }, []);

  const showUserDetails = useCallback((user) => {
    setCurrentUser(user);
    setModalOpen(true);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Card
        className={`${customDark === "dark-dark" ? `${customDark} border` : ``} mb-3`}
      >
        <Card.Body>
          <Card.Title>
            <h2 className={`${customDark === "dark-dark" ? `${customDark} ${customDarkText}` : `${customDarkText}`} m-2 text-center`}>View All Users</h2>
          </Card.Title>
          <hr className={`${customDark === "dark-dark" ? `${customLightBorder}` : `${customDarkBorder}`} rounded-5`} />
          <Space direction="vertical" style={{ width: '100%' }} size="large" className={`${customDark === "dark-dark" ? `${customMid}`: ""} p-3 rounded-3`}>
            <Row gutter={[16, 16]} justify="space-between" align="middle">
              <Col xs={24}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center">
                    <label htmlFor="filterSelect" className={`${customDarkText} me-md-2 mb-1 mb-md-0`} style={{ whiteSpace: 'nowrap' }}>Apply Filters: </label>
                    <div className="d-flex flex-column flex-md-row w-100">
                      <Select
                        id="filterSelect"
                        style={{ width: '100%', maxWidth: '150px', marginRight: '10px' }}
                        defaultValue="none"
                        onChange={handleFilterChange}
                      >
                        <Option value="none">No Filter</Option>
                        <Option value="name">Filter by Name</Option>
                      </Select>
                      {filterType === 'name' && (
                        <Input.Group compact className="mt-2 mt-md-0" style={{ width: '100%', maxWidth: '300px' }}>
                          <Input
                            placeholder="Search by Name"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            style={{ width: 'calc(100% - 40px)' }}
                          />
                          <Button type="primary" icon={<FaSearch size={20}/>} style={{ width: '40px' }} />
                        </Input.Group>
                      )}
                    </div>
                  </div>
                </Space>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Space wrap>
                  {['profilePicture', 'address', 'mobileNo'].map((column) => (
                    <Checkbox
                      key={column}
                      checked={visibleColumns[column]}
                      onChange={(e) => handleColumnVisibilityChange(e, column)}
                    >
                      {column.charAt(0).toUpperCase() + column.slice(1)}
                    </Checkbox>
                  ))}
                </Space>
              </Col>
            </Row>
          </Space>
        </Card.Body>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize }}
        bordered
        rowKey="userId"
        scroll={{ x: 'max-content' }}
        size={isMobile ? "small" : "middle"}
      />
      <Modal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        size={isMobile ? "sm" : "lg"}
      >
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentUser && (
            <>
              <Row gutter={[16, 16]}>
                {['userId', 'fullName', 'mobileNo', 'address'].map((field) => (
                  <Col xs={24} sm={12} key={field}>
                    <strong className={customDark === "dark-dark" ? "" : ""}>
                      {field.charAt(0).toUpperCase() + field.slice(1)}:
                    </strong>{' '}
                    {field === 'fullName'
                      ? `${currentUser.firstName} ${currentUser.middleName} ${currentUser.lastName}`
                      : currentUser[field]}
                  </Col>
                ))}
              </Row>
              <Row className='d-flex justify-content-center mt-3'>
                <Col xs={24} sm={12}>
                  <img
                    src={
                      currentUser.profilePicturePath && isValidImageUrl(`${BaseUrl}/${currentUser.profilePicturePath}`)
                        ? `${BaseUrl}/${currentUser.profilePicturePath}`
                        : SampleUser
                    }
                    alt={currentUser.profilePicturePath ? "Profile" : "Sample User"}
                    style={{ width: '100%', maxWidth: '210px', height: 'auto' }}
                    className="rounded-circle"
                  />
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AllUsers;
