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
  const [individualTeams, setIndividualTeams] = useState({});
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

  if (!show) return null;

  const onSave = (e) => {
    e.preventDefault();
    const teamToAssign = selectedUsers.map(user => user.label).join(', ');
    if (data.length === 1) {
      handleSave(teamToAssign);
    } else {
      const teamsToAssign = {};
      data.forEach(row => {
        teamsToAssign[row.catchNumber] = individualTeams[row.catchNumber] || teamToAssign;
      });
      handleSave(teamsToAssign);
    }
    handleClose();
  };

  const handleUserSelect = (selectedOptions) => {
    setSelectedUsers(selectedOptions);
  };

  const handleRemoveUser = (userToRemove) => {
    setSelectedUsers(selectedUsers.filter(user => user.value !== userToRemove.value));
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className={customMid}>
        <Modal.Title className={customDarkText}>{t('assignTeam')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={customMid}>
        <p>{`Assigning team to ${data.length} selected row(s)`}</p>
        <Form onSubmit={onSave}>
          <Form.Group>
            <Select
              isMulti
              options={users}
              value={selectedUsers}
              onChange={handleUserSelect}
              placeholder="Select team members"
              className={`${customLight} ${customDarkText} mb-3`}
            />
            <div>
              {selectedUsers.map(user => (
                <Badge 
                  key={user.value} 
                  className={`${customDark} ${customLightText} me-2 mb-2`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRemoveUser(user)}
                >
                  {user.label} ×
                </Badge>
              ))}
            </div>
          </Form.Group>
          {data.length > 1 && (
            <>
              <p className="mt-3">Or assign individual teams:</p>
              {data.map(row => (
                <Form.Group key={row.catchNumber}>
                  <Row className="align-items-center mb-2">
                    <Col xs={12} sm={4}>
                      <Form.Label>{row.catchNumber}:</Form.Label>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Select
                        isMulti
                        options={users}
                        value={individualTeams[row.catchNumber] || []}
                        onChange={(selectedOptions) => setIndividualTeams({...individualTeams, [row.catchNumber]: selectedOptions})}
                        placeholder="Select team members"
                        className={`${customLight} ${customDarkText}`}
                      />
                    </Col>
                  </Row>
                </Form.Group>
              ))}
            </>
          )}
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