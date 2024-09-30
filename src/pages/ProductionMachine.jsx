import React, { useState } from 'react';
import { Table, Button, Form, Input, Select, Switch, message, Modal } from 'antd';

const { Option } = Select;

const Machine = () => {
  const [machines, setMachines] = useState([]);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);

  const handleAddMachine = (values) => {
    const newMachine = { ...values, key: Date.now() }; // Generate a unique key
    setMachines([...machines, newMachine]);
    form.resetFields();
    setIsModalVisible(false);
    message.success('Machine added successfully!');
  };

  const handleEditMachine = (values) => {
    const updatedMachines = machines.map((machine) =>
      machine.key === editingMachine.key ? { ...editingMachine, ...values } : machine
    );
    setMachines(updatedMachines);
    form.resetFields();
    setIsModalVisible(false);
    message.success('Machine updated successfully!');
    setEditingMachine(null);
  };

  const openModal = (machine) => {
    setEditingMachine(machine);
    form.setFieldsValue(machine);
    setIsModalVisible(true);
  };

  const columns = [
    {
        title: 'SN.', // Serial Number Column
        dataIndex: 'serial',
        key: 'serial',
        render: (text, record, index) => index + 1, // Render the serial number based on the index
      },
    { title: 'Machine Name', dataIndex: 'machineName', key: 'machineName' },
    { title: 'Machine Type', dataIndex: 'machineType', key: 'machineType' },
    { title: 'Specifications', dataIndex: 'machineSpecification', key: 'machineSpecification' },
    { title: 'Machine Zone', dataIndex: 'machineZone', key: 'machineZone' },
    { title: 'Department/Process/Division', dataIndex: 'machineDepartment', key: 'machineDepartment' },
    { title: 'Status', dataIndex: 'machineStatus', key: 'machineStatus', render: (status) => (
      <Switch checked={status === 'Operational'} checkedChildren="Operational" unCheckedChildren="Not Operational" />
    ) },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, machine) => (
        <Button type="link" onClick={() => openModal(machine)}>Edit</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ marginBottom: '20px' }}>Production Machines</h2>
      <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ marginBottom: '20px' }}>
        Add
      </Button>

      <Table
        dataSource={machines.map((machines, index) => ({ ...machines, serial: index + 1 }))} 
        columns={columns}
        rowKey="key"
        pagination={false}
        bordered
        style={{ marginTop: '20px' }}
      />

      <Modal
        title={editingMachine ? 'Edit Machine' : 'Add Machine'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={editingMachine ? handleEditMachine : handleAddMachine} layout="vertical">
          <Form.Item name="machineName" label="Machine Name" rules={[{ required: true, message: 'Please input Machine Name!' }]}>
            <Input placeholder="Enter Machine Name" />
          </Form.Item>
          <Form.Item name="machineType" label="Machine Type" rules={[{ required: true, message: 'Please select Machine Type!' }]}>
            <Select placeholder="Select Machine Type">
              <Option value="Offset Printing">Offset Printing</Option>
              <Option value="CTP">CTP</Option>
              <Option value="Digital Printing">Digital Printing</Option>
            </Select>
          </Form.Item>
          <Form.Item name="machineSpecification" label="Machine Specification" rules={[{ required: true, message: 'Please input Machine Specification!' }]}>
            <Input placeholder="Enter Specifications (e.g., Booklet - 16, Paper 16)" />
          </Form.Item>
          <Form.Item name="machineZone" label="Machine Zone" rules={[{ required: true, message: 'Please input Machine Zone!' }]}>
            <Input placeholder="Enter Machine Zone" />
          </Form.Item>
          <Form.Item name="machineDepartment" label="Department/Process/Division" rules={[{ required: true, message: 'Please input Department/Process/Division!' }]}>
            <Input placeholder="Enter Department/Process/Division" />
          </Form.Item>
          <Form.Item name="machineStatus" label="Machine Status" valuePropName="checked">
            <Switch checkedChildren="Operational" unCheckedChildren="Not Operational" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingMachine ? 'Update Machine' : 'Add Machine'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Machine;
