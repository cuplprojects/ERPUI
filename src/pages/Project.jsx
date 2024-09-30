import React, { useState } from 'react';
import { Table, Input, Button, Switch, Form, message, Modal } from 'antd';

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // Control modal visibility
  const [form] = Form.useForm();

  const handleAddProject = (values) => {
    const { projectName, status } = values;

    // Check if the project name already exists
    const existingProject = projects.find(project => project.projectName.toLowerCase() === projectName.toLowerCase());

    if (existingProject) {
      message.error('Project name already exists!'); // Show error message
      return;
    }

    const newProject = { projectName, status };
    setProjects([...projects, newProject]);
    form.resetFields(); // Reset the form fields after submission
    setIsModalVisible(false); // Close the modal
    message.success('Project added successfully!'); // Show success message
  };

  const handleStatusChange = (projectName) => {
    const updatedProjects = projects.map(project =>
      project.projectName === projectName ? { ...project, status: !project.status } : project
    );
    setProjects(updatedProjects);
  };

  const columns = [
    {
      title: 'SN.', // Serial Number Column
      dataIndex: 'serial',
      key: 'serial',
      render: (text, record, index) => index + 1, // Render the serial number based on the index
    },
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Switch 
          checked={status} 
          onChange={() => handleStatusChange(record.projectName)} 
          checkedChildren="Active" 
          unCheckedChildren="Archived" 
        />
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
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ marginBottom: '20px' }}>Project</h2>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Button type="primary" onClick={showModal}>
          Add Project
        </Button>
      </div>

      <Table
        dataSource={projects.map((project, index) => ({ ...project, serial: index + 1 }))} 
        columns={columns}
        rowKey="projectName" // Use projectName as the unique key
        pagination={false}
        bordered // Make the table bordered
      />

      <Modal
        title="Add Project"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null} // No default footer to allow custom buttons in form
      >
        <Form form={form} onFinish={handleAddProject} layout="vertical">
          <Form.Item
            name="projectName"
            label="Project Name"
            rules={[{ required: true, message: 'Please input project name!' }]}
          >
            <Input placeholder="Project Name" />
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
    </div>
  );
};

export default Project;
