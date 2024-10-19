import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Form, Card, Row, Col, message } from 'antd';
import axios from 'axios';
import API from '../CustomHooks/MasterApiHooks/api';

const CameraList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [form] = Form.useForm();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState('');

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    form.resetFields(); // Reset form when modal is canceled
    setIsModalOpen(false);
  };

  const getCameras = async () => {
    try {
      const response = await API.get('/Cameras');
      setCameras(response.data);
    } catch (error) {
      console.error('Failed to fetch cameras');
    }
  };

  useEffect(() => {
    getCameras();
  }, []);

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      const newCamera = { name: values.name }; // Add new camera
      try {
        const response = await API.post('/Cameras', newCamera);
        setCameras([...cameras, response.data]); // Add the camera from the response
        form.resetFields();
        setIsModalOpen(false);
        message.success('Camera added successfully!');
      } catch (error) {
        message.error('Error adding camera');
      }
    });
  };

  const handleEditSave = async (index) => {
    const updatedCamera = {
      ...cameras[index],
      name: editingName,
    };

    try {
      await API.put(`/Cameras/${updatedCamera.cameraId}`, updatedCamera);
      const updatedCameras = [...cameras];
      updatedCameras[index] = updatedCamera;
      setCameras(updatedCameras);
      setEditingIndex(null);
      setEditingName('');
      message.success('Camera updated successfully!');
    } catch (error) {
      message.error('Failed to update camera');
    }
  };

  const columns = [
    {
      title: 'SN.',
      dataIndex: 'serial',
      key: 'serial',
      render: (text, record, index) => index + 1,
      width: '10%',
    },
    {
      title: 'Camera Name',
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
      width: '70%',
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
          }}>Edit</Button>
        )
      ),
    },
  ];

  const rowClassName = (record, index) => (index % 2 === 0 ? 'striped-row' : '');

  return (
    <Card
      title="Camera List"
      bordered={true}
      style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}

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
