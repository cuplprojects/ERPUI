import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Input, Button, Switch, Form, message, Modal } from 'antd';
import API from '../CustomHooks/MasterApiHooks/api';

const Group = () => {
  const [groups, setGroups] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingStatus, setEditingStatus] = useState(true);
  const [originalData, setOriginalData] = useState({});

  const fetchGroups = async () => {
    try {
      const response = await API.get('/Groups');
      setGroups(response.data);
    } catch (error) {

      // message.error('Failed to fetch groups!');
      console.log('Failed to fetch groups!');

    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleAddGroup = async (values) => {
    const { name, status } = values;

    const existingGroup = groups.find(group => group.name.toLowerCase() === name.toLowerCase());
    if (existingGroup) {
      message.error('Group name already exists!');
      return;
    }

    try {
      const newGroup = { name, status };
      await API.post('/Groups', newGroup);
      setGroups([...groups, newGroup]);
      form.resetFields();
      setIsModalVisible(false);
      message.success('Group added successfully!');
    } catch (error) {
      message.error('Failed to add group!');
    }
  };

  const handleEditSave = async (index) => {
    const groupToEdit = groups[index];
    const updatedGroup = { ...groupToEdit, name: editingValue, status: editingStatus };

    const existingGroup = groups.find(group => 
      group.name.toLowerCase() === editingValue.toLowerCase() && group.name !== groupToEdit.name
    );

    if (existingGroup) {
      message.error('Group name already exists!');
      return;
    }

    try {
      await API.put(`/Groups/${groupToEdit.id}`, updatedGroup);
      const updatedGroups = [...groups];
      updatedGroups[index] = updatedGroup;
      setGroups(updatedGroups);
      message.success('Group updated successfully!');
    } catch (error) {
      message.error('Failed to update group');
      fetchGroups();
    } finally {
      setEditingIndex(null);
      setEditingValue('');
      setEditingStatus(true);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue(originalData.name);
    setEditingStatus(originalData.status);
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
      render: (text, record, index) => (
        editingIndex === index ? (
          <Input
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
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
            onChange={(checked) => setEditingStatus(checked)} // Update status on toggle
          />
        ) : (
          <Switch checked={status} disabled /> // Display as read-only
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
            <Button type="link" onClick={handleCancelEdit}>Cancel</Button>
          </>
        ) : (
          <Button type="link" onClick={() => {
            setEditingIndex(index);
            setEditingValue(record.name);
            setEditingStatus(record.status);
            setOriginalData(record);
          }}>Edit</Button>
        )
      ),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
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
        dataSource={groups.map((group, index) => ({ ...group, serial: index + 1 }))}
        columns={columns}
        rowKey="id"
        pagination={false}
        bordered
      />

      <Modal
        title="Add Group"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form 
          form={form} 
          onFinish={handleAddGroup} 
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Group Name"
            rules={[{ required: true, message: 'Please input group name!' }]}
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
