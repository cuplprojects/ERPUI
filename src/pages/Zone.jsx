import React, { useState } from 'react';
import { Input, Button, Switch, Select, Table, Form, message, Modal } from 'antd';

const Zone = () => {
  const [zones, setZones] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // Control modal visibility
  const [form] = Form.useForm();

  // Function to handle adding a zone
  const handleAddZone = (values) => {
    const { zoneName, zoneDescription, cameraId, status } = values;

    // Check if the zone name already exists
    const existingZone = zones.find(zone => zone.zoneName === zoneName);
    if (existingZone) {
      message.error('Zone Name already exists!');
      return;
    }

    const newZone = { zoneName, zoneDescription, cameraId, status: status || false };
    setZones([...zones, newZone]);
    form.resetFields();
    setIsModalVisible(false); // Close the modal
    message.success('Zone added successfully!');
  };

  // Function to handle status change
  const handleStatusChange = (zoneName) => {
    const updatedZones = zones.map(zone =>
      zone.zoneName === zoneName ? { ...zone, status: !zone.status } : zone
    );
    setZones(updatedZones);
  };

  // Columns for the table
  const columns = [
    {
      title: 'SN.',
      key: 'serial',
      render: (text, record, index) => index + 1, // Render the serial number based on the index
    },
    {
      title: 'Zone Name',
      dataIndex: 'zoneName',
      key: 'zoneName',
    },
    {
      title: 'Zone Description',
      dataIndex: 'zoneDescription',
      key: 'zoneDescription',
    },
    {
      title: 'Assign Camera ID',
      dataIndex: 'cameraId',
      key: 'cameraId',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Switch 
          checked={status} 
          checkedChildren="Active" 
          unCheckedChildren="Archive" 
          onChange={() => handleStatusChange(record.zoneName)} // Handle status toggle
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
      <h2 style={{ marginBottom: '20px' }}>Zone</h2>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Button type="primary" onClick={showModal}>
          Add Zone
        </Button>
      </div>

      <Table
        dataSource={zones.map((zone, index) => ({ ...zone, key: index }))} // Unique key for each row
        columns={columns}
        pagination={false}
        bordered
        style={{ marginTop: '20px' }}
      />

      <Modal
        title="Add Zone"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null} // No default footer to allow custom buttons in form
      >
        <Form form={form} onFinish={handleAddZone} layout="vertical">
          <Form.Item name="zoneName" label="Zone Name" rules={[{ required: true, message: 'Please input Zone Name!' }]}>
            <Input placeholder="Zone Name" />
          </Form.Item>
          <Form.Item name="zoneDescription" label="Zone Description" rules={[{ required: true, message: 'Please input Zone Description!' }]}>
            <Input.TextArea placeholder="Zone Description" />
          </Form.Item>
          <Form.Item name="cameraId" label="Assign Camera ID" rules={[{ required: true, message: 'Please select Camera ID!' }]}>
            <Select placeholder="Select Camera">
              <Select.Option value="camera1">Camera 1</Select.Option>
              <Select.Option value="camera2">Camera 2</Select.Option>
              <Select.Option value="camera3">Camera 3</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Zone
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Zone;
