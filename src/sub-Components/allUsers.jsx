import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Table, Select, Input, Space, Button, Typography, Row, Col, Checkbox, Form, Dropdown, Menu, message } from 'antd';
import { Card, Modal } from 'react-bootstrap';
import { EyeOutlined, EditOutlined, SaveOutlined, CloseOutlined, SettingOutlined } from '@ant-design/icons';
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
import { useTranslation } from 'react-i18next';
import { hasPermission } from '../CustomHooks/Services/permissionUtils';
const BaseUrl = import.meta.env.VITE_API_BASE_URL;


const { Option } = Select;
const { Title } = Typography;

const AllUsers = () => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

  const [users, setUsers] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [editingUserId, setEditingUserId] = useState(null);
  const [currentUserData, setCurrentUserData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    profilePicture: true,
    address: false,
    mobileNo: false,
  });
  const [columnSettingsVisible, setColumnSettingsVisible] = useState(false);

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
      title: t('sn'),
      key: 'serial',
      render: (text, record, index) => index + 1,
      width: 50,
    },
    visibleColumns.profilePicture && {
      align: "center",
      title: t('profilePicture'),
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
      width: 80,
    },
    {
      align: "center",
      title: t('fullName'),
      key: 'fullName',
      render: (record) => `${record.firstName} ${record.middleName} ${record.lastName}`,
      width: 150,
      sorter: (a, b) => `${a.firstName} ${a.middleName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.middleName} ${b.lastName}`),
    },
    {
      align: "center",
      title: t('roles'),
      dataIndex: 'roleId',
      key: 'roleId',
      render: (text, record) => {
        const editable = record.userId === editingUserId;
        return editable ? (
          <Select
            value={currentUserData.roleId}
            onChange={(value) => setCurrentUserData(prev => ({ ...prev, roleId: value }))}
          >
            <Option value={1}>{t('admin')}</Option>
            <Option value={2}>{t('user')}</Option>
          </Select>
        ) : (
          text === 1 ? t('admin') : t('user')
        );
      },
      width: 100,
      sorter: (a, b) => a.roleId - b.roleId,
    },
    visibleColumns.address && {
      align: "center",
      title: t('address'),
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
      align: "center",
      title: t('mobileNo'),
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
      align: "center",
      title: t('actions'),
      key: 'actions',
      width: 150,
      render: (text, record) => {
        const editable = record.userId === editingUserId;
        return editable ? (
          <Space>
            <Button
              icon={<SaveOutlined />}
              onClick={() => handleSave(record)}
              type="primary"
              className={customBtn}
            >
              {t('save')}
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
            >
              {t('cancel')}
            </Button>
          </Space>
        ) : (
          <Space size="middle" wrap>
            <Button
              icon={<EyeOutlined />}
              onClick={() => showUserDetails(record)}
              type="default"
            >
              {t('view')}
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              type="primary"
              className={customBtn}
              disabled={!hasPermission('2.1.3.3')}
            >
              {t('edit')}
            </Button>
          </Space>
        );
      },
    },
  ].filter(Boolean), [visibleColumns, isValidImageUrl, editingUserId, currentUserData, handleSave, handleCancel, customBtn, t]);

  const showUserDetails = useCallback((user) => {
    setCurrentUser(user);
    setModalOpen(true);
  }, []);

  const [filterType, setFilterType] = useState('none');
  const [filterValue, setFilterValue] = useState('');

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

  const menu = (
    <Menu onClick={({ key }) => handleFilterChange(key)}>
      <Menu.Item key="none">{t('noFilter')}</Menu.Item>
      <Menu.Item key="name">{t('filterByName')}</Menu.Item>
    </Menu>
  );

  const columnSettingsMenu = (
    <Menu>
      {Object.entries(visibleColumns).map(([column, isVisible]) => (
        <Menu.Item key={column}>
          <Checkbox
            checked={isVisible}
            onChange={(e) => handleColumnVisibilityChange(e, column)}
          >
            {t(column)}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div style={{ padding: isMobile ? '0' : '20px' }}>
      <h2 className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`} text-start ${isMobile ? 'mb-2' : 'mb-3'}`}>{t('viewAllUsers')}</h2>
      
      <div className={`d-flex justify-content-end align-items-center ${isMobile ? 'mb-2' : 'mb-3'} gap-2`}>
        <div className="d-flex align-items-center gap-2">
          {filterType === 'name' && (
            <Input.Search
              placeholder={t('searchByName')}
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              style={{ width: isMobile ? '100%' : '200px' }}
            />
          )}
          <Dropdown overlay={menu} trigger={['click']} className="border-0">
            <Button icon={<BsFunnelFill size={20} className={`${customDark === "dark-dark" ? "text-dark" : customDarkText} border-0`} />}>
            </Button>
          </Dropdown>
        </div>
        <div>
          <Dropdown overlay={columnSettingsMenu} trigger={['click']} visible={columnSettingsVisible} onVisibleChange={setColumnSettingsVisible}>
            <Button icon={<SettingOutlined />} className={`${customDark === "dark-dark" ? "text-dark" : customDarkText} border-0`}>
            </Button>
          </Dropdown>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{
          pageSize: pageSize,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          style: { backgroundColor: 'white', marginTop: 0 },
          className: 'custom-pagination p-2 rounded-3 rounded-top-0'
        }}
        bordered
        rowKey="userId"
        scroll={{ x: 'max-content' }}
        size={isMobile ? "small" : "middle"}
        className={`thead-${customDark.split('-')[0]}`}
        responsive
      />
      <Modal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        size={isMobile ? "sm" : "lg"}
        centered
      >
        <Modal.Header className={`${customDark} d-flex justify-content-between align-items-center`}>
          <Modal.Title className={`${customLightText}`}>{t("usersDetails")}</Modal.Title>
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
                      return (
                        <div key={key} className="mb-2">
                          <strong>{t(key)}:</strong> {value}
                        </div>
                      );
                    }
                    return null;
                  })
                ) : (
                  <dl className="row g-2">
                    {Object.entries(currentUser).map(([key, value]) => {
                      if (key !== 'profilePicturePath' && key !== 'userId' && value !== null && value !== undefined && value !== '') {
                        return (
                          <React.Fragment key={key}>
                            <dt className="col-sm-5">{t(key)}</dt>
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
    </div>
  );
};

export default AllUsers;
