import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Switch, message, Modal, Spin } from 'antd';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // Importing uuid for unique IDs
import API from '../CustomHooks/MasterApiHooks/api';


const Machine = () => {
  const [machines, setMachines] = useState([]);
  const [newMachineName, setNewMachineName] = useState('');
  const [newMachineProcessId, setNewMachineProcessId] = useState(null);
  const [newMachineStatus, setNewMachineStatus] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingProcessId, setEditingProcessId] = useState(null);
  const [editingStatus, setEditingStatus] = useState(true);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const fetchMachines = async () => {
    setLoading(true);
    try {
      const response = await API.get('/Machines');
      setMachines(response.data);
    } catch (error) {
      console.error("Failed to fetch machines", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProcesses = async () => {
    setLoading(true);
    try {
      const response = await API.get('/Processes');
      setProcesses(response.data);
    } catch (error) {
      console.error("Failed to fetch processes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
    fetchProcesses();
  }, []);

  const handleAddMachine = async () => {
    if (!newMachineName || !newMachineProcessId) {
      message.error('Please fill in all fields!');
      return;
    }

    const newMachine = {
      machineId: uuidv4(),
      machineName: newMachineName,
      status: newMachineStatus,
      processId: newMachineProcessId
    };

    try {
      await axios.post(API_URL, newMachine);
      setMachines([...machines, newMachine]);
      setNewMachineName('');
      setNewMachineProcessId(null);
      setNewMachineStatus(true);
      setIsModalVisible(false);
      message.success('Machine added successfully!');
    } catch (error) {
      console.error("Failed to add machine", error);
      message.error('Failed to add machine');
    }
  };

  const handleEditSave = async (index) => {
    if (!editingValue || !editingProcessId) {
      message.error('Please fill in all fields!');
      return;
    }

    const updatedMachine = {
      ...machines[index],
      machineName: editingValue,
      processId: editingProcessId,
      status: editingStatus,
    };

    try {
      await axios.put(`${API_URL}/${updatedMachine.machineId}`, updatedMachine);
      const updatedMachines = [...machines];
      updatedMachines[index] = updatedMachine;
      setMachines(updatedMachines);
      message.success('Machine updated successfully!');
      setEditingIndex(null);
      setEditingValue('');
      setEditingProcessId(null);
      setEditingStatus(true);
    } catch (error) {
      console.error("Failed to update machine", error);
      message.error('Failed to update machine');
    }
  };

  const columns = [
    {
      title: 'SN.',
      dataIndex: 'serial',
      key: 'serial',
      render: (_, __, index) => index + 1,
      width: '10%',
    },
    {
      title: 'Machine Name',
      dataIndex: 'machineName',
      key: 'machineName',
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
      width: '30%',
    },
    {
      title: 'Process',
      dataIndex: 'processId',
      key: 'processId',
      render: (text, record, index) => (
        editingIndex === index ? (
          <Select
            value={editingProcessId}
            onChange={setEditingProcessId}
            style={{ width: '100%' }}
          >
            {processes.map(process => (
              <Select.Option key={process.id} value={process.id}>
                {process.name}
              </Select.Option>
            ))}
          </Select>
        ) : (
          <span>{record.processName}</span>
        )
      ),
      width: '30%',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record, index) => (
        editingIndex === index ? (
          <Switch
            checked={editingStatus}
            onChange={setEditingStatus}
          />
        ) : (
          <Switch checked={status} checkedChildren="Operational" unCheckedChildren="Not Operational" disabled />
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
            <Button type="link" onClick={() => setEditingIndex(null)}>Cancel</Button>
          </>
        ) : (
          <Button type="link" onClick={() => {
            setEditingIndex(index);
            setEditingValue(record.machineName);
            setEditingProcessId(record.processId);
            setEditingStatus(record.status);
          }}>Edit</Button>
        )
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ marginBottom: '20px' }}>Production Machines</h2>
      <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ marginBottom: '20px' }}>
        Add Machine
      </Button>

      {loading ? (
        <Spin />
      ) : (
        <Table
          dataSource={machines}
          columns={columns}
          rowKey="machineId"
          pagination={false}
          bordered
          style={{ marginTop: '20px' }}
        />
      )}

      <Modal
        title="Add Machine"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Input
          placeholder="Enter Machine Name"
          value={newMachineName}
          onChange={(e) => setNewMachineName(e.target.value)}
        />
        <Select
          placeholder="Select Process"
          value={newMachineProcessId}
          onChange={setNewMachineProcessId}
          style={{ marginTop: '10px', marginBottom: '10px', width: '100%' }}
        >
          {processes.map(process => (
            <Select.Option key={process.id} value={process.id}>
              {process.name}
            </Select.Option>
          ))}
        </Select>
        <Switch
          checked={newMachineStatus}
          checkedChildren="Operational"
          unCheckedChildren="Not Operational"
          onChange={setNewMachineStatus}
          style={{ marginBottom: '10px' }}
        />
        <div style={{ textAlign: 'right', marginTop: '16px' }}>
          <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: '8px' }}>Cancel</Button>
          <Button type="primary" onClick={handleAddMachine}>Add</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Machine;
