import React, { useState } from 'react';
import { Form, Input, Button, Table, Card, Divider, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

const AddMachine = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: 'Machine ID',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Machine Type',
      dataIndex: 'machineType',
      key: 'machineType',
      align: 'center',
    },
  ];

  const onFinish = (values) => {
    const { machineType } = values;

    // Alphanumeric validation - must contain at least one letter and can contain numbers
    const alphanumericRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(machineType)) {
      message.error('Machine type must contain at least one letter and only alphanumeric characters!');
      return;
    }

    // Check for duplicate entries
    const existingMachine = machines.find(
      (machine) => machine.machineType.toLowerCase() === machineType.toLowerCase()
    );

    if (existingMachine) {
      message.error('Machine type already exists!');
      return;
    }

    // Add the machine if no duplicate and valid input
    const newMachine = {
      id: machines.length + 1,
      machineType: machineType,
    };
    setMachines([...machines, newMachine]);
    message.success('Machine added successfully!');

    // Simulate loading to prevent double-click
    setLoading(true);
    setTimeout(() => setLoading(false), 500); // Re-enable the button after 500ms
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        backgroundColor: '#f0f2f5',
        padding: '20px',
      }}
    >
      <Card
        title="Add New Machine"
        bordered={false}
        style={{
          width: '100%',
          maxWidth: '600px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
        }}
      >
        {/* Form for adding new machines */}
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Machine Type"
            name="machineType"
            rules={[{ required: true, message: 'Please input the machine type!' }]}
            style={{ marginBottom: '20px' }}
          >
            <Input placeholder="Enter machine type" size="large" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              icon={<PlusCircleOutlined />}
              style={{
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
                borderRadius: '6px',
                fontWeight: 'bold',
              }}
              disabled={loading} // Disable button when loading
            >
              {loading ? 'Adding...' : 'Add Machine'}
            </Button>
          </Form.Item>
        </Form>

        <Divider>Added Machines</Divider>

        {/* Table to display added machines */}
        <Table
          dataSource={machines}
          columns={columns}
          rowKey="id"
          pagination={false}
          style={{ marginTop: '20px' }}
          bordered
          size="large"
          rowClassName={(record, index) =>
            index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
          }
        />
      </Card>

      <style jsx>{`
        .table-row-light {
          background-color: #fafafa;
        }
        .table-row-dark {
          background-color: #f5f5f5;
        }
      `}</style>
    </div>
  );
};

export default AddMachine;
