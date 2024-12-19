import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import API from '../CustomHooks/MasterApiHooks/api';
import { useStore } from 'zustand';
import themeStore from '../store/themeStore';
import { useTranslation } from 'react-i18next';

const SelectZoneModal = ({ show, handleClose, data, processId, handleSave }) => {
  const { t } = useTranslation();
  const themeState = useStore(themeStore);
  const cssClasses = themeState.getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText] = cssClasses;

  // Force re-render when theme changes
  useEffect(() => {
    // This empty dependency array ensures cssClasses are always fresh
  }, [cssClasses]);

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
      const response = await API.get('/Zones');
      setZoneOptions(response.data);
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

        await API.post('/Transactions', postData);
      });

      await Promise.all(updatePromises);
      handleSave(zoneId);
      setSelectedZone()
      setZoneId()
      handleClose();
    } catch (error) {
      console.error('Error updating zone:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton className={`${customDark} ${customDarkText}`}>
        <Modal.Title className={customLightText}>{t('selectZone')}</Modal.Title>
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
        <Form.Group controlId="formZone">
          <Form.Label>{t('selectZone')}</Form.Label>
          <Form.Control
            as="select"
            value={selectedZone}
            onChange={handleZoneChange}
            className={` ${customDarkText}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              }
            }}
          >
            <option value="">{t('selectZone')}</option>
            {zoneOptions.map(option => (
              <option key={option.zoneId} value={option.zoneNo}>
                {option.zoneNo}
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

export default SelectZoneModal;