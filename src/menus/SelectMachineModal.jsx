import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap'; // Ensure you have react-bootstrap installed
import API from '../CustomHooks/MasterApiHooks/api';

const statusMapping = {
  0: 'Pending',
  1: 'Started',
  2: 'Completed',
};

const SelectMachineModal = ({ show, handleClose, data, processId, handleSave }) => {
  const [selectedMachine, setSelectedMachine] = useState('');
  const [machineOptions, setMachineOptions] = useState([]);
  const [machineId, setMachineId] = useState(null);

  const handleMachineChange = (e) => {
    const selectedOption = machineOptions.find(option => option.machineName === e.target.value);
    setSelectedMachine(selectedOption ? selectedOption.machineName : '');
    setMachineId(selectedOption ? selectedOption.machineId : null);
  };

  const getMachine = async () => {
    try {
      const response = await API.get('/Machines'); // Adjust endpoint as necessary
      setMachineOptions(response.data); // Set zone options from API response
    } catch (error) {
      console.error("Failed to fetch zone options", error);
    }
  };

  useEffect(() => {
    getMachine();
  }, []); 

  const handleConfirm = async () => {
    try {
      const updatePromises = data.map(async (row) => {
        let existingTransactionData;
        if (row.transactionId) {
          const response = await API.get(`/Transactions/${row.transactionId}`);
          existingTransactionData = response.data;
        }


        const postData = {
          transactionId: row.transactionId || 0,
          interimQuantity: row.interimQuantity,
          remarks: existingTransactionData ? existingTransactionData.remarks : '',
          projectId: row.projectId,
          quantitysheetId: row.srNo || 0,
          processId: processId,
          zoneId: existingTransactionData ? existingTransactionData.zoneId : 0,
          machineId: machineId,
          status: existingTransactionData ? existingTransactionData.status : 0,
          alarmId: existingTransactionData ? existingTransactionData.alarmId : "",
          lotNo: row.lotNo,
          teamId: existingTransactionData ? existingTransactionData.teamId : [],
          voiceRecording: existingTransactionData ? existingTransactionData.voiceRecording : ""
        };


        if (row.transactionId) {
          await API.put(`/Transactions/${row.transactionId}`, postData);
        } else {
          await API.post('/Transactions', postData);
        }
      });

      await Promise.all(updatePromises);
      handleSave(machineId);
      handleClose();
    } catch (error) {
      console.error('Error updating machine:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Select Machine</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {Array.isArray(data) && data.length > 0 ? (
          <>
            <div className="mb-3">
              <span className="fw-bold">Selected Catches: </span>
              {data.map(row => row.catchNumber).join(', ')}
            </div>
            <div className='mb-3'>
              <span className='fw-bold'>Total Items: </span>
              {data.length}
            </div>
          </>
        ) : (
          <div>No data available</div>
        )}
        <Form.Group controlId="formMachine">
          <Form.Label>Select Machine</Form.Label>
          <Form.Control
            as="select"
            value={selectedMachine}
            onChange={handleMachineChange}
          >
            <option value="">Select Machine</option>
            {machineOptions.map(option => (
              <option key={option.machineId} value={option.machineName}>
                {option.machineName}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleClose}>
          Close
        </Button>
        <Button className='custom-theme-dark-btn' onClick={handleConfirm}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SelectMachineModal;
