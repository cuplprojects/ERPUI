import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import CatchTeamAssignment from './Components/CatchTeamAssignment';
import LotTeamAssignment from './Components/LotTeamAssignment';
import ProjectTeamAssignment from './Components/ProjectTeamAssignment';
import quantitySheetService from '../../../CustomHooks/ApiServices/quantitySheetService';
import teamsService from '../../../CustomHooks/ApiServices/teamsService';
import API from '../../../CustomHooks/MasterApiHooks/api';

const AssignTeams = ({ data, handleSave, processId }) => {
  const [assignmentType, setAssignmentType] = useState('catch');
  const [teams, setTeams] = useState([]);
  const [lots, setLots] = useState([]);
  const [showTeams, setShowTeams] = useState(false);

  // Get unique project details from selected rows
  const uniqueProjects = Array.isArray(data) ? [...new Set(data.map(item => item.projectId))] : [];
  const selectedProject = data && data.length > 0 ? { 
    projectid: data[0].projectId, 
    projectname: data[0].course 
  } : null;

  useEffect(() => {
    if (selectedProject?.projectid) {
      const fetchData = async () => {
        try {
          const lotsData = await quantitySheetService.getLots(selectedProject.projectid);
          setLots(lotsData);

          const teamsData = await teamsService.getTeamsByProcess(processId);
          setTeams(teamsData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, [selectedProject?.projectid, processId]);

  const handleTeamAssignment = async (teamId) => {
    try {
      if (assignmentType === 'catch') {
        const updates = data.map(async (row) => {
          try {
            // Get existing transaction data if available
            let existingTransactionData = null;
            if (row.transactionId) {
              const response = await API.get(`/Transactions/${row.transactionId}`);
              existingTransactionData = response.data;
            }

            // Prepare post data, maintaining existing values
            const postData = {
              transactionId: row.transactionId || 0,
              interimQuantity: row.interimQuantity || 0,
              remarks: existingTransactionData?.remarks || '',
              projectId: row.projectId,
              quantitysheetId: row.srNo || 0,
              processId: processId,
              zoneId: existingTransactionData?.zoneId || 0,
              machineId: existingTransactionData?.machineId || 0,
              status: existingTransactionData?.status || 0,
              alarmId: existingTransactionData?.alarmId || "",
              lotNo: row.lotNo || "",
              teamId: teamId, // This is an array in your API
              voiceRecording: existingTransactionData?.voiceRecording || ""
            };

            console.log('Sending data:', postData); // Debug log

            if (row.transactionId) {
              await API.put(`/Transactions/${row.transactionId}`, postData);
            } else {
              await API.post('/Transactions', postData);
            }
          } catch (error) {
            console.error(`Error updating catch ${row.catchNumber}:`, error);
            console.log('Failed request data:', error.config?.data); // Debug log
            throw error; // Re-throw to be caught by outer try-catch
          }
        });

        await Promise.all(updates);
        
        // Only call handleSave if it exists
        if (typeof handleSave === 'function') {
          handleSave(teamId);
        }
      }
    } catch (error) {
      console.error('Error assigning team:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Team Assignment</h2>
      </div>

      {/* Assignment Settings */}
      <div className="bg-white rounded shadow-sm p-4 mb-4">
        <h5 className="mb-4">Assignment Settings</h5>
        
        {/* Selected Catches Display */}
        {Array.isArray(data) && data.length > 0 && (
          <div className="mb-3">
            <p><strong>Selected Catches:</strong> {data.map(row => row.catchNumber).join(', ')}</p>
            <p><strong>Total Items:</strong> {data.length}</p>
          </div>
        )}

        <div className="mb-4">
          <Button
            variant="info"
            onClick={() => setShowTeams(!showTeams)}
            className="mb-3"
          >
            {showTeams ? 'Hide Teams' : 'Show Teams'}
          </Button>
        </div>

        <Form>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Project</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedProject?.projectid || 'Select a project'}
                  readOnly
                  className="border-0 bg-light"
                />
              </Form.Group>
            </Col>

            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Assignment Type</Form.Label>
                <div className="d-flex gap-4">
                  <Form.Check
                    type="radio"
                    label="Catch-wise"
                    name="assignmentType"
                    checked={assignmentType === 'catch'}
                    onChange={() => setAssignmentType('catch')}
                    className="custom-radio"
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          {assignmentType === 'catch' && (
            <CatchTeamAssignment 
              selectedProject={selectedProject} 
              onTeamSelect={handleTeamAssignment} 
              lots={lots} 
              teams={teams} 
              data={data}  // Pass all selected rows
              processId={processId}
            />
          )}
        </Form>
      </div>

      {/* Teams Display */}
      {showTeams && (
        <div className="mb-4">
          <h5 className="mb-3">Teams</h5>
          <Row>
            {teams.length > 0 ? (
              teams.map((team) => (
                <Col md={6} key={team.teamId} className="mb-4">
                  <div className="team-card bg-white p-4 rounded shadow-sm h-100">
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="team-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px', fontSize: '1.5rem' }}
                      >
                        {team.teamName.charAt(0)}
                      </div>
                      <h5 className="ms-3 mb-0">{team.teamName}</h5>
                    </div>
                    <div className="team-members">
                      <p className="text-muted mb-2">Team Members:</p>
                      <div className="member-list">
                        {team.users.map((user) => (
                          <div key={user.userId} className="member-item d-flex align-items-center mb-2">
                            <div
                              className="member-avatar bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                              style={{ width: '30px', height: '30px', fontSize: '0.9rem' }}
                            >
                              {user.userName.charAt(0)}
                            </div>
                            <span>{user.userName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button variant="primary" onClick={() => handleTeamAssignment(team.teamId)}>
                      Assign Team
                    </Button>
                  </div>
                </Col>
              ))
            ) : (
              <Col className="text-center py-5">
                <div className="text-muted">
                  <i className="fas fa-users mb-3" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-2">No teams available</p>
                </div>
              </Col>
            )}
          </Row>
        </div>
      )}
    </Container>
  );
};

export default AssignTeams;
