import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import themeStore from './../store/themeStore';
import { Modal, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import Select from 'react-select';
import API from '../CustomHooks/MasterApiHooks/api';
import AssignTeams from '../pages/processPage/AssignTeam/AssignTeams';

const AssignTeamModal = ({ show, handleClose, data , processId , fetchTransactions, onSuccess, onError }) => {
  console.log(data)
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const [customDark, customMid, customDarkText, customLightText] = getCssClasses();

  const handleSave = async () => {
    try {
      const promises = data.map(async (row) => {
        const postData = {
          transactionId: row.transactionId || 0,
          interimQuantity: row.interimQuantity || 0,
          remarks: row.remarks || "",
          projectId: row.projectId,
          quantitysheetId: row.srNo,
          processId: processId,
          zoneId: row.zoneId || 0,
          machineId: row.machineId || 0,
          status: row.status || 0,
          alarmId: row.alarmId || "",
          teamId: selectedTeams,
          lotNo: row.lotNo,
          voiceRecording: row.voiceRecording || ""
        };

        await API.post("/Transactions", postData);
      });

      await Promise.all(promises);
      await fetchTransactions();
      onSuccess();
      handleClose();
    } catch (error) {
      onError(error);
      console.error('Error assigning team:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className='custom-modal'>
      <Modal.Header closeButton className={customMid}>
        <Modal.Title className={customDarkText}>{t('assignTeam')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={customMid}>
        <AssignTeams processId={processId} data={data} handleClose={handleClose} fetchTransactions={fetchTransactions}/>
      </Modal.Body>
      <Modal.Footer className={customMid}>
      </Modal.Footer>
      <style>{`
    .custom-modal .modal-dialog {
      max-width: 50%; /* Adjust width as needed */
    }
  
    @media (max-width: 768px) {
      .custom-modal .modal-dialog {
        max-width: 90%; /* Smaller width on mobile screens */
      }
    }
  `}</style>
    </Modal>
  );
};

export default AssignTeamModal;