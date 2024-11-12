import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import API from '../CustomHooks/MasterApiHooks/api';
import { useStore } from 'zustand';
import themeStore from '../store/themeStore';
import { useTranslation } from 'react-i18next';


const SelectMachineModal = ({ show, handleClose, data, processId, handleSave }) => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = useMemo(() => getCssClasses(), [getCssClasses]);
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText] = cssClasses;

const statusMapping = {
  0: t('pending'),
  1: t('started'), 
  2: t('completed'),
};
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

        console.log(row)
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

        await API.post('/Transactions', postData);
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
      <Modal.Header closeButton className={`${customDark} ${customDarkText}`}>
        <Modal.Title className={customLightText}>{t('selectMachine')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={`${customLight} ${customDarkText}`}>
        {Array.isArray(data) && data.length > 0 ? (
          <>
            <div className="mb-3">
              <span className="fw-bold">{t('selectedCatches')}: </span>
              {data.map(row => row.catchNumber).join(', ')}
            </div>
            <div className='mb-3'>
              <span className='fw-bold'>{t('totalItems')}: </span>
              {data.length}
            </div>
          </>
        ) : (
          <div>{t('noDataAvailable')}</div>
        )}
        <Form.Group controlId="formMachine">
          <Form.Label>{t('selectMachine')}</Form.Label>
          <Form.Control
            as="select"
            value={selectedMachine}
            onChange={handleMachineChange}
            className={` ${customDarkText}`}
          >
            <option value="">{t('selectMachine')}</option>
            {machineOptions.map(option => (
              <option key={option.machineId} value={option.machineName}>
                {option.machineName}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className={`${customLight} ${customDarkText}`}>
        <Button 
          variant="danger" 
          onClick={handleClose}
          className={`${customBtn} border-0`}
        >
          {t('close')}
        </Button>
        <Button 
          onClick={handleConfirm}
          className={`${customBtn} border-0`}
        >
          {t('saveChanges')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SelectMachineModal;
