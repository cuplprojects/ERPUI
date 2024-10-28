import React, { useEffect, useState } from 'react';
import { Table, Input, Button, message, Modal, Spin } from 'antd';
import { v4 as uuidv4 } from 'uuid'; 
import API from '../CustomHooks/MasterApiHooks/api';
import { hasPermission } from '../CustomHooks/Services/permissionUtils';

const AlarmMaster = () => {
  const [alarms, setAlarms] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [newAlarmMessage, setNewAlarmMessage] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const canaddalarm = hasPermission('2.8.1');
  const caneditalarm = hasPermission('2.8.3');


  const fetchAlarms = async () => {
    setLoading(true);
    try {
      const response = await API.get('/Alarms');
      setAlarms(response.data);
    } catch (error) {
      console.error('Failed to fetch alarms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlarms();
  }, []);

  const handleAddAlarm = async () => {
    if (!newAlarmMessage) {
      setErrorMessage('Please input an alarm message!');
      return;
    }

    if (/^\d+$/.test(newAlarmMessage)) {
      setErrorMessage('Numeric values are not allowed!');
      return;
    }

    const existingAlarm = alarms.find(alarm => alarm.message.toLowerCase() === newAlarmMessage.toLowerCase());
    if (existingAlarm) {
      setErrorMessage('Alarm message already exists!');
      return;
    }

    const newAlarm = { alarmId: 0, message: newAlarmMessage }; // Updated for new structure
    
    setAlarms([...alarms, { ...newAlarm, alarmId: uuidv4() }]);
    setNewAlarmMessage('');
    setIsModalVisible(false);
    message.success('Alarm added successfully!');

    try {
      await API.post('/Alarms', newAlarm);
    } catch (error) {
      message.error('Failed to add alarm');
      setAlarms(prev => prev.filter(alarm => alarm.alarmId !== newAlarm.alarmId)); // Revert optimistic update
    }
  };

  const handleEditSave = async (index) => {
    if (!editingValue) return;

    const existingAlarm = alarms.find(alarm =>
      alarm.message.toLowerCase() === editingValue.toLowerCase() && alarm.alarmId !== alarms[index].alarmId
    );

    if (existingAlarm) {
      message.error('Alarm message already exists!');
      return;
    }

    const updatedAlarm = { ...alarms[index], message: editingValue };

    setAlarms(prev => {
      const newAlarms = [...prev];
      newAlarms[index] = updatedAlarm;
      return newAlarms;
    });

    message.success('Alarm updated successfully!');
    setEditingIndex(null);
    setEditingValue('');

    try {
      await API.put(`/Alarms/${alarms[index].alarmId}`, updatedAlarm);
    } catch (error) {
      message.error('Failed to update alarm');
      fetchAlarms(); // Refresh alarms to get the latest data
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
      title: 'Alarm Message',
      dataIndex: 'message',
      key: 'message',
      render: (text, record, index) => (
        editingIndex === index ? (
          <Input
            key={`editing-input-${record.alarmId}`} // Unique key for editing input
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onPressEnter={() => handleEditSave(index)}
          />
        ) : (
          <span key={`message-${record.alarmId}`}>{text}</span> // Unique key for message span
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
            <Button type="primary" onClick={() => handleEditSave(index)}>Save</Button>
            <Button type="link" onClick={() => setEditingIndex(null)}>Cancel</Button>
          </>
        ) : (
          <Button 
            type="primary" 
            onClick={() => { setEditingIndex(index); setEditingValue(record.message); }}
            disabled={!caneditalarm}
          >
            Edit
          </Button>
        )
      ),
      width: '20%',
    },
  ];
  

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Alarm Master</h2>
      {canaddalarm && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>Add New Alarm</Button>
        </div>
      )}

      {loading ? (
        <Spin />
      ) : (
        <Table
          dataSource={alarms}
          columns={columns}
          rowKey="alarmId"
          pagination={false}
          bordered
          size="small"
          style={{ marginTop: '20px' }}
        />
      )}

      <Modal
        title="Add New Alarm"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Input
          placeholder="Type an alarm message"
          value={newAlarmMessage}
          onChange={(e) => setNewAlarmMessage(e.target.value)}
          onPressEnter={handleAddAlarm}
        />
        {errorMessage && <div style={{ color: 'red', marginTop: '8px' }}>{errorMessage}</div>}
        <div style={{ textAlign: 'right', marginTop: '16px' }}>
          <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: '8px' }}>Cancel</Button>
          <Button type="primary" onClick={handleAddAlarm}>Add</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AlarmMaster;
