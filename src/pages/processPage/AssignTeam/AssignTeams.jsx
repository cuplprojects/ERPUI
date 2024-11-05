import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import LotTeamAssignment from './Components/LotTeamAssignment';
import CatchTeamAssignment from './Components/CatchTeamAssignment';
import CreateTeam from './Components/CreateTeam';
import ShowTeams from './Components/ShowTeams';
import quantitySheetService from '../../../CustomHooks/ApiServices/quantitySheetService';
import ProjectTeamAssignment from './Components/ProjectTeamAssignment';
import teamsService from '../../../CustomHooks/ApiServices/teamsService';

const AssignTeams = () => {
  const [selectedProject, setSelectedProject] = useState({ projectid: 1, projectname: 'Project Alpha' });
  const [assignmentType, setAssignmentType] = useState('project');
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [teams, setTeams] = useState([]);
  const [lots, setLots] = useState([]);
  const [catches, setCatches] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const processId = 1; // Default processId

  const projects = [
    { id: 1, name: 'Project Alpha' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get lots for the selected project
        const lotsData = await quantitySheetService.getLots(selectedProject.projectid);
        console.log('Lots for project:', lotsData);
        setLots(lotsData);

        // Get catches for the selected project
        const catchesData = await quantitySheetService.getCatchByProject(selectedProject.projectid);
        console.log('Catches for project:', catchesData);
        setCatches(catchesData);

        // Get teams for the process
        const teamsData = await teamsService.getTeamsByProcess(processId);
        setTeams(teamsData);
        console.log('Teams for process:', teamsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (selectedProject.projectid) {
      fetchData();
    }
  }, [selectedProject.projectid]);

  const handleCreateTeamModalToggle = () => {
    setShowCreateTeamModal(!showCreateTeamModal);
  };

  const handleShowTeams = async () => {
    try {
      const teamsData = await teamsService.getTeamsByProcess(processId);
      setTeams(teamsData);
      setShowTeamsModal(true);
      console.log('Teams for process:', teamsData);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleTeamAssignment = async (teamId) => {
    if (assignmentType === 'project') {
      try {
        // Update all quantity sheets for the project with the same team
        const updates = [...lots, ...catches].map(sheet => ({
          ...sheet,
          teamId: teamId
        }));
        
        // Call API to update quantity sheets
        for (const update of updates) {
          await quantitySheetService.updateQuantitySheet(update.id, update);
        }
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
        <div>
          <Button variant="info" onClick={handleShowTeams} className="me-2">
            Show Teams
          </Button>
          <Button variant="primary" onClick={handleCreateTeamModalToggle}>
            Create New Team
          </Button>
        </div>
      </div>

      <CreateTeam 
        show={showCreateTeamModal}
        onHide={handleCreateTeamModalToggle}
        onCreate={() => {
          console.log('Team created!');
          handleShowTeams(); // Refresh teams list after creation
        }}
      />

      <ShowTeams
        show={showTeamsModal}
        onHide={() => setShowTeamsModal(false)}
        teams={teams}
      />

      <div className="bg-white rounded shadow-sm p-4 mb-4">
        <h5 className="mb-4">Assignment Settings</h5>
        <Form>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Project</Form.Label>
                <Form.Select 
                  value={selectedProject.projectid}
                  onChange={(e) => setSelectedProject({
                    projectid: parseInt(e.target.value),
                    projectname: projects.find(p => p.id === parseInt(e.target.value))?.name
                  })}
                  disabled={true}
                  className="border-0 bg-light"
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </Form.Select>
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

          <div className="mt-4">
            {assignmentType === 'project' && <ProjectTeamAssignment selectedProject={selectedProject} onTeamSelect={handleTeamAssignment} teams={teams} />}
            {assignmentType === 'lot' && <LotTeamAssignment selectedProject={selectedProject} lots={lots} teams={teams} />}
            {assignmentType === 'catch' && <CatchTeamAssignment selectedProject={selectedProject} catches={catches} teams={teams} />}
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default AssignTeams;
