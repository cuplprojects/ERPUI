import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Table, Select, Input, Space, Button, Typography, Row, Col, Checkbox, Form, Dropdown, Menu, message } from 'antd';
import { Card, Modal } from 'react-bootstrap';
import { EyeOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchUsers } from '../CustomHooks/ApiServices/userService';
import API from '../CustomHooks/MasterApiHooks/api';
import SampleUser from "./../assets/sampleUsers/defaultUser.jpg";
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { useMediaQuery } from 'react-responsive';
import { AiFillCloseSquare } from 'react-icons/ai';
import { BsFunnelFill } from "react-icons/bs";
import { MdDeleteForever } from "react-icons/md";
const BaseUrl = import.meta.env.VITE_API_BASE_URL;

const { Option } = Select;
const { Title } = Typography;

const AllUsers = () => {
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [roles, setRoles] = useState([]);

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

    const getRoles = async () => {
      try {
        const response = await API.get('/Roles');
        setRoles(response.data);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    getRoles();
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

  const handleEdit = useCallback((record) => {
    setEditingUserId(record.userId);
    setCurrentUserData({ ...record });
  }, []);

  const handleSave = useCallback(async (record) => {
    try {
      const updatedUser = {
        userId: record.userId,
        userName: currentUserData.userName,
        firstName: currentUserData.firstName,
        middleName: currentUserData.middleName,
        lastName: currentUserData.lastName,
        roleId: currentUserData.roleId,
        mobileNo: currentUserData.mobileNo,
        status: currentUserData.status,
        gender: currentUserData.gender,
        address: currentUserData.address,
        profilePicturePath: currentUserData.profilePicturePath
      };

      const response = await API.put(`/User/edit/${record.userId}`, updatedUser);
      
      if (response.status === 200) {
        const newData = users.map(item => 
          item.userId === record.userId ? { ...item, ...updatedUser } : item
        );
        setUsers(newData);
        setEditingUserId(null);
        message.success('User updated successfully');
      } else {
        message.error('Failed to update user');
      }
    } catch (error) {
      console.error("Error updating user:", error);
      message.error('An error occurred while updating user');
    }
  }, [users, currentUserData]);

  const handleCancel = useCallback(() => {
    setEditingUserId(null);
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
      sorter: (a, b) => `${a.firstName} ${a.middleName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.middleName} ${b.lastName}`),
    },
    {
      title: 'Role',
      dataIndex: 'roleId',
      key: 'roleId',
      render: (text, record) => {
        const editable = record.userId === editingUserId;
        return editable ? (
          <Select
            value={currentUserData.roleId}
            onChange={(value) => setCurrentUserData(prev => ({ ...prev, roleId: value }))}
            style={{ width: '200px' }}  // Increased width of the dropdown
          >
            {roles.map(role => (
              <Option key={role.roleId} value={role.roleId}>{role.roleName}</Option>
            ))}
          </Select>
        ) : (
          roles.find(role => role.roleId === text)?.roleName || text
        );
      },
      fixed: 'left',
      width: 200,  // Increased width of the column to accommodate the wider dropdown
      sorter: (a, b) => a.roleId - b.roleId,
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
      render: (text, record) => {
        const editable = record.userId === editingUserId;
        return editable ? (
          <Input
            value={currentUserData.address}
            onChange={(e) => setCurrentUserData(prev => ({ ...prev, address: e.target.value }))}
          />
        ) : (
          text
        );
      },
      width: 200,
    },
    visibleColumns.mobileNo && {
      title: 'Mobile No',
      dataIndex: 'mobileNo',
      key: 'mobileNo',
      render: (text, record) => {
        const editable = record.userId === editingUserId;
        return editable ? (
          <Input
            value={currentUserData.mobileNo}
            onChange={(e) => setCurrentUserData(prev => ({ ...prev, mobileNo: e.target.value }))}
          />
        ) : (
          text
        );
      },
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: '',
      width: 200,
      render: (text, record) => {
        const editable = record.userId === editingUserId;
        return editable ? (
          <Space>
            <Button
              icon={<SaveOutlined />}
              onClick={() => handleSave(record)}
              className={`${customDark === "dark-dark" ? `${customMid} text-white border-1 ${customDarkBorder}` : `${customLight} border-1 ${customDarkText} `} ${customDarkBorder}`}
            >
              Save
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
              className={`${customDark === "dark-dark" ? `${customMid} text-white border-1 ${customDarkBorder}` : `${customLight} border-1 ${customDarkText} `} ${customDarkBorder}`}
            >
              Cancel
            </Button>
          </Space>
        ) : (
          <Space size="middle" wrap>
            <Button
              icon={<EyeOutlined />}
              onClick={() => showUserDetails(record)}
              type="default"
              className={`${customDark === "dark-dark" ? `${customMid} text-white border-1 ${customDarkBorder}` : `${customLight} border-1 ${customDarkText} `} ${customDarkBorder}`}
            >
              View
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              type="primary"
              className={`${customDark}  border-1 ${customLightText}  ${customDarkBorder}`}
            >
              Edit
            </Button>
          </Space>
        );
      },
    },
  ].filter(Boolean), [visibleColumns, isValidImageUrl, editingUserId, currentUserData, handleSave, handleCancel, customBtn, roles]);

  const showUserDetails = useCallback((user) => {
    setCurrentUser(user);
    setModalOpen(true);
  }, []);

  const showDeleteConfirmation = useCallback((user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!userToDelete) return;

    try {
      const response = await API.delete(`/User/delete/${userToDelete.userId}`);
      if (response.status === 200) {
        setUsers(users.filter(user => user.userId !== userToDelete.userId));
        message.success('User deleted successfully');
      } else {
        message.error('Failed to delete user');
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error('An error occurred while deleting user');
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  }, [userToDelete, users]);

  const menu = (
    <Menu onClick={({ key }) => handleFilterChange(key)}>
      <Menu.Item key="none">No Filter</Menu.Item>
      <Menu.Item key="name">Filter by Name</Menu.Item>
    </Menu>
  );

  return (
    <div style={{ padding: '20px' }}>
      <h2 className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`}  text-start`}>View All Users</h2>
      <Row className="mb-2">
        <Col lg={2} md={1} xs={12} className="mb-3 mb-md-0">
          <div className="d-flex align-items-center h-100">
          {/* <Dropdown menu={menu} trigger={['click']} className="border-0"> */}
            <Dropdown overlay={menu} trigger={['click']} className="border-0">
              <Button icon={<BsFunnelFill size={20} className={`${customDark === "dark-dark" ? "text-dark" : customDarkText} border-0`} />}>
              </Button>
            </Dropdown>
          </div>
        </Col>
        <Col lg={8} md={7} xs={12} className="mb-3 mb-md-0">
          <div className="d-flex justify-content-start align-items-center h-100">
            {filterType === 'name' && (
              <Input.Search
                placeholder="Search by Name"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                style={{ width: '100%' }}
              />
            )}
          </div>
        </Col>
        <Col lg={12} md={12} xs={12}>
          <div className="d-flex flex-wrap justify-content-end justify-content-end align-items-center h-100">
            {['profilePicture', 'address', 'mobileNo'].map((column) => (
              <Checkbox
                key={column}
                checked={visibleColumns[column]}
                onChange={(e) => handleColumnVisibilityChange(e, column)}
                className={`${customDark === "dark-dark" ? customDarkText : customDarkText} text-start `}
              >
                {column.charAt(0).toUpperCase() + column.slice(1)}
              </Checkbox>
            ))}
          </div>
        </Col>
      </Row>

      <Table
        striped
        columns={columns}
        dataSource={filteredData}
        pagination={{
          pageSize: pageSize,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          style: { backgroundColor: 'white' },
          className: 'custom-pagination p-2 rounded-3 rounded-top-0'
        }}
        bordered
        rowKey="userId"
        scroll={{ x: 'max-content' }}
        size={isMobile ? "small" : "middle"}
        className={`${customDark === "default-dark" ? "thead-default" : ""}
                    ${customDark === "red-dark" ? "thead-red" : ""}
                    ${customDark === "green-dark" ? "thead-green" : ""}
                    ${customDark === "blue-dark" ? "thead-blue" : ""}
                    ${customDark === "dark-dark" ? "thead-dark" : ""}
                    ${customDark === "pink-dark" ? "thead-pink" : ""}
                    ${customDark === "purple-dark" ? "thead-purple" : ""}
                    ${customDark === "light-dark" ? "thead-light" : ""}
                    ${customDark === "brown-dark" ? "thead-brown" : ""} `}
      />
      <Modal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        size={isMobile ? "sm" : "lg"}
        centered
      >
        <Modal.Header className={`${customDark} d-flex justify-content-between align-items-center`}>
          <Modal.Title className={`${customLightText}`}>User's Details</Modal.Title>
          <AiFillCloseSquare
            size={35}
            onClick={() => setModalOpen(false)}
            className={`rounded-2 ${customDark === "dark-dark" ? "text-dark bg-white " : `${customDark} custom-zoom-btn text-white  ${customDarkBorder}`}`}
            aria-label="Close"
            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
          />
        </Modal.Header>
        <Modal.Body>
          {currentUser && (
            <Row className="g-3">
              <Col xs={12} md={12} className="d-flex justify-content-center align-items-center mb-3">
                <img
                  src={
                    currentUser.profilePicturePath && isValidImageUrl(`${BaseUrl}/${currentUser.profilePicturePath}`)
                      ? `${BaseUrl}/${currentUser.profilePicturePath}`
                      : SampleUser
                  }
                  alt={currentUser.profilePicturePath ? "Profile" : "Sample User"}
                  style={{ width: '100%', maxWidth: '200px', height: 'auto', objectFit: 'cover' }}
                  className="rounded-circle"
                />
              </Col>
              <Col xs={12} md={12}>
                {isMobile ? (
                  Object.entries(currentUser).map(([key, value]) => {
                    if (key !== 'profilePicturePath' && key !== 'userId' && value !== null && value !== undefined && value !== '') {
                      if (key === 'roleId') {
                        const role = roles.find(r => r.roleId === value);
                        return (
                          <div key={key} className="mb-2">
                            <strong>Role:</strong> {role ? role.roleName : value}
                          </div>
                        );
                      }
                      return (
                        <div key={key} className="mb-2">
                          <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                        </div>
                      );
                    }
                    return null;
                  })
                ) : (
                  <dl className="row g-2">
                    {Object.entries(currentUser).map(([key, value]) => {
                      if (key !== 'profilePicturePath' && key !== 'userId' && value !== null && value !== undefined && value !== '') {
                        if (key === 'roleId') {
                          const role = roles.find(r => r.roleId === value);
                          return (
                            <React.Fragment key={key}>
                              <dt className="col-sm-5">Role</dt>
                              <dd className="col-sm-7">{role ? role.roleName : value}</dd>
                            </React.Fragment>
                          );
                        }
                        return (
                          <React.Fragment key={key}>
                            <dt className="col-sm-5">{key.charAt(0).toUpperCase() + key.slice(1)}</dt>
                            <dd className="col-sm-7">{value}</dd>
                          </React.Fragment>
                        );
                      }
                      return null;
                    })}
                  </dl>
                )}
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>
      <Modal
        show={deleteModalOpen}
        onHide={() => setDeleteModalOpen(false)}
        centered
        className={` ${customLightText}`}
      >
        <Modal.Header closeButton={false} className={`${customDark} ${customLightText} d-flex justify-content-between`}>
          <Modal.Title>Confirm Delete</Modal.Title>
          <Button
            variant="link"
            className={`close-button ${customDark} ${customLightText} border-0`}
            style={{ padding: 0, fontSize: 18 }}
            onClick={() => setDeleteModalOpen(false)}
          >
            <AiFillCloseSquare size={40} className='rounded-5 ' />
          </Button>
        </Modal.Header>
        <Modal.Body className={`${customMid} ${customLightText}`}>
          {userToDelete && (
            <div className="text-center">
              <img
                src={
                  userToDelete.profilePicturePath && isValidImageUrl(`${BaseUrl}/${userToDelete.profilePicturePath}`)
                    ? `${BaseUrl}/${userToDelete.profilePicturePath}`
                    : SampleUser
                }
                alt={userToDelete.profilePicturePath ? "Profile" : "Sample User"}
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                className="rounded-circle mb-3"
              />
              <p className={`${customDark === 'dark-dark' || customDark === 'blue-dark' ? customLightText : customDarkText}`}>Are you sure on deleting <span className="fw-bold">{userToDelete.firstName} {userToDelete.lastName}</span>? This cannot be undone.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className={`${customDark} ${customLightText}`}>
          <Button 
            className={`${customDark === "dark-dark" ? `${customMid} text-white` : `${customLight} border-1 ${customDarkText}`} ${customDarkBorder}`}
            onClick={() => setDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button 
             className={`${customDark === "dark-dark" ? `${customMid} text-white` : `${customLight} border-1 ${customDarkText}`} ${customDarkBorder}`}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AllUsers;
