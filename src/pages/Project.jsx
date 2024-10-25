import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AddProjectProcess from './AddProjectProcess';
import ProjectUserAllocation from './ProjectUserAllocation';


import { Table, Tabs, Button, Input, Switch, Form, message, Card, Row, Col, Select, Pagination } from 'antd';
import { Modal } from 'antd'; // Change this import to use Ant Design's Modal
import { useNavigate } from 'react-router-dom';
import API from '../CustomHooks/MasterApiHooks/api';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';


const { Option } = Select;

const Project = () => {
  const { t } = useTranslation();

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

  const { TabPane } = Tabs;
  const [activeTabKey, setActiveTabKey] = useState("1"); // State for active tab
  const [selectedProject, setSelectedProject] = useState();


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
      message.error(t('unableToFetchProjects'));
    }
  };

  const getGroups = async () => {
    try {
      const response = await API.get('/Groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to fetch groups', error);
      message.error(t('unableToFetchGroups'));
    }
  };

  const getTypes = async () => {
    try {
      const response = await API.get('/PaperTypes');
      setTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch types', error);
      message.error(t('unableToFetchTypes'));
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
      message.error(t('projectNameAlreadyExists'));
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
      message.success(t('projectAddedSuccessfully'));
      setActiveTabKey("2"); // Switch to Select Process tab
      setSelectedProject(response.data.projectId); 
    } catch (error) {
      console.error('Error adding project:', error);
      message.error(t('errorAddingProject'));
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
      message.success(t('projectUpdatedSuccessfully'));
    } catch (error) {
      console.error('Failed to update project:', error);
      message.error(t('failedToUpdateProject'));
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const columns = [
    {
      title: t('sn'),
      dataIndex: 'serial',
      key: 'serial',
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: t('projectName'),
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
      title: t('projectDescription'),
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
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status - b.status,
      sortOrder: sortedInfo.columnKey === 'status' && sortedInfo.order,
      render: (status, record, index) =>
        editingIndex === index ? (
          <Switch
            checked={editingStatus}
            onChange={(checked) => setEditingStatus(checked)}
            checkedChildren={t('active')}
            unCheckedChildren={t('inactive')}
          />
        ) : (
          <Switch
            checked={status}
            disabled
            checkedChildren={t('active')}
            unCheckedChildren={t('inactive')}
          />
        ),
    },
    {
      title: t('action'),
      key: 'action',
      render: (_, record, index) =>
        editingIndex === index ? (
          <>
            <Button type="link" onClick={() => handleEditSave(index)}>
              {t('save')}
            </Button>
            <Button type="link" onClick={() => setEditingIndex(null)}>
              {t('cancel')}
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
            {t('edit')}
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
      title={t('projects')}
      bordered={true}
      style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}
      className={customDarkText}
    >
      <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
        <TabPane tab={t('projectList')} key="1">
          <Row justify="end" style={{ marginBottom: '20px' }}>
            <Col>
              <Button type="primary" onClick={showModal}>
                {t('addNewProject')}
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
            title={t('addNewProject')}
            visible={isModalVisible}
            onCancel={handleCancel}
            footer={null}
          >
            <Form form={form} onFinish={handleAddProject} layout="vertical">
              <Form.Item
                name="group"
                label={t('group')}
                rules={[{ required: true, message: t('pleaseSelectGroup') }]}
              >
                <Select onChange={handleGroupChange} placeholder={t('selectGroup')}>
                  {groups.map((group) => (
                    <Option key={group.id} value={group.id}>{group.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="type"
                label={<span className={customDarkText}>{t('type')}</span>}
                rules={[{ required: true, message: t('pleaseSelectType') }]}
              >
                <Select onChange={handleTypeChange} placeholder={t('selectType')}>
                  {types.map((type) => (
                    <Option key={type.typeId} value={type.typeId}>{type.types}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="name"
                label={<span className={customDarkText}>{t('projectName')}</span>}
                rules={[{ required: true, message: t('pleaseEnterProjectName') }]}
              >
                <Input placeholder={t('enterProjectName')} />
              </Form.Item>
              <Form.Item
                name="description"
                label={<span className={customDarkText}>{t('description')}</span>}
                rules={[{ required: true, message: t('pleaseEnterDescription') }]}
              >
                <Input.TextArea rows={4} placeholder={t('enterDescription')} />
              </Form.Item>
              <Form.Item
                name="status"
                label={t('status')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }}>
                  {t('save')}
                </Button>
                <Button onClick={handleCancel}>{t('cancel')}</Button>
              </Form.Item>
            </Form>
          </Modal>
        </TabPane>
        <TabPane tab={t('selectProcess')} key="2" disabled>
          {/* Content for Select Process */}
          <div>
            <AddProjectProcess selectedProject={selectedProject}/>
          </div>
        </TabPane>
        <TabPane tab={t('allocateProcess')} key="3">
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
