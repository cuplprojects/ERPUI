import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import API from '../../../../CustomHooks/MasterApiHooks/api';


const CatchTeamAssignment = ({ teams, data, onTeamSelect, processId }) => {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [usersInTeam, setUsersInTeam] = useState([]);
  const [userOptions, setUserOptions] = useState([]); // List of users to be added to the team
  const [selectedUserToAdd, setSelectedUserToAdd] = useState(''); // User selected to be added

  useEffect(() => {
    if (data?.teamId) {
      setSelectedTeam(data.teamId);
      const team = teams.find((team) => team.teamId === data.teamId);
      if (team) {
        setUsersInTeam(team.users); // Populate team users when team is selected
      }
    }
    fetchUsers()
  }, [data, teams]);

  // Fetch all users for adding a new user to the teamonp
  const fetchUsers = async () => {
    try {
      const response = await API.get('/User/operator');
      setUserOptions(response.data); // Assuming the response contains the list of users
    } catch (error) {
      console.error('Error fetching users:', error);
    }
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

    // Find the user object based on the selected user ID
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
    try {
      let existingTransactionData;
      if (data.transactionId) {
        const response = await API.get(`/Transactions/${data.transactionId}`);
        existingTransactionData = response.data;
      }
  
      // Combine users from the selected team and newly added users
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
        lotNo: data.lotNo,
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
    <div>
      <Row className="mb-3">
        <Col md={12}>
          {/* Display the catch number passed in the `data` prop */}
          <h5>Catch Number: {data?.catchNumber || 'N/A'}</h5>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Select Team</Form.Label>
            <Form.Select
              value={selectedTeam}
              onChange={handleTeamChange}
            >
              <option value="">Select a team...</option>
              {console.log(teams)}
              {teams.map((team) => (
                
                <option key={team.teamId} value={team.teamId}>
                  {team.teamName} ({team.users.map(user => user.userName).join(', ')})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

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

      <Row>
        <Col md={12}>
          <Button variant="success" onClick={handleConfirm}>
            Confirm Assignment
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default CatchTeamAssignment;
