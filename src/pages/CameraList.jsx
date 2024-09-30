import React, { useState } from 'react';
import { Table, Button, Modal, Input, Form, Card, Row, Col } from 'antd';

const CameraList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      setCameras([...cameras, { key: cameras.length + 1, name: values.cameraName }]);
      form.resetFields();
      setIsModalOpen(false);
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: 'Camera ID',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Camera Name',
      dataIndex: 'name',
      key: 'name',
    },
  ];

  return (
    <Card
      title="Camera List"
      bordered={true}
      style={{ width: '400px', margin: '0 auto', padding: '20px' }} // Adjusted size of the card
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
        dataSource={cameras}
        pagination={false}
        style={{ marginBottom: '20px' }}
        size="small" // Reduced the size of the table rows
      />

      <Modal
        title="Add New Camera"
        visible={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={300} // Set the width of the modal
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="cameraName"
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
