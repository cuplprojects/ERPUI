import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import CatchTeamAssignment from './Components/CatchTeamAssignment';
import LotTeamAssignment from './Components/LotTeamAssignment';
import ProjectTeamAssignment from './Components/ProjectTeamAssignment';
import quantitySheetService from '../../../CustomHooks/ApiServices/quantitySheetService';
import teamsService from '../../../CustomHooks/ApiServices/teamsService';

const AssignTeams = ({ data, handleSave, processId }) => {
  console.log(data)
  const [assignmentType, setAssignmentType] = useState('catch');
  const [teams, setTeams] = useState([]);
  const [lots, setLots] = useState([]);
  const [showTeams, setShowTeams] = useState(false);

  // Use optional chaining to safely access projectId from data
  const selectedProject = data?.projectId ? { projectid: data.projectId, projectname: data.course } : null;

  // If selectedProject is null, it means the projectId was not available
  useEffect(() => {
    if (selectedProject?.projectid) {
      const fetchData = async () => {
        try {
          const lotsData = await quantitySheetService.getLots(selectedProject.projectid);
          console.log('Lots for project:', lotsData);
          setLots(lotsData);

          const teamsData = await teamsService.getTeamsByProcess(processId);
          setTeams(teamsData);
          console.log('Teams for process:', teamsData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    } else {
      console.error("No projectId available in data.");
    }
  }, [selectedProject?.projectid, processId]);

  const handleTeamAssignment = async (teamId) => {
    if (assignmentType === 'project') {
      try {
        // Update all quantity sheets for the project with the same team
        const updates = [...lots].map(sheet => ({
          ...sheet,
          teamId: teamId,
        }));

        // Call API to update quantity sheets
        for (const update of updates) {
          await quantitySheetService.updateQuantitySheet(update.id, update);
        }
        handleSave();
        console.log('Successfully assigned team to all quantity sheets');
      } catch (error) {
        console.error('Error assigning team:', error);
      }
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
                    label="Project-wise"
                    name="assignmentType"
                    checked={assignmentType === 'project'}
                    onChange={() => setAssignmentType('project')}
                    className="custom-radio"
                  />
                  <Form.Check
                    type="radio"
                    label="Lot-wise"
                    name="assignmentType"
                    checked={assignmentType === 'lot'}
                    onChange={() => setAssignmentType('lot')}
                    className="custom-radio"
                  />
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

          { <div className="mt-4">
            {assignmentType === 'project' && (
              <ProjectTeamAssignment selectedProject={selectedProject} onTeamSelect={handleTeamAssignment} teams={teams} />
            )}
            {assignmentType === 'lot' && (
              <LotTeamAssignment selectedProject={selectedProject} onTeamSelect={handleTeamAssignment} lots={lots} teams={teams} data={data} processId={processId} />
            )}
            {assignmentType === 'catch' && (
              <CatchTeamAssignment selectedProject={selectedProject} onTeamSelect={handleTeamAssignment} lots={lots} teams={teams} data ={data} processId={processId}/>
            )}
          </div> }
        </Form>
      </div>

      {/* Teams Display - Directly on the page */}
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
