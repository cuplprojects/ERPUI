import React, { useState, useEffect } from 'react';
import { Form, Button, Modal, Alert } from 'react-bootstrap';
import Select from 'react-select';
import teamsService from '../../../../CustomHooks/ApiServices/teamsService';
import { fetchUsers } from '../../../../CustomHooks/ApiServices/userService';
import useUserDataStore from '../../../../store/userDataStore';

const CreateTeam = ({ show, onHide, onCreate }) => {
  const { userData } = useUserDataStore();
  const [teamName, setTeamName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const processId = 1; // Default processId

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userData = await fetchUsers();
        // Filter users where roleId is 6 and map to Select format
        const filteredUsers = userData
          .filter(user => user.roleId === 6)
          .map(user => ({
            value: user.userId,
            label: user.userName
          }));
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error loading users:', error);
        setError('Failed to load users. Please try again.');
      }
    };
    loadUsers();
  }, []);

  const clearForm = () => {
    setTeamName('');
    setSelectedUsers([]);
    setError('');
  };

  const handleCreateTeam = async () => {
    // Validation
    if (!teamName.trim()) {
      setError('Team name is required');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    const newTeamData = {
      teamName,
      processId,
      userIds: selectedUsers.map(user => user.value),
      createdBy: userData.userId,
      status: true,
      createdDate: new Date().toISOString()
    };

    try {
      const response = await teamsService.createTeam(newTeamData);
      if (response.status === 409) { // Conflict status code
        const errorData = await response.json();
        setError(errorData.message || 'A team with this name already exists');
        setIsSubmitting(false);
        return;
      }
      onCreate(response); // Pass the created team data back
      clearForm(); // Clear form before closing
      onHide(); // Close the modal
    } catch (error) {
      if (error.response?.status === 409) {
        setError(error.response.data.message || 'A team with this name already exists');
      } else if (error.response?.status === 400) {
        setError(error.response.data.message || 'Invalid team data provided');
      } else if (error.response?.status === 401) {
        setError('You are not authorized to create teams');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to create teams');
      } else {
        setError('Failed to create team. Please try again.');
        console.error('Error creating team:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    clearForm();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Create New Team</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Team Name</Form.Label>
            <Form.Control
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={isSubmitting}
              placeholder="Enter team name"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Select Users</Form.Label>
            <Select
              isMulti
              options={users}
              value={selectedUsers}
              onChange={setSelectedUsers}
              placeholder="Select users..."
              isDisabled={isSubmitting}
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleCreateTeam} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Team'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateTeam;
