// import React, { useState } from 'react';
// import { Button, Form } from 'react-bootstrap';
// import Select from 'react-select';

// const AssignTeamModal = ({ show, onHide, teams, onAssign }) => {
//   const [selectedTeam, setSelectedTeam] = useState(null);

//   const teamOptions = teams.map(team => ({
//     value: team.teamId,
//     label: `${team.teamName} (${team.users.map(user => user.name).join(', ')})`
//   }));

//   const handleAssign = () => {
//     if (selectedTeam) {
//       onAssign(selectedTeam.value);
//       setSelectedTeam(null);
//       onHide();
//     }
//   };

//   return (
//     <Modal show={show} onHide={onHide}>
//       <Modal.Header closeButton>
//         <Modal.Title>Assign Team</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Form>
//           <Form.Group className="mb-3">
//             <Form.Label>Select Team</Form.Label>
//             <Select
//               value={selectedTeam}
//               onChange={setSelectedTeam}
//               options={teamOptions}
//               placeholder="Choose a team..."
//             />
//           </Form.Group>
//         </Form>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={onHide}>
//           Cancel
//         </Button>
//         <Button 
//           variant="primary" 
//           onClick={handleAssign}
//           disabled={!selectedTeam}
//         >
//           Assign
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default AssignTeamModal;