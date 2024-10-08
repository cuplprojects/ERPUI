import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Switch, Form, message, Modal, Card, Row, Col } from 'antd';
import axios from 'axios';

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // Control modal visibility
  const [form] = Form.useForm();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingStatus, setEditingStatus] = useState(false);

  const getProjects = async () => {
    try {
      const response = await axios.get('https://localhost:7223/api/Project');
      setProjects(response.data);
    } catch (error) {
      message.error('Failed to fetch projects');
    }
  };

  useEffect(() => {
    getProjects();
  }, []);

  const handleAddProject = async (values) => {
    const { name, status, description } = values;

    const existingProject = projects.find(project => project.name.toLowerCase() === name.toLowerCase());
    if (existingProject) {
      message.error('Project name already exists!');
      return;
    }

    const newProject = { name, status, description };

    try {
      const response = await axios.post('https://localhost:7223/api/Project', newProject, {
        headers: { 'Content-Type': 'application/json' },
      });
      setProjects([...projects, response.data]);
      form.resetFields();
      setIsModalVisible(false); // Close the modal
      message.success('Project added successfully!');
    } catch (error) {
      message.error('Error adding project');
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
      await axios.put(`https://localhost:7223/api/Project/${updatedProject.projectId}`, updatedProject, {
        headers: { 'Content-Type': 'application/json' },
      });
      const updatedProjects = [...projects];
      updatedProjects[index] = updatedProject;
      setProjects(updatedProjects);
      setEditingIndex(null);
      message.success('Project updated successfully!');
    } catch (error) {
      message.error('Failed to update project');
    }
  };

  const columns = [
    {
      title: 'SN.',
      dataIndex: 'serial',
      key: 'serial',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => (
        editingIndex === index ? (
          <Input
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onPressEnter={() => handleEditSave(index)}
            onBlur={() => handleEditSave(index)}
          />
        ) : (
          <span>{text}</span>
        )
      ),
    },
    {
      title: 'Project Description',
      dataIndex: 'description',
      key: 'description',
      render: (text, record, index) => (
        editingIndex === index ? (
          <Input
            value={editingDescription}
            onChange={(e) => setEditingDescription(e.target.value)}
            onPressEnter={() => handleEditSave(index)}
            onBlur={() => handleEditSave(index)}
          />
        ) : (
          <span>{text}</span>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record, index) => (
        editingIndex === index ? (
          <Switch
            checked={editingStatus}
            onChange={(checked) => setEditingStatus(checked)}
          />
        ) : (
          <Switch checked={status} disabled />
        )
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record, index) => (
        editingIndex === index ? (
          <>
            <Button type="link" onClick={() => handleEditSave(index)}>Save</Button>
            <Button type="link" onClick={() => setEditingIndex(null)}>Cancel</Button>
          </>
        ) : (
          <Button type="link" onClick={() => {
            setEditingIndex(index);
            setEditingName(record.name);
            setEditingDescription(record.description);
            setEditingStatus(record.status);
          }}>Edit</Button>
        )
      ),
    },
  ];

  // Show the modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Handle cancel event of the modal
  const handleCancel = () => {
    form.resetFields(); // Reset form when modal is canceled
    setIsModalVisible(false);
  };

  return (
    <Card
      title="Project List"
      bordered={true}
      style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}
    >
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
            name="name"
            label="Project Name"
            rules={[{ required: true, message: 'Please input project name!' }]}
          >
            <Input placeholder="Project Name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Project Description"
            rules={[{ required: true, message: 'Please input project description!' }]}
          >
            <Input placeholder="Project Description" />
          </Form.Item>
          <Form.Item name="status" label="Status" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Project
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Project;
