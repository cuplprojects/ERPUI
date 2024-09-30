import React, { useState } from 'react';
import { Table, Input, Button, message, Modal } from 'antd';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique IDs

const AlarmMaster = () => {
  const [alarms, setAlarms] = useState([]); // State to store alarm messages
  const [editingIndex, setEditingIndex] = useState(null); // Index of the alarm currently being edited
  const [editingValue, setEditingValue] = useState(''); // Current value being edited
  const [newAlarmMessage, setNewAlarmMessage] = useState(''); // State to handle new alarm input
  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
  const [errorMessage, setErrorMessage] = useState(''); // State to handle error messages

  const handleAddAlarm = () => {
    // Check if the new alarm message is empty
    if (!newAlarmMessage) {
      setErrorMessage('Please input an alarm message!'); // Show error message
      return;
    }

    // Check for numeric values in the alarm message
    if (/^\d+$/.test(newAlarmMessage)) {
      setErrorMessage('Numeric values are not allowed!'); // Show error message
      return;
    }

    // Check if the alarm message already exists
    const existingAlarm = alarms.find(alarm => alarm.alarmMessage.toLowerCase() === newAlarmMessage.toLowerCase());
    if (existingAlarm) {
      setErrorMessage('Alarm message already exists!'); // Show error message
      return;
    }

    const newAlarm = { id: uuidv4(), alarmMessage: newAlarmMessage };
    setAlarms([...alarms, newAlarm]); // Add the new alarm to the state
    setNewAlarmMessage(''); // Clear the input after adding
    setErrorMessage(''); // Clear any previous error messages
    setIsModalVisible(false); // Hide modal after adding
    message.success('Alarm added successfully!'); // Show success message
  };

  const handleEditStart = (index, alarm) => {
    setEditingIndex(index); // Set the index of the row being edited
    setEditingValue(alarm.alarmMessage); // Populate the input with the current alarm message
  };

  const handleEditSave = (index) => {
    if (!editingValue) return; // Prevent saving empty messages

    // Check if the new value already exists (excluding the current one)
    const existingAlarm = alarms.find(alarm => alarm.alarmMessage.toLowerCase() === editingValue.toLowerCase() && alarm.id !== alarms[index].id);
    if (existingAlarm) {
      message.error('Alarm message already exists!'); // Show error message
      return;
    }

    const updatedAlarms = [...alarms];
    updatedAlarms[index] = { ...updatedAlarms[index], alarmMessage: editingValue }; // Update the alarm message
    setAlarms(updatedAlarms); // Update the state with modified alarms
    message.success('Alarm updated successfully!'); // Show success message
    setEditingIndex(null); // Reset editing index
    setEditingValue(''); // Clear the editing value
  };

  const handleEditCancel = () => {
    setEditingIndex(null); // Reset editing index
    setEditingValue(''); // Clear the editing value
  };

  const showModal = () => {
    setIsModalVisible(true); // Show the modal
  };

  const handleOk = () => {
    setErrorMessage(''); // Clear previous error messages
    handleAddAlarm(); // Call function to add alarm
  };

  const handleCancel = () => {
    setIsModalVisible(false); // Hide modal
    setNewAlarmMessage(''); // Clear the input
    setErrorMessage(''); // Clear error message when modal is closed
  };

  const columns = [
    {
      title: 'SN.', // Serial Number Column
      dataIndex: 'serial',
      key: 'serial',
      render: (text, record, index) => index + 1, // Render the serial number based on the index
      width: '10%', // Set width for the serial number column
    },
    {
      title: 'Alarm Message',
      dataIndex: 'alarmMessage',
      key: 'alarmMessage',
      render: (text, record, index) => (
        editingIndex === index ? (
          <Input
            value={editingValue} // Display the editing value
            onChange={(e) => setEditingValue(e.target.value)} // Update editing value as user types
            onPressEnter={() => handleEditSave(index)} // Save on Enter
            onBlur={() => handleEditSave(index)} // Save on blur
          />
        ) : (
          text
        )
      ),
      width: '70%', // Set width for the alarm message column
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record, index) => (
        editingIndex === index ? (
          <>
            <Button type="link" onClick={() => handleEditSave(index)}>Save</Button>
            <Button type="link" onClick={handleEditCancel}>Cancel</Button>
          </>
        ) : (
          <Button type="link" onClick={() => handleEditStart(index, record)}>Edit</Button>
        )
      ),
      width: '20%', // Set width for the action column
    },
  ];

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', maxWidth: '600px', margin: 'auto' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Alarm Master</h2>

      {/* Container for button and table */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        {/* Add New Alarm button */}
        <Button type="primary" onClick={showModal}>Add New Alarm</Button>
      </div>

      <Table
        dataSource={alarms} // Directly use alarms as data source
        columns={columns}
        rowKey="id" // Use id as the unique key
        pagination={false}
        bordered // Make the table bordered
        size="small" // Set the table size to small
        style={{ marginTop: '20px' }} // Add some margin at the top of the table
      />

      {/* Modal for adding new alarms */}
      <Modal
        title="Add New Alarm"
        visible={isModalVisible}
        onCancel={handleCancel} // Close modal on cancel
        footer={null} // Disable default footer
      >
        <Input
          placeholder="Type an alarm message"
          value={newAlarmMessage} // Controlled input
          onChange={(e) => setNewAlarmMessage(e.target.value)} // Update state as user types
          onPressEnter={handleOk} // Add alarm on Enter
        />
        {errorMessage && <div style={{ color: 'red', marginTop: '8px' }}>{errorMessage}</div>} {/* Display error message */}
        <div style={{ textAlign: 'right', marginTop: '16px' }}>
          <Button onClick={handleCancel} style={{ marginRight: '8px' }}>Cancel</Button>
          <Button type="primary" onClick={handleOk}>Add</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AlarmMaster;
