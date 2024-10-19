
import React, { useEffect, useState } from 'react';
import AddProjectProcess from './AddProjectProcess';
import ProjectUserAllocation from './ProjectUserAllocation';
import { Table, Button, Input, Switch, Form, message, Card, Row, Col, Select, Pagination,Tabs } from 'antd';
import { Modal } from 'react-bootstrap';
import API from '../CustomHooks/MasterApiHooks/api';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';

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

  const { TabPane } = Tabs;
  const [activeTabKey, setActiveTabKey] = useState("1"); // State for active tab
  const [selectedProject,setSelectedProject] = useState();

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
      setActiveTabKey("2"); // Switch to Select Process tab
      setSelectedProject(response.data.projectId); 
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
          <a 
          onClick={() => {
            setActiveTabKey("2"); // Switch to Select Process tab
            setSelectedProject(record.projectId); // Navigate to process
          }}
        >
          {text}
        </a>
          //<span>{text}</span>
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

    title="Projects"
    bordered={true}
    style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}
  >
    <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
      <TabPane tab="Project List" key="1">
        <Row justify="end" style={{ marginBottom: '20px' }}>
          <Col>
            <Button type="primary" onClick={showModal}>
              Add New Project
            </Button>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={projects.map((project, index) => ({ ...project, serial: index + 1 }))}
          pagination={false}
          rowKey="projectId"
          bordered
        />
        <Modal
          title="Add New Project"
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form form={form} onFinish={handleAddProject} layout="vertical">
            <Form.Item
              name="group"
              label="Group"
              rules={[{ required: true, message: 'Please select a group!' }]}

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

              label="Status"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }}>
                Save
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </Form.Item>
          </Form>
        </Modal>
      </TabPane>
      <TabPane tab="Select Process" key="2">
        {/* Content for Select Process */}
        <div>
          
          <AddProjectProcess selectedProject={selectedProject}/>
        </div>
      </TabPane>
      <TabPane tab="Allocate Process" key="3">
        {/* Content for Allocate Process */}
        <div>
          <ProjectUserAllocation/>
        </div>
      </TabPane>
    </Tabs>
  </Card>

  );
};

export default Project;
