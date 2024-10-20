import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Switch, Form, message, Pagination } from 'antd';
import { Modal } from 'react-bootstrap';
import API from '../CustomHooks/MasterApiHooks/api';
import { useMediaQuery } from 'react-responsive';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { AiFillCloseSquare } from "react-icons/ai";
import { SortAscendingOutlined, SortDescendingOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { Col, Row } from 'react-bootstrap';
import { FaSearch } from "react-icons/fa";

const Group = () => {
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingStatus, setEditingStatus] = useState(true);
  const [originalData, setOriginalData] = useState({});
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('ascend');
  const [sortField, setSortField] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  const fetchGroups = async () => {
    try {
      const response = await API.get('/Groups');
      setGroups(response.data);
      setFilteredGroups(response.data);
    } catch (error) {
      console.log('Failed to fetch groups!');
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const filtered = groups.filter(group =>
      group.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredGroups(filtered);
    setCurrentPage(1);
  }, [searchText, groups]);

  const handleAddGroup = async (values) => {
    const { name, status } = values;

    const existingGroup = groups.find(group => group.name.toLowerCase() === name.toLowerCase());
    if (existingGroup) {
      message.error('Group name already exists!');
      return;
    }

    try {
      const newGroup = { name, status };
      await API.post('/Groups', newGroup);
      setGroups([...groups, newGroup]);
      setFilteredGroups([...filteredGroups, newGroup]);
      form.resetFields();
      setIsModalVisible(false);
      message.success('Group added successfully!');
    } catch (error) {
      message.error('Failed to add group!');
    }
  };

  const handleEditSave = async (record) => {
    const groupToEdit = record;
    const updatedGroup = { ...groupToEdit, name: editingValue, status: editingStatus };

    const existingGroup = groups.find(group =>
      group.name.toLowerCase() === editingValue.toLowerCase() && group.id !== groupToEdit.id
    );

    if (existingGroup) {
      message.error('Group name already exists!');
      return;
    }

    try {
      await API.put(`/Groups/${groupToEdit.id}`, updatedGroup);
      const updatedGroups = groups.map(group =>
        group.id === groupToEdit.id ? updatedGroup : group
      );
      setGroups(updatedGroups);
      setFilteredGroups(updatedGroups.filter(group =>
        group.name.toLowerCase().includes(searchText.toLowerCase())
      ));
      message.success('Group updated successfully!');
    } catch (error) {
      message.error('Failed to update group');
    } finally {
      setEditingIndex(null);
      setEditingValue('');
      setEditingStatus(true);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue(originalData.name);
    setEditingStatus(originalData.status);
  };

  const handleSort = (field) => {
    const newSortOrder = field === sortField && sortOrder === 'ascend' ? 'descend' : 'ascend';
    setSortOrder(newSortOrder);
    setSortField(field);

    const sortedGroups = [...filteredGroups].sort((a, b) => {
      if (field === 'name') {
        return newSortOrder === 'ascend'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (field === 'status') {
        return newSortOrder === 'ascend'
          ? (a.status === b.status ? 0 : a.status ? -1 : 1)
          : (a.status === b.status ? 0 : a.status ? 1 : -1);
      }
    });

    setFilteredGroups(sortedGroups);
  };

  const columns = [
    {
      align: 'center',
      title: 'SN.',
      dataIndex: 'serial',
      key: 'serial',
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      width: '10%',
    },
    {
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Group Name
          <Button
            type="text"
            onClick={() => handleSort('name')}
            icon={sortField === 'name' && sortOrder === 'ascend' ? <SortAscendingOutlined style={{ color: 'white', border: '1px solid white' }} className='rounded-2 p-1' /> : <SortDescendingOutlined style={{ color: 'white', border: '1px solid white' }} className='rounded-2 p-1' />}
          />
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
      width: '40%',
      render: (text, record, index) => (
        editingIndex === index ? (
          <Input
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onPressEnter={() => handleEditSave(record)}
            style={{ width: '100%' }}
          />
        ) : (
          <span>{text}</span>
        )
      ),
    },
    {
      align: 'center',
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Status
          <Button
            type="text"
            onClick={() => handleSort('status')}
            icon={sortField === 'status' && sortOrder === 'ascend' ? <SortAscendingOutlined style={{ color: 'white', border: '1px solid white' }} className='rounded-2 p-1' /> : <SortDescendingOutlined style={{ color: 'white', border: '1px solid white' }} className='rounded-2 p-1' />}
          />
        </div>
      ),
      dataIndex: 'status',
      key: 'status',
      width: '25%',
      render: (status, record, index) => (
        editingIndex === index ? (
          <Switch
            checked={editingStatus}
            onChange={(checked) => setEditingStatus(checked)}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
        ) : (
          <Switch
            checked={status}
            disabled
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
        )
      ),
    },
    {
      align: 'left',
      title: 'Action',
      key: 'action',
      width: '25%',
      render: (_, record, index) => (
        editingIndex === index ? (
          <div style={{ display: 'flex', justifyContent: '' }}>
            <Button type="link" onClick={() => handleEditSave(record)} className={`${customDark === "dark-dark" ? `${customMid} border` : `${customLight} ${customDarkBorder}`} text-white `}>
              <SaveOutlined className={`${customDark === "dark-dark" ? `` : `${customDarkText}` } `}/> 
              <span className={`${customDark === "dark-dark" ? `` : `${customDarkText}` } `}>Save</span> 
            </Button>
            <Button type="link" onClick={handleCancelEdit} className={`${customDark === "dark-dark" ? `${customMid} border` : `${customLight} ${customDarkBorder}`} text-white ms-3`}>
              <CloseOutlined className={`${customDark === "dark-dark" ? `` : `${customDarkText}` } `}/> 
              <span className={`${customDark === "dark-dark" ? `` : `${customDarkText}` } `}>Cancel</span> 
            </Button>
          </div>
        ) : (
          <Button 
            type="link" 
            onClick={() => {
              setEditingIndex(index);
              setEditingValue(record.name);
              setEditingStatus(record.status);
              setOriginalData(record);
            }}
            className={`${customBtn}`}
          >
            <EditOutlined className={`${customBtn} text-white me-1`} />
            Edit
          </Button>
        )
      ),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  return (
    <div style={{
      padding: isMobile ? '10px' : '20px',
      background: '#fff',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      overflowX: 'auto'
    }}
      className={`rounded-2 ${customDark === "dark-dark" ? `${customDark} border text-white` : `${customDarkText}`}`}>
      <h2 style={{ marginBottom: '20px', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }} className=''>Groups</h2>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMobile ? '10px' : '20px'
      }}
      >
        <Button type="" className={`mb-2 rounded-2 ${customBtn} ${customDark === "dark-dark" ? `border-white` : `border-0`} custom-zoom-btn `} onClick={showModal}>
          Add Group
        </Button>
        <div className="d-flex align-items-center">
          <Input
            placeholder="Search groups"
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200, height: 32 }}
            className={` mb-2 rounded-2 ${customDark === "dark-dark" ? ` ${customLightBorder} text-dark` : `${customDarkText}`} ${customDarkBorder}  rounded-end-0`}
            allowClear
          />
          <Button
            onClick={() => {/* Add search functionality here */ }}
            className={`mb-2 rounded-2 ${customBtn} ${customDark === "dark-dark" ? `border-white` : `border-0`} rounded-start-0`}
            style={{ height: 32 }}
          >
            <FaSearch />
          </Button>
        </div>
      </div>

      <Table
        dataSource={filteredGroups.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        columns={columns}
        rowKey="id"
        pagination={false}
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
                    ${customDark === "brown-dark" ? "thead-brown" : ""} `}
      />
      <div className="d-flex flex-wrap justify-content-end align-items-center mt-4">
        <div className="mb-3 mb-md-0 me-md-3">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredGroups.length}
            onChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={['5', '10']}
            defaultPageSize={5}
            showQuickJumper={false}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            className={`${customDark === "dark-dark" ? `bg-white` : ``} p-2 p-md-3 rounded`}
            responsive
            size="small"
          />
        </div>
      </div>
      <Modal
        show={isModalVisible}
        onHide={handleCancel}
        centered
        size={isMobile ? 'sm' : 'md'}
        className={`rounded-2 ${customDark === "" ? `${customDark}` : ''}  `}
      >
        <Modal.Header closeButton={false} className={`rounded-top-2 ${customDark} ${customLightText} ${customDark === "dark-dark" ? `border ` : `border-0`} border d-flex justify-content-between `}>
          <Modal.Title>Add Group</Modal.Title>
          <AiFillCloseSquare
            size={35}
            onClick={handleCancel}
            className={`rounded-2 ${customDark === "dark-dark" ? "text-dark bg-white " : `${customDark} custom-zoom-btn text-white  ${customDarkBorder}`}`}
            aria-label="Close"
            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
          />
        </Modal.Header>
        <Modal.Body className={`rounded-bottom-2 ${customMid} ${customDark === "dark-dark" ? `border border-top-0` : `border-0`}`}>
          <Form
            form={form}
            onFinish={handleAddGroup}
            layout="vertical"
            className={`${customDark === "dark" ? `${customDark}` : ''}`}
          >
            <div className="d-flex justify-content-between align-items-center">
              <Form.Item
                name="name"
                label={<span className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`} fs-5 `}>{"Group Name"}</span>}
                rules={[{ required: true, message: 'Please input group name!' }]}
                className="flex-grow-1 me-3"
              >
                <Input placeholder="Group Name" className="rounded-2" />
              </Form.Item>

              <Form.Item
                name="status"
                label={<span className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`} fs-5 `}>{"Status"}</span>}
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" className="" />
              </Form.Item>
            </div>

            <Form.Item>
              <Button type="" htmlType="submit" className={`rounded-2 ${customBtn} ${customDark === "dark-dark" ? `` : `border-0`} custom-zoom-btn`}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Group;
