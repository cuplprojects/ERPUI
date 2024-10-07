import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Input, Button, Switch, Form, message, Modal } from 'antd';

const Group = () => {
  const [groups, setGroups] = useState([]); // State to store groups
  const [isModalVisible, setIsModalVisible] = useState(false); // Control modal visibility
  const [form] = Form.useForm(); // Form instance

  // Fetch groups from the server
  const fetchGroups = async () => {
    try {
      const response = await axios.get('https://localhost:7223/api/Groups'); // Adjust the endpoint as needed
      setGroups(response.data);
    } catch (error) {
      message.error('Failed to fetch groups!');
    }
  };

  // UseEffect to fetch groups on component mount
  useEffect(() => {
    fetchGroups();
  }, []);

  // Function to handle group addition
  const handleAddGroup = async (values) => {
    const { name, status } = values;

    // Check if the group name already exists
    const existingGroup = groups.find(group => group.name.toLowerCase() === name.toLowerCase());

    if (existingGroup) {
      message.error('Group name already exists!'); // Show error message
      return;
    }

    try {
      // Make POST request to add a new group
      const newGroup = { name, status };
      await axios.post('https://localhost:7223/api/Groups', newGroup); // Adjust the endpoint as needed
      setGroups([...groups, newGroup]); // Update group list
      form.resetFields(); // Reset the form fields after submission
      setIsModalVisible(false); // Close the modal after submission

      // Show success message
      message.success('Group added successfully!');
    } catch (error) {
      message.error('Failed to add group!');
    }
  };

  // Function to handle status change of the group
  const handleStatusChange = async (name) => {
    // Find the group by name to get its current status and ID
    const groupToUpdate = groups.find(group => group.name === name);
  
    if (!groupToUpdate) {
      message.error('Group not found!');
      return;
    }
  
    const updatedStatus = !groupToUpdate.status;
    
    try {
      // Make a PUT request to update group status, including the name
      await axios.put(`https://localhost:7223/api/Groups/${groupToUpdate.id}`, { 
       ...groupToUpdate, // Send the group name
        status: updatedStatus 
      });
      
      // Update local state
      const updatedGroups = groups.map(group =>
        group.name === name ? { ...group, status: updatedStatus } : group
      );
      
      setGroups(updatedGroups);
      message.success('Group status updated successfully')
    } catch (error) {
      message.error('Failed to update group status!');
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
      title: 'Group Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Switch 
          checked={status} 
          onChange={() => handleStatusChange(record.name)} 
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Button type="primary" onClick={showModal}>
          Add Group
        </Button>
      </div>

      <Table
        dataSource={groups.map((group, index) => ({ ...group, serial: index + 1 }))} // Add serial index
        columns={columns}
        rowKey="name"
        pagination={false}
        rowClassName={rowClassName}
        bordered
      />

      <Modal
        title="Add Group"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null} // No default footer to allow custom buttons in form
      >
        <Form 
          form={form} 
          onFinish={handleAddGroup} 
          layout="vertical"
          onKeyUp={(e) => { // Check for Enter key press
            if (e.key === 'Enter') {
              form.submit(); // Trigger form submission
            }
          }}
        >
          <Form.Item
            name="name"
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
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Group;
