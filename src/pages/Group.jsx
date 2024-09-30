import React, { useState } from 'react';
import { Table, Input, Button, Switch, Form, message, Modal } from 'antd';

const Group = () => {
  const [groups, setGroups] = useState([]); // State to store groups
  const [isModalVisible, setIsModalVisible] = useState(false); // Control modal visibility
  const [form] = Form.useForm(); // Form instance

  // Function to handle group addition
  const handleAddGroup = (values) => {
    const { groupName, status } = values;

    // Check if the group name already exists
    const existingGroup = groups.find(group => group.groupName.toLowerCase() === groupName.toLowerCase());

    if (existingGroup) {
      message.error('Group name already exists!'); // Show error message
      return;
    }

    const newGroup = { groupName, status };
    setGroups([...groups, newGroup]); // Update group list
    form.resetFields(); // Reset the form fields after submission
    setIsModalVisible(false); // Close the modal after submission

    // Show success message
    message.success('Group added successfully!');
  };

  // Function to handle status change of the group
  const handleStatusChange = (groupName) => {
    const updatedGroups = groups.map(group =>
      group.groupName === groupName ? { ...group, status: !group.status } : group
    );
    setGroups(updatedGroups);
  };

  const columns = [
    {
      title: 'SN.',
      dataIndex: 'serial',
      key: 'serial',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Group Name',
      dataIndex: 'groupName',
      key: 'groupName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Switch 
          checked={status} 
          onChange={() => handleStatusChange(record.groupName)} 
        />
      ),
    },
  ];

  // Define row class name for striped effect
  const rowClassName = (record, index) => (index % 2 === 0 ? 'striped-row' : '');

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
      <h2 style={{ marginBottom: '20px' }}>Group</h2>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Button type="primary" onClick={showModal}>
          Add Group
        </Button>
      </div>

      <Table
        dataSource={groups.map((group, index) => ({ ...group, serial: index + 1 }))} // Add serial index
        columns={columns}
        rowKey="groupName"
        pagination={false}
        rowClassName={rowClassName}
        bordered
      />

      <Modal
        title="Add Group"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null} // No default footer to allow custom buttons in form
      >
        <Form 
          form={form} 
          onFinish={handleAddGroup} 
          layout="vertical"
          onKeyPress={(e) => { // Check for Enter key press
            if (e.key === 'Enter') {
              form.submit(); // Trigger form submission
            }
          }}
        >
          <Form.Item
            name="groupName"
            label="Group Name"
            rules={[
              { required: true, message: 'Please input group name!' },
              { 
                validator: (_, value) => {
                  // Check if the value is not purely numeric
                  const isNumeric = /^\d+$/;
                  if (value && isNumeric.test(value)) {
                    return Promise.reject(new Error('Group name cannot contain only numbers!'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input placeholder="Group Name" />
          </Form.Item>

          <Form.Item name="status" label="Status" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Group
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Group;
