import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import API from '../../../../CustomHooks/MasterApiHooks/api';


const CatchTeamAssignment = ({ teams, data, handleSave, handleClose, processId }) => {


  const [selectedTeam, setSelectedTeam] = useState('');
  const [usersInTeam, setUsersInTeam] = useState([]);
  const [userOptions, setUserOptions] = useState([]); // List of users to be added to the team
  const [selectedUserToAdd, setSelectedUserToAdd] = useState(''); // User selected to be added
  
  useEffect(() => {
    if (data?.[0]?.teamId) {
      setSelectedTeam(data[0].teamId);
      const team = teams.find((team) => team.teamId === data[0].teamId);
      if (team) {
        setUsersInTeam(team.users); // Populate team users when team is selected
      }
    }
    fetchUsers();
  }, [data, teams]);

  // Fetch all users for adding a new user to the team
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
 // Notify parent component about the selected team
  };

  const handleRemoveUser = (userId) => {
    setUsersInTeam(usersInTeam.filter(user => user.userId !== userId)); // Remove the user from the array
  };

  const handleRemoveUser = (userId) => {
    setUsersInTeam(usersInTeam.filter(user => user.userId !== userId)); // Remove the user from the array
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
      for (let item of data) {
        let existingTransactionData;
        
        if (item?.transactionId) {
          // Fetch existing transaction data if available
          const response = await API.get(`/Transactions/${item.transactionId}`);
          existingTransactionData = response.data;
        }
  
        // Combine users from the selected team and newly added users
        const allUserIds = [
          ...usersInTeam.map(user => user.userId),  // User IDs from selected team
        ];
  
        const postData = {
          transactionId: item?.transactionId || 0,
          interimQuantity: existingTransactionData ? existingTransactionData.interimQuantity : 0, // Adjust based on actual data
          remarks: existingTransactionData ? existingTransactionData.remarks : '',
          projectId: item?.projectId,
          quantitysheetId: item?.srNo || 0,
          processId: processId,
          zoneId: existingTransactionData ? existingTransactionData.zoneId : 0, // Use the selected zone here
          machineId: existingTransactionData ? existingTransactionData.machineId : 0,
          status: existingTransactionData ? existingTransactionData.status : 0,
          alarmId: existingTransactionData ? existingTransactionData.alarmId : "",
          lotNo: item?.lotNo,
          teamId: allUserIds,  // Send the array of user IDs
          voiceRecording: existingTransactionData ? existingTransactionData.voiceRecording : "",
        };

        // Send the data as a PUT (update) or POST (create) request
        if (item?.transactionId) {
          await API.put(`/Transactions/${item.transactionId}`, postData);
        } else {
          await API.post('/Transactions', postData);
        }
      }
      
      // Optionally, you can call handleSave here if necessary, after all updates/posts have been completed
      handleSave(); 
      handleClose();
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  return (
    <div>
      <Row className="mb-3">
        <Col md={12}>
          {/* Display all catch numbers by iterating through `data` */}
          <h5>Catch Numbers:</h5>
          {data?.length > 0 ? (
            <ul>
              {data.map((item, index) => (
                <li key={index}>Catch Number: {item?.catchNumber || 'N/A'}</li>
              ))}
            </ul>
          ) : (
            <p>No catch numbers available.</p>
          )}
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