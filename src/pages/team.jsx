import React, { useState } from 'react';
import { Button, Modal, Form, Input, Select, Table, Card, Typography, Divider } from 'antd';
import { PlusOutlined, TeamOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

const Team = () => {
  const [teams, setTeams] = useState([]); // List of teams
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [form] = Form.useForm(); // Form instance

  // Dummy data for team members
  const allUsers = [
    { userId: 1, fullName: 'John Doe' },
    { userId: 2, fullName: 'Jane Smith' },
    { userId: 3, fullName: 'Alice Johnson' },
    { userId: 4, fullName: 'Bob Brown' },
  ];

  // Handle opening of the modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Handle closing of the modal
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields(); // Reset the form fields when modal closes
  };

  // Handle form submission
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const newTeam = {
          teamName: values.teamName,
          teamMembers: values.teamMembers,
        };

        // Update the state with the new team
        setTeams([...teams, newTeam]);
        setIsModalVisible(false);
        form.resetFields(); // Reset the form fields after submitting
      })
      .catch((info) => {
        console.error('Form validation failed:', info);
      });
  };

  // Define table columns
  const columns = [
    {
      title: 'SN', // Serial Number
      dataIndex: 'sn',
      key: 'sn',
      render: (text, record, index) => index + 1, // Auto-generate SN (starting from 1)
    },
    {
      title: 'Team Name',
      dataIndex: 'teamName',
      key: 'teamName',
    },
    {
      title: 'Members',
      dataIndex: 'teamMembers',
      key: 'teamMembers',
      render: (members) =>
        members
          .map((id) => allUsers.find((user) => user.userId === id)?.fullName)
          .join(', '),
    },
  ];

  return (
    <div style={{ padding: '40px' }}>
      <Card style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2} style={{ color: '#1890ff' }}>
            <TeamOutlined /> Team Management
          </Title>
          <Text type="secondary">Manage your teams and their members effectively.</Text>
        </div>

        {/* Add Team Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal} size="large">
            Add Team
          </Button>
        </div>

        {/* Team Table */}
        <Divider>Existing Teams</Divider>
        <Table
          columns={columns}
          dataSource={teams.map((team, index) => ({
            ...team,
            key: index, // Ensure each row has a unique key
          }))}
          pagination={false} // Disable pagination for simplicity
          bordered // Add borders to the table
          style={{ marginTop: '20px' }}
          rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')} // Add row striping
        />
      </Card>

      {/* Modal for Adding Team */}
      <Modal
        title="Add New Team"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Add Team"
        cancelText="Cancel"
        centered // Center the modal
        bodyStyle={{ padding: '20px 40px' }}
      >
        <Form form={form} layout="vertical" name="addTeamForm">
          {/* Team Name */}
          <Form.Item
            label="Team Name"
            name="teamName"
            rules={[{ required: true, message: 'Please enter the team name!' }]}
          >
            <Input placeholder="Enter team name" size="large" />
          </Form.Item>

          {/* Team Members (Select multiple users) */}
          <Form.Item
            label="Team Members"
            name="teamMembers"
            rules={[{ required: true, message: 'Please select team members!' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select team members"
              allowClear
              size="large"
            >
              {allUsers.map((user) => (
                <Option key={user.userId} value={user.userId}>
                  {user.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Team;
