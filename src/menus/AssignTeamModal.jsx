import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import themeStore from './../store/themeStore';
import { Modal, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import Select from 'react-select';
import API from '../CustomHooks/MasterApiHooks/api';

const AssignTeamModal = ({ show, handleClose, handleSave, data }) => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const [customDark, customMid, customLight, , customDarkText, customLightText] = getCssClasses();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.get('/users');
        setUsers(response.data.map(user => ({ value: user.id, label: user.name })));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const onSave = async (e) => {
    e.preventDefault();
    const teamToAssign = selectedUsers.map(user => user.value); // Get array of user IDs

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
          processId: row.processId,
          zoneId: existingTransactionData ? existingTransactionData.zoneId : 0,
          machineId: existingTransactionData ? existingTransactionData.machineId : 0,
          status: existingTransactionData ? existingTransactionData.status : 0,
          alarmId: existingTransactionData ? existingTransactionData.alarmId : "",
          lotNo: row.lotNo,
          teamId: teamToAssign,
          voiceRecording: existingTransactionData ? existingTransactionData.voiceRecording : ""
        };

        if (row.transactionId) {
          await API.put(`/Transactions/${row.transactionId}`, postData);
        } else {
          await API.post('/Transactions', postData);
        }
      });

      await Promise.all(updatePromises);
      handleSave(teamToAssign);
      handleClose();
    } catch (error) {
      console.error('Error updating team assignments:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className={customMid}>
        <Modal.Title className={customDarkText}>{t('assignTeam')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={customMid}>
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
        <Form onSubmit={onSave}>
          <Form.Group>
            <Select
              isMulti
              options={users}
              value={selectedUsers}
              onChange={setSelectedUsers}
              placeholder="Select team members"
              className={`${customLight} ${customDarkText} mb-3`}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className={customMid}>
        <Button 
          variant="primary"
          onClick={onSave}
          className={`${customDark} ${customLightText}`}
        >
          {t('save')}
        </Button>
        <Button 
          variant="secondary"
          onClick={handleClose}
          className={`${customDark} ${customLightText}`}
        >
          {t('cancel')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignTeamModal;