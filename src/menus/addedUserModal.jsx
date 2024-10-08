import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const AddUserModal = ({ show, username, password, onClose }) => {
  const handleClose = () => {
    onClose(); // Call the onClose prop to manage modal visibility in the parent component
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>User Added Successfully!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>The user has been added successfully!</p>
        <p><strong>Username:</strong> {username}</p>
        <p><strong>Password:</strong> {password}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddUserModal;
