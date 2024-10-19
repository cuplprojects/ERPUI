import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaClipboard, FaExclamationTriangle } from 'react-icons/fa'; // Import clipboard and alert icons
import { notification } from 'antd'; // Import AntD notification
import 'antd/dist/reset.css'; // Import Ant Design styles
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';

const AddUserModal = ({ show, username, password, onClose, fullName }) => {
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customLight = cssClasses[2];
  const customBtn = cssClasses[3];
  const customDarkText = cssClasses[4];
  const customLightBorder = cssClasses[6];
  const customDarkBorder = cssClasses[7];

  const [countdown, setCountdown] = useState(5); // Countdown state
  const [isClosingEnabled, setIsClosingEnabled] = useState(false); // State to manage close button enabling

  useEffect(() => {
    if (show) {
      setIsClosingEnabled(false); // Disable closing initially
      setCountdown(5); // Reset countdown
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsClosingEnabled(true); // Enable closing after countdown
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval); // Clear interval on unmount
    }
  }, [show]);

  const handleClose = () => {
    if (isClosingEnabled) {
      onClose(); // Call the onClose prop to manage modal visibility in the parent component
    }
  };

  // Function to copy text to clipboard and show AntD notification
  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        notification.success({
          message: `${label} Copied`,
          description: `${label} has been successfully copied to the clipboard!`,
          placement: 'bottomRight',
        });
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  // Function to copy both username and password to clipboard
  const handleCopyBothToClipboard = () => {
    const combinedText = `Your User Name: ${username}\nYour Temporary Password: ${password}`;
    navigator.clipboard.writeText(combinedText)
      .then(() => {
        notification.success({
          message: 'Credentials Copied',
          description: 'Your credentials have been successfully copied to the clipboard!',
          placement: 'bottomRight',
        });
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header className={`${customDark === "dark-dark" ? `${customDarkText} ${customDark}` : `${customDark} text-light`} d-flex justify-content-center`}>
        <Modal.Title>User Added Successfully!</Modal.Title>
      </Modal.Header>
      <Modal.Body>

        {/* Disclaimer Section */}
        <div className="d-flex align-items-center text-danger mb-3 justify-content-center">
          <FaExclamationTriangle style={{ marginRight: '5px' }} />
          <strong>Please note down the credentials carefully.</strong>
        </div>

        <p>The <span>{fullName}</span>  has been added successfully!</p>

        <div className="d-flex align-items-center justify-content-between">
          <strong>Username:</strong>
          <div>
            {username}
            <Button
              variant="link"
              onClick={() => handleCopyToClipboard(username, 'Username')}
              style={{ marginLeft: '10px', display: 'inline-flex', alignItems: 'center' }}
            >
              Copy User Name <FaClipboard style={{ marginLeft: '5px' }} />
            </Button>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-between mt-3">
          <strong>Password:</strong>
          <div>
            {password}
            <Button
              variant="link"
              onClick={() => handleCopyToClipboard(password, 'Password')}
              style={{ marginLeft: '10px', display: 'inline-flex', alignItems: 'center' }}
            >
              Copy Password <FaClipboard style={{ marginLeft: '5px' }} />
            </Button>
          </div>
        </div>

        {/* New Button to Copy Both */}
        <div className="d-flex align-items-center justify-content-between mt-3">
          <Button
            onClick={handleCopyBothToClipboard}
            style={{ display: 'inline-flex', alignItems: 'center' }}
            className={`${customDark === "dark-dark" ? `${customBtn} border-light custom-zoom-btn` : `${customBtn} border-0 custom-zoom-btn`}`}
          >
            Copy Credentials <FaClipboard style={{ marginLeft: '5px' }} />
          </Button>
        </div>

        {/* Countdown Timer */}
        <div className="text-center mt-4">
          {isClosingEnabled ? (
            <span>You can now close this window.</span>
          ) : (
            <span>Wait before  {countdown} seconds...</span>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className={`${customDark === "dark-dark" ? `${customBtn} border-light custom-zoom-btn` : `${customBtn} border-0 custom-zoom-btn`}`}
          onClick={handleClose}
          disabled={!isClosingEnabled} // Disable button until countdown finishes
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddUserModal;
