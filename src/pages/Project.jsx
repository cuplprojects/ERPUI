import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Table, Select, Input, Space, Button, Typography, Row, Col, Checkbox, Form, Dropdown, Menu, message, Switch } from 'antd';
import { Card, Modal } from 'react-bootstrap';
import { EyeOutlined, EditOutlined, SaveOutlined, CloseOutlined, SettingOutlined, SearchOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import API from '../CustomHooks/MasterApiHooks/api';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { useMediaQuery } from 'react-responsive';
import { AiFillCloseSquare } from 'react-icons/ai';
import { BsFunnelFill } from "react-icons/bs";
import { useTranslation } from 'react-i18next';
import { hasPermission } from '../CustomHooks/Services/permissionUtils';

const { Option } = Select;
const { Title } = Typography;

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

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [sortedInfo, setSortedInfo] = useState({});
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    description: true,
    status: true,
  });
  const [columnSettingsVisible, setColumnSettingsVisible] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  const getProjects = useCallback(async () => {
    try {
      const response = await API.get('/Project');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
      message.error(t('failedToFetchProjects'));
    }
  }, [t]);

  const getGroups = useCallback(async () => {
    try {
      const response = await API.get('/Groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to fetch groups', error);
      message.error(t('failedToFetchGroups'));
    }
  }, [t]);

  const getTypes = useCallback(async () => {
    try {
      const response = await API.get('/PaperTypes');
      setTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch types', error);
      message.error(t('failedToFetchTypes'));
    }
  }, [t]);

  useEffect(() => {
    getProjects();
    getGroups();
    getTypes();
  }, [getProjects, getGroups, getTypes]);

  const handleAddProject = useCallback(async (values) => {
    const { name, status, description } = values;

    const existingProject = projects.find(
      (project) => project.name.toLowerCase() === name.toLowerCase()
    );
    if (existingProject) {
      message.error(t('projectNameExists'));
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
    } catch (error) {
      console.error('Error adding project:', error);
      message.error(t('errorAddingProject'));
    }
  }, [projects, selectedGroup, selectedType, form, t]);

  const handleEditSave = useCallback(async (index) => {
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
  }, [projects, editingName, editingDescription, editingStatus, t]);

  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const handleColumnVisibilityChange = useCallback((e, column) => {
    setVisibleColumns(prev => ({ ...prev, [column]: e.target.checked }));
  }, []);

  const columns = useMemo(() => [
    {
      title: t('sn'),
      dataIndex: 'serial',
      key: 'serial',
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      width: 80,
    },
    visibleColumns.name && {
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
          <span>{text}</span>
        ),
      width: 200,
    },
    visibleColumns.description && {
      title: t('description'),
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
      width: 200,
    },
    visibleColumns.status && {
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
      width: 120,
    },
    {
      title: t('actions'),
      key: 'action',
      render: (_, record, index) =>
        editingIndex === index ? (
          <Space>
            <Button
              icon={<SaveOutlined />}
              onClick={() => handleEditSave(index)}
              type="primary"
              className={customBtn}
            >
              {t('save')}
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={() => setEditingIndex(null)}
            >
              {t('cancel')}
            </Button>
          </Space>
        ) : (
          <Button
            type="link"
            onClick={() => {
              setEditingIndex(index);
              setEditingName(record.name);
              setEditingDescription(record.description);
              setEditingStatus(record.status);
            }}
            disabled={!hasPermission('2.1.3.3')}
          >
            {t('edit')}
          </Button>
        ),
      width: 150,
    },
  ].filter(Boolean), [visibleColumns, editingIndex, editingName, editingDescription, editingStatus, handleEditSave, currentPage, pageSize, sortedInfo, customBtn, t]);

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
    <Card
      className={`${customDark === "dark-dark" ? `${customDark}` : `${customLight}`}`}
      bordered={true}
      style={{ padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          
        </Col>
        <Col>
          <Space><Input
            placeholder={t('searchProjects')}
            suffix={<SearchOutlined />}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
            <Dropdown overlay={columnSettingsMenu} trigger={['click']} visible={columnSettingsVisible} onVisibleChange={setColumnSettingsVisible}>
              <Button icon={<SettingOutlined />} className={`${customDark === "dark-dark" ? "text-dark" : customDarkText} border-0`}>
              </Button>
            </Dropdown>
            <Button onClick={showModal} className={`${customBtn} border-0`}>
              {t('addNewProject')}
            </Button>
          </Space>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={filteredProjects}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredProjects.length,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          },
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        rowKey="projectId"
        bordered
        onChange={handleTableChange}
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
        show={isModalVisible}
        onHide={handleCancel}
        centered
        className={`rounded-2 ${customDark === "" ? `${customDark}` : ''}  `}
      >
        <Modal.Header closeButton={false} className={`rounded-top-2 ${customDark} ${customLightText} ${customDark === "dark-dark" ? `border ` : `border-0`} border d-flex justify-content-between `}>
          <Modal.Title>{t('addNewProject')}</Modal.Title>
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
              label={<span className={customDarkText}>{t('group')}</span>}
              rules={[{ required: true, message: t('pleaseSelectGroup') }]}
              className={`${customDark === "dark-dark" ? `text-white` : ''}`}
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
              label={<span className={customDarkText}>{t('status')}</span>}
              valuePropName="checked"
              initialValue={true}
            >
              <Switch
                checkedChildren={t('active')}
                unCheckedChildren={t('inactive')}
                defaultChecked
              />
            </Form.Item>
          </Form>
        </Modal.Body>
        <Modal.Footer className={` ${customDark} ${customLightText} ${customDark === "dark-dark" ? `border ` : `border-0`} border d-flex justify-content-between `}>
          <Button variant="secondary" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={form.submit}>
            {t('save')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default Project;
