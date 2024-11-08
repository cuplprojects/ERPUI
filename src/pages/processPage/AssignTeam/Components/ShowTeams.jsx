import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';

const ShowTeams = ({ show, onHide, teams }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Teams List</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-light">
        <Row>
          {teams.length > 0 ? (
            teams.map(team => (
              <Col md={6} key={team.teamId} className="mb-4">
                <div className="team-card bg-white p-4 rounded shadow-sm h-100">
                  <div className="d-flex align-items-center mb-3">
                    <div className="team-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                         style={{width: '40px', height: '40px', fontSize: '1.5rem'}}>
                      {team.teamName.charAt(0)}
                    </div>
                    <h5 className="ms-3 mb-0">{team.teamName}</h5>
                  </div>
                  <div className="team-members">
                    <p className="text-muted mb-2">Team Members:</p>
                    <div className="member-list">
                      {team.users.map(user => (
                        <div key={user.userId} className="member-item d-flex align-items-center mb-2">
                          <div className="member-avatar bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                               style={{width: '30px', height: '30px', fontSize: '0.9rem'}}>
                            {user.name.charAt(0)}
                          </div>
                          <span>{user.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Col>
            ))
          ) : (
            <Col className="text-center py-5">
              <div className="text-muted">
                <i className="fas fa-users mb-3" style={{fontSize: '3rem'}}></i>
                <p className="mt-2">No teams available</p>
              </div>
            </Col>
          )}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShowTeams;
