import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import themeStore from './../store/themeStore';
import { Modal, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import Select from 'react-select';
import API from '../CustomHooks/MasterApiHooks/api';
import AssignTeams from '../pages/processPage/AssignTeam/AssignTeams';

const AssignTeamModal = ({ show, handleClose, handleSave, data , processId }) => {
  console.log(data)
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const [customDark, customMid, customLight, , customDarkText, customLightText] = getCssClasses();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);

  if (!show) return null;

  const onSave = (e) => {
    e.preventDefault();
    const teamToAssign = selectedUsers.map(user => user.label).join(', ');
    if (data?.length === 1) {
      handleSave(teamToAssign);
    } else {
      const teamsToAssign = {};
      data?.forEach(row => {
        teamsToAssign[row.catchNumber] = individualTeams[row.catchNumber] || teamToAssign;
      });
      handleSave(teamsToAssign);
    }
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered className='custom-modal'>
      <Modal.Header closeButton className={customMid}>
        <Modal.Title className={customDarkText}>{t('assignTeam')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={customMid}>
        <AssignTeams processId={processId} data={data} handleClose={handleClose} handleSave={handleSave}/>
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