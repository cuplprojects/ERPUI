import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Switch, Form, message, Card, Row, Col, Select, Pagination } from 'antd';
import { Modal } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API from '../CustomHooks/MasterApiHooks/api';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { AiFillCloseSquare } from "react-icons/ai";
import { SearchOutlined } from '@ant-design/icons';
const { Option } = Select;

const Project = () => {

  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;


  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [types, setTypes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingStatus, setEditingStatus] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [sortedInfo, setSortedInfo] = useState({});

  const getProjects = async () => {
    try {
      const response = await API.get('/Project');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
      message.error('Unable to fetch projects. Please try again later.');
    }
  };

  const getGroups = async () => {
    try {
      const response = await API.get('/Groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to fetch groups', error);
      message.error('Unable to fetch groups. Please try again later.');
    }
  };

  const getTypes = async () => {
    try {
      const response = await API.get('/PaperTypes');
      setTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch types', error);
      message.error('Unable to fetch types. Please try again later.');
    }
  };

  useEffect(() => {
    getProjects();
    getGroups();
    getTypes();
  }, []);

  const handleAddProject = async (values) => {
    const { name, status, description } = values;

    const existingProject = projects.find(
      (project) => project.name.toLowerCase() === name.toLowerCase()
    );
    if (existingProject) {
      message.error('Project name already exists!');
      return;
    }

    const newProject = {
      name,
      status,
      description,
      groupId: selectedGroup?.id || 0,
      typeId: selectedType?.typeId || 0,
    };

    try {
      const response = await API.post('/Project', newProject, {
        headers: { 'Content-Type': 'application/json' },
      });
      setProjects([...projects, response.data]);
      form.resetFields();
      setIsModalVisible(false);
      message.success('Project added successfully!');
      navigate(`/AddProjectProcess/${response.data.projectId}`);
    } catch (error) {
      console.error('Error adding project:', error);
      message.error('Error adding project. Please try again.');
    }
  };

  const handleEditSave = async (index) => {
    const updatedProject = {
      ...projects[index],
      name: editingName,
      description: editingDescription,
      status: editingStatus,
    };

    try {
      await API.put(`/Project/${updatedProject.projectId}`, updatedProject, {
        headers: { 'Content-Type': 'application/json' },
      });
      const updatedProjects = [...projects];
      updatedProjects[index] = updatedProject;
      setProjects(updatedProjects);
      setEditingIndex(null);
      message.success('Project updated successfully!');
    } catch (error) {
      console.error('Failed to update project:', error);
      message.error('Failed to update project. Please try again.');
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const columns = [
    {
      title: 'SN.',
      dataIndex: 'serial',
      key: 'serial',
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
      render: (text, record, index) =>
        editingIndex === index ? (
          <Input
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onPressEnter={() => handleEditSave(index)}
            onBlur={() => handleEditSave(index)}
          />
        ) : (
          <span>{text}</span>
        ),
    },
    {
      title: 'Project Description',
      dataIndex: 'description',
      key: 'description',
      render: (text, record, index) =>
        editingIndex === index ? (
          <Input
            value={editingDescription}
            onChange={(e) => setEditingDescription(e.target.value)}
            onPressEnter={() => handleEditSave(index)}
            onBlur={() => handleEditSave(index)}
          />
        ) : (
          <span>{text}</span>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status - b.status,
      sortOrder: sortedInfo.columnKey === 'status' && sortedInfo.order,
      render: (status, record, index) =>
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
        ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record, index) =>
        editingIndex === index ? (
          <>
            <Button type="link" onClick={() => handleEditSave(index)}>
              Save
            </Button>
            <Button type="link" onClick={() => setEditingIndex(null)}>
              Cancel
            </Button>
          </>
        ) : (
          <Button
            type="link"
            onClick={() => {
              setEditingIndex(index);
              setEditingName(record.name);
              setEditingDescription(record.description);
              setEditingStatus(record.status);
            }}
          >
            Edit
          </Button>
        ),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
    setSelectedGroup(null);
    setSelectedType(null);
  };

  const handleGroupChange = (value) => {
    const group = groups.find((g) => g.id === value);
    setSelectedGroup(group);
    updateProjectName(group, selectedType);
  };

  const handleTypeChange = (value) => {
    const type = types.find((t) => t.typeId === value);
    setSelectedType(type);
    updateProjectName(selectedGroup, type);
  };

  const updateProjectName = (group, type) => {
    const projectName = `${group?.name || ''} ${type?.types || ''}`;
    form.setFieldsValue({ name: projectName });
  };

  const filteredProjects = projects.filter(project =>
    Object.values(project).some(value =>
      value && value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <Card
    className={`${customDark === "dark-dark" ? `${customDark}` : `${customLight}`}`}
      bordered={true}
      style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}
    >
      <h2 className={`${customDarkText}`}>All Projects</h2>
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>

         <Title level={3} className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`}`}>{t('project')}</Title>
        <Col>
          <Space><Input
            placeholder={t('searchProjects')}
            suffix={<SearchOutlined />}

            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
        </Col>
        <Col>
          <Button onClick={showModal} className={`${customBtn} bprder-0`}>
            Add New Project
          </Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={filteredProjects}
        pagination={false}
        rowKey="projectId"
        bordered
        onChange={handleTableChange}
        style={{ background: 'white' }}
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
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={filteredProjects.length}
        onChange={(page, pageSize) => {
          setCurrentPage(page);
          setPageSize(pageSize);
        }}
        showSizeChanger
        showQuickJumper
        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
        style={{ marginTop: '20px', textAlign: 'right' }}
      />
      <Modal
        show={isModalVisible}
        onHide={handleCancel}
        centered
        className={`rounded-2 ${customDark === "" ? `${customDark}` : ''}  `}
      >
       <Modal.Header closeButton={false} className={`rounded-top-2 ${customDark} ${customLightText} ${customDark === "dark-dark" ? `border ` : `border-0`} border d-flex justify-content-between `}>
          <Modal.Title>Add New Project</Modal.Title>
          <AiFillCloseSquare
            size={35}
            onClick={handleCancel}
            className={`rounded-2 ${customDark === "dark-dark" ? "text-dark bg-white " : `${customDark} custom-zoom-btn text-white  ${customDarkBorder}`}`}
            aria-label="Close"
            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
          />
        </Modal.Header>
        <Modal.Body className={` ${customMid} ${customDark === "dark-dark" ? `border border-top-0` : `border-0`}`}>
          <Form form={form} onFinish={handleAddProject} layout="vertical">
            <Form.Item
              name="group"
              label={<span className={customDarkText}>Group</span>}
              rules={[{ required: true, message: 'Please select a group!' }]}
              className={`${customDark === "dark-dark" ? `text-white` : ''}`}
            >
              <Select onChange={handleGroupChange} placeholder="Select Group">
                {groups.map((group) => (
                  <Option key={group.id} value={group.id}>{group.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="type"
              label={<span className={customDarkText}>Type</span>}
              rules={[{ required: true, message: 'Please select a type!' }]}
            >
              <Select onChange={handleTypeChange} placeholder="Select Type">
                {types.map((type) => (
                  <Option key={type.typeId} value={type.typeId}>{type.types}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="name"
              label={<span className={customDarkText}>Project Name</span>}
              rules={[{ required: true, message: 'Please enter the project name!' }]}
            >
              <Input placeholder="Enter project name" />
            </Form.Item>
            <Form.Item
              name="description"
              label={<span className={customDarkText}>Description</span>}
              rules={[{ required: true, message: 'Please enter a description!' }]}
            >
              <Input.TextArea rows={4} placeholder="Enter description" />
            </Form.Item>
            <Form.Item
              name="status"
              label={<span className={customDarkText}>Status</span>}
              valuePropName="checked"
              initialValue={true}
            >
              <Switch
                checkedChildren="Active"
                unCheckedChildren="Inactive"
                defaultChecked
              />
            </Form.Item>
          </Form>
        </Modal.Body>
        <Modal.Footer className={` ${customDark} ${customLightText} ${customDark === "dark-dark" ? `border ` : `border-0`} border d-flex justify-content-between `}>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={form.submit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default Project;
