import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap'; // Ensure you have react-bootstrap installed
import API from '../CustomHooks/MasterApiHooks/api';

const statusMapping = {
  0: 'Pending',
  1: 'Started',
  2: 'Completed',
};

const SelectMachineModal = ({ show, handleClose, data, processId,handleSave}) => {
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
      let existingTransactionData;
      if (data.transactionId) {
        const response = await API.get(`/Transactions/${data.transactionId}`);
        existingTransactionData = response.data;
      }

      const postData = {
        transactionId: data.transactionId || 0,
        interimQuantity: data.interimQuantity, // Adjust based on actual data
        remarks: existingTransactionData ? existingTransactionData.remarks : '',
        projectId: data.projectId,
        quantitysheetId: data.srNo || 0,
        processId: processId,
        zoneId: existingTransactionData ? existingTransactionData.machineId : 0, // Use the selected zone here
        machineId: machineId ,
        status: existingTransactionData ? existingTransactionData.status : 0,
        alarmId: existingTransactionData ? existingTransactionData.alarmId : "",
        lotNo: data.lotNo,
        teamId: existingTransactionData ? existingTransactionData.teamId : [],
        voiceRecording: existingTransactionData? existingTransactionData.voiceRecording : ""
      };

      if (data.transactionId) {
        await API.put(`/Transactions/${data.transactionId}`, postData);
      } else {
        await API.post('/Transactions', postData);
      }
      handleSave(machineId)
      handleClose();
    } catch (error) {
      console.error('Error updating interim quantity:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Select Machine</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {data ? (
          <>
            <div className="details mb-3 d-flex justify-content-between align-items-center">
              <div>
                <span className="fw-bold">Catch No </span>: {data.catchNumber}
              </div>
              <div>
                <span className="fw-bold">Status </span>:
                <span className={`fw-bold ${data.status === 0 ? 'text-danger' :
                  data.status === 1 ? 'text-primary' :
                  data.status === 2 ? 'text-success' : ''
                }`}>
                  {statusMapping[data.status]}
                </span>
              </div>
            </div>
            <div className='details mb-3 d-flex justify-content-between align-items-center'>
              <div>
                <span className='fw-bold'>Total Quantity: </span>
                <span>{data.quantity}</span>
              </div>
              <div>
                <span className='fw-bold'>Remaining Quantity: </span>
                <span>{data.quantity - data.interimQuantity}</span>
              </div>
            </div>
          </>
        ) : (
          <div>No data available</div>
        )}
        <Form.Group controlId="formZone">
          <Form.Label>Select Machine</Form.Label>
          <Form.Control
            as="select"
            value={selectedMachine}
            onChange={handleMachineChange}
          >
            <option value="">Select Machine</option>
            {machineOptions.map(option => (
              <option key={option.machineId} value={option.machineName}>{option.machineName}</option>
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
