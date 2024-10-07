import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const AddUserModal = ({ show, username, password, onClose }) => {
  const [timer, setTimer] = useState(10); // Default timer value
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    // Retrieve timer from local storage on component mount
    const storedTimer = localStorage.getItem('modalTimer');
    if (storedTimer) {
      setTimer(Number(storedTimer)); // Use stored timer if available
    }

    const timerId = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (timer <= 0) {
      setDisabled(false); // Enable close button when timer reaches 0
    }

    // Store the current timer value in local storage
    localStorage.setItem('modalTimer', timer);
  }, [timer]);

  const handleClose = () => {
    if (!disabled) {
      localStorage.removeItem('modalTimer'); // Clear timer from local storage
      onClose(); // Call the onClose prop to manage modal visibility in the parent component
    }
  };

  return (
    <Modal show={show} backdrop="static" keyboard={false} onHide={handleClose}>
      <Modal.Header>
        <Modal.Title>User Added Successfully!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>The user has been added successfully!</p>
        <p><strong>Username:</strong> {username}</p>
        <p><strong>Password:</strong> {password}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={disabled}>
          Close ({timer > 0 ? `(${timer} seconds)` : ''})
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddUserModal;
