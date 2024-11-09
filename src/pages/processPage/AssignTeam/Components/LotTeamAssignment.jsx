import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import API from '../../../../CustomHooks/MasterApiHooks/api';

const LotTeamAssignment = ({ onTeamSelect, teams, lots, processId , data }) => {
  console.log(data)
  
  const [selectedLot, setSelectedLot] = useState(''); // New state for selected lot
  const [selectedTeam, setSelectedTeam] = useState('');
  const [usersInTeam, setUsersInTeam] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');

  // Fetch all users for adding a new user to the team
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      const team = teams.find((team) => team.teamId === selectedTeam);
      if (team) {
        setUsersInTeam(team.users); // Populate team users when team is selected
      }
    }
  }, [selectedTeam, teams]);

  const fetchUsers = async () => {
    try {
      const response = await API.get('/User/operator');
      setUserOptions(response.data); // Assuming the response contains the list of users
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleLotChange = (e) => {
    const lotId = e.target.value;
    setSelectedLot(lotId); // Update selected lot
    // Reset selected team and users when lot changes
    setSelectedTeam('');
    setUsersInTeam([]);
  };

  const handleTeamChange = (e) => {
    const teamId = parseInt(e.target.value);
    setSelectedTeam(teamId);
    const team = teams.find((team) => team.teamId === teamId);
    if (team) {
      setUsersInTeam(team.users); // Update users when team changes
    }
    onTeamSelect(teamId); // Notify parent component about the selected team
  };

  const handleAddUser = async () => {
    if (!selectedUserToAdd) {
      alert('Please select a user to add.');
      return;
    }

    const userToAdd = userOptions.find((user) => user.userId === parseInt(selectedUserToAdd));

    if (userToAdd) {
      setUsersInTeam([...usersInTeam, userToAdd]); // Add the new user to the team
      setSelectedUserToAdd(''); // Reset the user selection
    }
  };

  const filteredUserOptions = userOptions.filter(user =>
    !usersInTeam.some(teamUser => teamUser.userId === user.userId)
  );

  const handleConfirm = async () => {
    if (!selectedLot || !selectedTeam) {
      alert('Please select both a lot and a team.');
      return;
    }

    try {
      let existingTransactionData;
      // If updating an existing transaction, fetch the transaction details
      if (data.transactionId) {
        const response = await API.get(`/Transactions/${data.transactionId}`);
        existingTransactionData = response.data;
      }

      const allUserIds = [
        ...usersInTeam.map(user => user.userId),  // User IDs from selected team
      ];

      const postData = {
        transactionId: data.transactionId || 0,
        interimQuantity: existingTransactionData ? existingTransactionData.interimQuantity : 0, // Adjust based on actual data
        remarks: existingTransactionData ? existingTransactionData.remarks : '',
        projectId: data.projectId,
        quantitysheetId: data.srNo || 0,
        processId: processId,
        zoneId: existingTransactionData ? existingTransactionData.zoneId : 0, // Use the selected zone here
        machineId: existingTransactionData ? existingTransactionData.machineId : 0,
        status: existingTransactionData ? existingTransactionData.status : 0,
        alarmId: existingTransactionData ? existingTransactionData.alarmId : "",
        lotNo: selectedLot, // Use the selected lot number
        teamId: allUserIds,  // Send the array of user IDs
        voiceRecording: existingTransactionData ? existingTransactionData.voiceRecording : "",
      };

      if (data.transactionId) {
        await API.put(`/Transactions/${data.transactionId}`, postData);
      } else {
        await API.post('/Transactions', postData);
      }

    } catch (error) {
      console.error('Error updating interim quantity:', error);
    }
  };

  return (
    <Row>
      {/* Dropdown to select Lot */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Select Lot</Form.Label>
            <Form.Select
              value={selectedLot}
              onChange={handleLotChange}
            >
              <option value="">Select a lot...</option>
              {/* Render lots in the dropdown */}
              {lots.map((lot) => (
                <option key={lot} value={lot}>
                  Lot {lot} {/* Displaying lot ID */}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Render Team Dropdown after selecting a lot */}
      {selectedLot && (
        <>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Select Team</Form.Label>
                <Form.Select
                  value={selectedTeam}
                  onChange={handleTeamChange}
                >
                  <option value="">Select a team...</option>
                  {teams.map((team) => (
                    <option key={team.teamId} value={team.teamId}>
                      {team.teamName} ({team.users.map(user => user.userName).join(', ')})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Users in selected team */}
          {selectedTeam && (
            <>
              <Row className="mb-3">
                <Col md={12}>
                  <h6>Users in selected team:</h6>
                  <ul>
                    {usersInTeam.map((user) => (
                      <li key={user.userId}>
                        {user.userName}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveUser(user.userId)}
                          className="ms-2"
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </Col>
              </Row>

              {/* Dropdown for adding new user */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Select User to Add</Form.Label>
                    <Form.Select
                      value={selectedUserToAdd}
                      onChange={(e) => setSelectedUserToAdd(e.target.value)}
                    >
                      <option value="">Select a user...</option>
                      {filteredUserOptions.map((user) => (
                        <option key={user.userId} value={user.userId}>
                          {user.userName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Button variant="primary" onClick={handleAddUser}>
                    Add User
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </>
      )}

      {/* Confirm button */}
      <Row>
        <Col md={12}>
          <Button variant="success" onClick={handleConfirm}>
            Confirm Assignment
          </Button>
        </Col>
      </Row>
    </Row>
  );
};

export default LotTeamAssignment;
