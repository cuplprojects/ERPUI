import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Switch, Form, Row, Col, message, Checkbox } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import API from '../../../CustomHooks/MasterApiHooks/api';
import themeStore from '../../../store/themeStore';
import EditProjectModal from '../components/EditProjectModal';
import AddProjectModal from '../components/AddProjectModal';

const ProjectTab = ({ setActiveTabKey, setSelectedProject }) => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [types, setTypes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editingProject, setEditingProject] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [showSeriesFields, setShowSeriesFields] = useState(false);
  const [numberOfSeries, setNumberOfSeries] = useState(0);
  const [seriesNames, setSeriesNames] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [sortedInfo, setSortedInfo] = useState({});
  const [total, setTotal] = useState(0);
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    getProjects();
    getGroups();
    getTypes();
  }, []);

  const getProjects = async () => {
    try {
      const response = await API.get('/Project');
      setProjects(response.data);
      setTotal(response.data.length);
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

  const handleAddProject = async (values) => {
    if (!selectedGroup || !selectedType) {
      message.error(t('pleaseSelectGroupAndType'));
      return;
    }
    const newProject = {
      name: projectName,
      status: values.status || true,
      description: values.description || '',
      groupId: selectedGroup.id,
      typeId: selectedType.typeId,
      noOfSeries: numberOfSeries, 
      seriesName: seriesNames,
      quantityThreshold: parseInt(values.quantityThreshold) 
    };
    
    try {
      const response = await API.post('/Project1', newProject);
      getProjects();
      setProjects([...projects, response.data]);
      form.resetFields();
      setIsModalVisible(false);
      setProjectName('');
      setSelectedGroup(null);
      setSelectedType(null);
      setNumberOfSeries(0); // Reset numberOfSeries
      setSeriesNames('');
      message.success(t('projectAddedSuccessfully'));
      setActiveTabKey("2");
      setSelectedProject(response.data.projectId);
    } catch (error) {
      console.error('Error adding project:', error);
      const errorMessage = error.response?.data || t('errorAddingProject');
      message.error(errorMessage);
    }
  };

  const handleEditSave = async (values) => {
    try {
      const selectedTypeObj = types.find(type => type.typeId === values.type);
      
      const updatedProject = {
        ...editingProject,
        name: values.name,
        description: values.description,
        status: values.status,
        quantityThreshold: values.quantityThreshold,
        groupId: values.group,
        typeId: values.type,
        noOfSeries: numberOfSeries, // Use the state value directly
        seriesName: values.seriesNames
      };

      if (selectedTypeObj?.types.toLowerCase() === 'booklet') {
        if (numberOfSeries !== values.seriesName?.length) {
          message.error(t('seriesNameLengthMismatch'));
          return;
        }
      }

      await API.put(`/Project/${editingProject.projectId}`, updatedProject);
      const updatedProjects = projects.map(p =>
        p.projectId === editingProject.projectId ? updatedProject : p
      );
      setProjects(updatedProjects);
      setIsEditModalVisible(false);
      setEditingProject(null);
      setNumberOfSeries(0); // Reset numberOfSeries
      setNumberOfSeries('');
      message.success(t('projectUpdatedSuccessfully'));
    } catch (error) {
      console.error('Failed to update project:', error);
      message.error(t('failedToUpdateProject'));
    }
  };

  const columns = [
    {
      align: 'center',
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
      render: (text, record) => (
        <a onClick={() => {
          setActiveTabKey("2");
          setSelectedProject(record.projectId);
        }}>
          {text}
        </a>
      ),
    },
    ...(showDescription ? [{
      title: t('projectDescription'),
      dataIndex: 'description',
      key: 'description',
    }] : []),
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
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
      render: (_, record) => (
        <Button
          className={`${customBtn} d-flex align-items-center justify-content-center`}
          onClick={() => {
            setEditingProject(record);
            setNumberOfSeries(record.noOfSeries); // Set numberOfSeries when editing
            setSeriesNames(record.seriesName);
            editForm.setFieldsValue({
              name: record.name,
              description: record.description,
              status: record.status,
              group: record.groupId,
              type: record.typeId,
              numberOfSeries: record.noOfSeries,
              seriesNames: record.seriesName,
              quantityThreshold: parseInt(record.quantityThreshold)
            });
            setIsEditModalVisible(true);
          }}
          icon={<EditOutlined />}
        >
          {t('edit')}
        </Button>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const filteredProjects = projects.filter(project =>
    Object.values(project).some(value =>
      value && value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const currentProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleGroupChange = (event) => {
    const selectedGroupId = parseInt(event.target.value, 10);
    const selectedGroupObj = groups.find((group) => group.id === selectedGroupId);
    setSelectedGroup(selectedGroupObj);

    if (selectedGroupObj && selectedType) {
      setProjectName(`${selectedGroupObj.name}-${selectedType.types}`);
    } else {
      setProjectName('');
    }
  };

  const handleTypeChange = (event) => {
    const selectedTypeId = parseInt(event.target.value, 10);
    const selectedTypeObj = types.find((type) => type.typeId === selectedTypeId);
    setSelectedType(selectedTypeObj);

    if (selectedGroup && selectedTypeObj) {
      const typeName = selectedTypeObj.types.toLowerCase();
      if (typeName === 'booklet') {
        setProjectName(`${selectedGroup.name}-${selectedTypeObj.types}`);
        setShowSeriesFields(true);
      } else {
        setShowSeriesFields(false);
        setProjectName(`${selectedGroup.name}-${selectedTypeObj.types}`);
      }
    } else {
      setProjectName('');
      setShowSeriesFields(false);
    }
  };

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} style={{ textAlign: 'left' }}>
          <Button
            type="primary"
            className={`${customBtn} mt-1`}
            onClick={() => setIsModalVisible(true)}
          >
            {t('addNewProject')}
          </Button>
        </Col>
        <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
          <Checkbox 
            checked={showDescription}
            onChange={(e) => setShowDescription(e.target.checked)}
            className="me-3"
          >
            {t('showDescription')}
          </Checkbox>
          <Input.Search
            placeholder={t('searchProjects')}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: '100%', maxWidth: '300px' }}
            className={`${customDarkText} mt-1`}
          />
        </Col>
      </Row>

      <div className="table-responsive">
        <Table
          columns={columns}
          dataSource={currentProjects.map((project, index) => ({ ...project, serial: index + 1 }))}
          onChange={handleTableChange}
          pagination={{
            className: 'p-3 rounded rounded-top-0',
            current: currentPage,
            pageSize: pageSize,
            total: filteredProjects.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} ${t('of')} ${total} ${t('items')}`,
            pageSizeOptions: ['10', '15', '20']
          }}
          rowKey="projectId"
          bordered
          scroll={{ x: 'max-content' }}
          className={`${customDark === "default-dark" ? "thead-default" : ""}
              ${customDark === "red-dark" ? "thead-red" : ""}
              ${customDark === "green-dark" ? "thead-green" : ""}
              ${customDark === "blue-dark" ? "thead-blue" : ""}
              ${customDark === "dark-dark" ? "thead-dark" : ""}
              ${customDark === "pink-dark" ? "thead-pink" : ""}
              ${customDark === "purple-dark" ? "thead-purple" : ""}
              ${customDark === "light-dark" ? "thead-light" : ""}
              ${customDark === "brown-dark" ? "thead-brown" : ""} custom-pagination`}
        />
      </div>

      <AddProjectModal
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setProjectName('');
          setSelectedGroup(null);
          setSelectedType(null);
          setNumberOfSeries(0); // Reset numberOfSeries
          setSeriesNames('');
        }}
        form={form}
        onFinish={handleAddProject}
        groups={groups}
        types={types}
        showSeriesFields={showSeriesFields}
        customDarkText={customDarkText}
        customDark={customDark}
        customMid={customMid}
        customLight={customLight}
        customBtn={customBtn}
        customLightText={customLightText}
        customLightBorder={customLightBorder}
        customDarkBorder={customDarkBorder}
        t={t}
        handleGroupChange={handleGroupChange}
        handleTypeChange={handleTypeChange}
        numberOfSeries={numberOfSeries}
        setNumberOfSeries={setNumberOfSeries}
        seriesNames = {seriesNames}
        setSeriesNames = {setSeriesNames}
        projectName={projectName}
        setProjectName={setProjectName}
        selectedGroup={selectedGroup}
        selectedType={selectedType}
      />

      <EditProjectModal
        visible={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
          setNumberOfSeries(0); // Reset numberOfSeries
          setSeriesNames('');
        }}
        form={editForm}
        onFinish={handleEditSave}
        groups={groups}
        types={types}
        showSeriesFields={showSeriesFields}
        customDarkText={customDarkText}
        customDark={customDark}
        customMid={customMid}
        customLight={customLight}
        customBtn={customBtn}
        customLightText={customLightText}
        customLightBorder={customLightBorder}
        customDarkBorder={customDarkBorder}
        numberOfSeries={numberOfSeries}
        setNumberOfSeries={setNumberOfSeries}
        seriesNames = {seriesNames}
        setSeriesNames = {setSeriesNames}
        t={t}
      />
    </>
  );
};

export default ProjectTab;
