import React, { useEffect, useState } from 'react';
import { Table, Input, Button, message, Modal, Spin } from 'antd';
import { v4 as uuidv4 } from 'uuid'; 
import API from '../CustomHooks/MasterApiHooks/api';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import themeStore from '../store/themeStore';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { FaSearch } from 'react-icons/fa';

const AlarmMaster = () => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
  const [alarms, setAlarms] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [newAlarmMessage, setNewAlarmMessage] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

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

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredAlarms = alarms.filter(alarm =>
    alarm.message.toLowerCase().includes(searchText.toLowerCase()) ||
    alarm.alarmId.toString().includes(searchText)
  );

  const columns = [
    {
      title: t('srNo'),
      dataIndex: 'serial',
      key: 'serial',
      render: (_, __, index) => index + 1,
      width: '10%',
      sorter: (a, b) => a.alarmId - b.alarmId
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
      sorter: (a, b) => a.message.localeCompare(b.message)
    },
    {
      title: t('action'),
      key: 'action', 
      render: (_, record, index) => (
        editingIndex === index ? (
          <div className="d-flex justify-content-start gap-2">
            <Button 
              className={`${customBtn} d-flex align-items-center justify-content-center`}
              onClick={() => handleEditSave(index)}
              icon={<SaveOutlined />}
            >
              {t('save')}
            </Button>
            <Button 
              onClick={() => setEditingIndex(null)}
              className={`${customDark === "dark-dark" ? `${customLightBorder} text-white` : ''}`}
              icon={<CloseOutlined />}
            >
              {t('cancel')}
            </Button>
          </div>
        ) : (
          <div className="d-flex justify-content-start">
            <Button 
              className={`${customBtn} d-flex align-items-center justify-content-center`}
              onClick={() => { setEditingIndex(index); setEditingValue(record.message); }}
              icon={<EditOutlined />}
            >
              {t('edit')}
            </Button>
          </div>
        )
      ),
      width: '20%',
    },
  ];

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>{t('alarmMaster')}</h2>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button type="primary" onClick={() => setIsModalVisible(true)} className={`${customBtn} d-flex align-items-center justify-content-center gap-2 custom-zoom-btn`}>{t('addNewAlarm')}</Button>
        <div className="d-flex align-items-center" style={{ width: '300px' }}>
          <Input
            placeholder={t('searchAlarms')}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            className={`rounded-2 ${customDark === "dark-dark" ? `${customLightBorder} text-dark` : customDarkText} ${customDarkBorder} rounded-end-0`}
          />
          <Button
            className={`rounded-2 ${customBtn} ${customDark === "dark-dark" ? 'border-white' : 'border-0'} rounded-start-0`}
            style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <FaSearch size={20}/>
          </Button>
        </div>
      </div>

      {loading ? (
        <Spin />
      ) : (
        <Table
          dataSource={filteredAlarms}
          columns={columns}
          rowKey="alarmId"
          pagination={false}
          bordered
          size="small"
          style={{ marginTop: '20px' }}
          className={`${customDark === "default-dark" ? "thead-default" : ""}
                ${customDark === "red-dark" ? "thead-red" : ""}
                ${customDark === "green-dark" ? "thead-green" : ""}
                ${customDark === "blue-dark" ? "thead-blue" : ""}
                ${customDark === "dark-dark" ? "thead-dark" : ""}
                ${customDark === "pink-dark" ? "thead-pink" : ""}
                ${customDark === "purple-dark" ? "thead-purple" : ""}
                ${customDark === "light-dark" ? "thead-light" : ""}
                ${customDark === "brown-dark" ? "thead-brown" : ""} custom-pagination`}
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
