import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const ProjectTeamAssignment = ({ selectedProject, onTeamSelect, teams }) => {
  const [selectedTeam, setSelectedTeam] = useState('');

  const handleTeamChange = (e) => {
    const teamId = parseInt(e.target.value);
    setSelectedTeam(teamId);
    onTeamSelect(teamId);
  };

  return (
    <Row>
      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Select Team for Project: {selectedProject.projectid}</Form.Label>
          <Form.Select
            value={selectedTeam}
            onChange={handleTeamChange}
          >
            <option value="">Select a team...</option>
            {teams.map(team => (
              <option key={team.teamId} value={team.teamId}>
                {team.teamName} ({team.users.map(user => user.name).join(', ')})
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
    </Row>
  );
};

export default ProjectTeamAssignment;