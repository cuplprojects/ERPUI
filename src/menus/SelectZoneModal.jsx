import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap'; // Ensure you have react-bootstrap installed
import API from '../CustomHooks/MasterApiHooks/api';

const statusMapping = {
  0: 'Pending',
  1: 'Started',
  2: 'Completed',
};

const SelectZoneModal = ({ show, handleClose, data, processId, handleSave }) => {
  const [selectedZone, setSelectedZone] = useState('');
  const [zoneOptions, setZoneOptions] = useState([]);
  const [zoneId, setZoneId] = useState(null);

  const handleZoneChange = (e) => {
    const selectedOption = zoneOptions.find(option => option.zoneNo === e.target.value);
    setSelectedZone(selectedOption ? selectedOption.zoneNo : '');
    setZoneId(selectedOption ? selectedOption.zoneId : null);
  };

  const getZone = async () => {
    try {
      const response = await API.get('/Zones'); // Adjust endpoint as necessary
      setZoneOptions(response.data); // Set zone options from API response
    } catch (error) {
      console.error("Failed to fetch zone options", error);
    }
  };

  useEffect(() => {
    getZone();
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
          zoneId: zoneId,
          machineId: existingTransactionData ? existingTransactionData.machineId : 0,
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
      handleSave(zoneId);
      handleClose();
    } catch (error) {
      console.error('Error updating zone:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Select Zone</Modal.Title>
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
        <Form.Group controlId="formZone">
          <Form.Label>Select Zone</Form.Label>
          <Form.Control
            as="select"
            value={selectedZone}
            onChange={handleZoneChange}
          >
            <option value="">Select Zone</option>
            {zoneOptions.map(option => (
              <option key={option.zoneId} value={option.zoneNo}>
                {option.zoneNo}
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

export default SelectZoneModal;