import React, { useEffect, useState } from 'react';
import { Table, Select, Input, Space, Modal, Button, Typography, Row, Col, Card, Checkbox } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
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

  const [filteredData, setFilteredData] = useState([]);
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
      align: "center",
      title: 'Sr. No.',
      key: 'serial',
      render: (text, record, index) => index + 1,
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
      render: (text) => (text === 1 ? 'Admin' : 'User'),
      fixed: 'left',
    },
    visibleColumns.profilePicture && {
      align: "center",
      title: 'Profile Picture',
      dataIndex: 'profilePicturePath',
      key: 'profilePicturePath',
      render: (path) => path ? <img src={`${BaseUrl}/${path}`} alt="Profile" width={50} height={50} className='rounded-circle' /> : 'No Picture',
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
  ].filter(Boolean);

  const editUser = (user) => {
    setEditingUserId(user.userId);
    setCurrentUserData({ ...user });
  };

  const showUserDetails = (user) => {
    setCurrentUser(user);
    setModalOpen(true);
  };

  return (
    <>
      <div style={{ padding: '20px' }}>
        <Card
          title={<Title level={2}>View All Users</Title>}
          bordered={false}
          style={{ marginBottom: '20px' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Row gutter={[16, 16]} justify="space-between" align="middle">
              <Col xs={24} sm={24} md={16} lg={16}>
                <Space direction={isMobile ? "vertical" : "horizontal"} style={{ width: '100%' }}>
                  <Select
                    style={{ width: isMobile ? '100%' : 150 }}
                    defaultValue="none"
                    onChange={handleFilterChange}
                  >
                    <Option value="none">No Filter</Option>
                    <Option value="name">Filter by Name</Option>
                  </Select>

                  {filterType === 'name' && (
                    <Input.Group compact style={{ width: isMobile ? '100%' : 'auto' }}>
                      <Input
                        placeholder="Search by Name"
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        style={{ width: isMobile ? '80%' : 200 }}
                      />
                      <Button type="primary" icon={<FaSearch size={20}/>} onClick={handleSearch} style={{ width: isMobile ? '30%' : 'auto' }} />
                    </Input.Group>
                  )}
                </Space>
              </Col>

              <Col xs={24} sm={24} md={8} lg={8}>
                <Select
                  style={{ width: isMobile ? '100%' : 120 }}
                  defaultValue={10}
                  onChange={handlePageSizeChange}
                >
                  <Option value={5}>5 rows</Option>
                  <Option value={10}>10 rows</Option>
                  <Option value={20}>20 rows</Option>
                </Select>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Space wrap>
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
              </Col>
            </Row>
          </Space>
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
          open={modalOpen}
          title="User Details"
          onOk={() => setModalOpen(false)}
          onCancel={() => setModalOpen(false)}
          width={isMobile ? "90%" : "50%"}
        >
          {currentUser && (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <strong className={`${customDark === "dark-dark" ? `` : ``}`}>User ID:</strong> {currentUser.userId}
                </Col>
                <Col xs={24} sm={12}>
                  <strong className={`${customDark === "dark-dark" ? `` : ``}`}>Full Name:</strong> {`${currentUser.firstName} ${currentUser.middleName} ${currentUser.lastName}`}
                </Col>
                <Col xs={24} sm={12}>
                  <strong className={`${customDark === "dark-dark" ? `` : ``}`}>Mobile No:</strong> {currentUser.mobileNo}
                </Col>
                <Col xs={24} sm={12}>
                  <strong className={`${customDark === "dark-dark" ? `` : ``}`}>Address:</strong> {currentUser.address}
                </Col>
              </Row>
              <Row className='d-flex justify-content-center mt-3'>
                <Col xs={24} sm={12}>
                  {currentUser.profilePicturePath ? (
                    <img
                      src={`${BaseUrl}/${currentUser.profilePicturePath}`}
                      alt="Profile"
                      style={{ width: '100%', maxWidth: '210px', height: 'auto' }}
                      className="rounded-circle"
                    />
                  ) : (
                    <img
                      src={SampleUser}
                      alt="Sample User"
                      style={{ width: '100%', maxWidth: '210px', height: 'auto' }}
                      className="rounded-circle"
                    />
                  )}
                </Col>
              </Row>
            </>
          )}
        </Modal>
      </div>
    </>
  );
};

export default AllUsers;
