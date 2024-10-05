import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Form, Card, Row, Col, message, Switch } from 'antd';
import axios from 'axios';

const CameraList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    form.resetFields(); // Reset form when modal is canceled
    setIsModalOpen(false);
  };

  const getCameras = async () => {
    try {
      const response = await axios.get('https://localhost:7223/api/Cameras');
      setCameras(response.data);
    } catch (error) {
      message.error('Failed to fetch cameras');
    }
  };

  useEffect(() => {
    getCameras();
  }, []);

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      const newCamera = { name: values.name, isCamera: true }; // Assuming isCamera should be true
      try {
        const response = await axios.post('https://localhost:7223/api/Cameras', newCamera);
        setCameras([...cameras, response.data]); // Add the camera from the response
        form.resetFields();
        setIsModalOpen(false);
        message.success('Camera added successfully!');
      } catch (error) {
        message.error('Error adding camera');
      }
    });
  };

  const handleStatusChange = async (name) => {
    const cameraToUpdate = cameras.find(camera => camera.name === name);

    if (!cameraToUpdate) {
      message.error('Camera not found!');
      return;
    }

    const updatedStatus = !cameraToUpdate.isCamera;

    try {
      await axios.put(`https://localhost:7223/api/Cameras/${cameraToUpdate.cameraId}`, { 
        ...cameraToUpdate,
        isCamera: updatedStatus 
      });
      const updatedCameras = cameras.map(camera =>
        camera.name === name ? { ...camera, isCamera: updatedStatus } : camera
      );

      setCameras(updatedCameras);
      message.success('Camera status updated successfully!');
    } catch (error) {
      message.error('Failed to update camera status!');
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
      title: 'Camera Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'isCamera',
      key: 'isCamera',
      render: (isCamera, record) => (
        <Switch 
          checked={isCamera} 
          onChange={() => handleStatusChange(record.name)} 
        />
      ),
    },
  ];

  const rowClassName = (record, index) => (index % 2 === 0 ? 'striped-row' : '');

  return (
    <Card
      title="Camera List"
      bordered={true}
      style={{ width: '400px', margin: '0 auto', padding: '20px' }}
    >
      <Row justify="end" style={{ marginBottom: '20px' }}>
        <Col>
          <Button type="primary" onClick={showModal}>
            Add New Camera
          </Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={cameras.map((camera, index) => ({ ...camera, serial: index + 1 }))} // Add serial index
        pagination={false}
        style={{ marginBottom: '20px' }}
        size="small"
        rowKey="cameraId"
        rowClassName={rowClassName}
        bordered
      />
      <Modal
        title="Add New Camera"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={300}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Camera Name"
            rules={[{ required: true, message: 'Please enter camera name' }]}
          >
            <Input placeholder="Enter camera name" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CameraList;
