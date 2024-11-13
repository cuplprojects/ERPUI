import React, { useEffect, useState } from 'react';
import { Table, Input, Button, message, Modal, Spin } from 'antd';
import { v4 as uuidv4 } from 'uuid'; 
import API from '../CustomHooks/MasterApiHooks/api';
import { useTranslation } from 'react-i18next';

const AlarmMaster = () => {
  const { t } = useTranslation();
  const [alarms, setAlarms] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [newAlarmMessage, setNewAlarmMessage] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
      setErrorMessage(t('pleaseInputAlarmMessage'));
      return;
    }

    if (/^\d+$/.test(newAlarmMessage)) {
      setErrorMessage(t('numericValuesNotAllowed'));
      return;
    }

    const existingAlarm = alarms.find(alarm => alarm.message.toLowerCase() === newAlarmMessage.toLowerCase());
    if (existingAlarm) {
      setErrorMessage(t('alarmMessageExists'));
      return;
    }

    const newAlarm = { alarmId: 0, message: newAlarmMessage };
    
    setAlarms([...alarms, { ...newAlarm, alarmId: uuidv4() }]);
    setNewAlarmMessage('');
    setIsModalVisible(false);
    message.success(t('alarmAddedSuccess'));

    try {
      await API.post('/Alarms', newAlarm);
      fetchAlarms();
    } catch (error) {
      message.error(t('failedToAddAlarm'));
      setAlarms(prev => prev.filter(alarm => alarm.alarmId !== newAlarm.alarmId));
    }
  };

  const handleEditSave = async (index) => {
    if (!editingValue) return;

    const existingAlarm = alarms.find(alarm =>
      alarm.message.toLowerCase() === editingValue.toLowerCase() && alarm.alarmId !== alarms[index].alarmId
    );

    if (existingAlarm) {
      message.error(t('alarmMessageExists'));
      return;
    }

    const updatedAlarm = { ...alarms[index], message: editingValue };

    setAlarms(prev => {
      const newAlarms = [...prev];
      newAlarms[index] = updatedAlarm;
      return newAlarms;
    });

    message.success(t('alarmUpdatedSuccess'));
    setEditingIndex(null);
    setEditingValue('');

    try {
      await API.put(`/Alarms/${alarms[index].alarmId}`, updatedAlarm);
    } catch (error) {
      message.error(t('failedToUpdateAlarm'));
      fetchAlarms();
    }
  };

  const columns = [
    {
      title: t('srNo'),
      dataIndex: 'serial',
      key: 'serial',
      render: (_, __, index) => index + 1,
      width: '10%',
    },
    {
      title: t('alarmMessage'),
      dataIndex: 'message',
      key: 'message',
      render: (text, record, index) => (
        editingIndex === index ? (
          <Input
            key={`editing-input-${record.alarmId}`}
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onPressEnter={() => handleEditSave(index)}
            onBlur={() => handleEditSave(index)}
          />
        ) : (
          <span key={`message-${record.alarmId}`}>{text}</span>
        )
      ),
      width: '70%',
    },
    {
      title: t('action'),
      key: 'action',
      render: (_, record, index) => (
        editingIndex === index ? (
          <>
            <Button type="link" onClick={() => handleEditSave(index)}>{t('save')}</Button>
            <Button type="link" onClick={() => setEditingIndex(null)}>{t('cancel')}</Button>
          </>
        ) : (
          <Button type="link" onClick={() => { setEditingIndex(index); setEditingValue(record.message); }}>{t('edit')}</Button>
        )
      ),
      width: '20%',
    },
  ];
  

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>{t('alarmMaster')}</h2>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>{t('addNewAlarm')}</Button>
      </div>

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
        title={t('addNewAlarm')}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Input
          placeholder={t('typeAlarmMessage')}
          value={newAlarmMessage}
          onChange={(e) => setNewAlarmMessage(e.target.value)}
          onPressEnter={handleAddAlarm}
        />
        {errorMessage && <div style={{ color: 'red', marginTop: '8px' }}>{errorMessage}</div>}
        <div style={{ textAlign: 'right', marginTop: '16px' }}>
          <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: '8px' }}>{t('cancel')}</Button>
          <Button type="primary" onClick={handleAddAlarm}>{t('add')}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AlarmMaster;
