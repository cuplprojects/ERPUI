import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, FormControl } from 'react-bootstrap';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FaLock } from "react-icons/fa";
import { IoMdLock } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { validateCurrentPassword, validateNewPasswords } from './../scripts/changePassValidations';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';

const ChangePassword = () => {
  //Theme Change Section
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customLight = cssClasses[2];
  const customBtn = cssClasses[3];
  const customDarkText = cssClasses[4];
  const customLightText = cssClasses[5];
  const customLightBorder = cssClasses[6];
  const customDarkBorder = cssClasses[7];

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch active user from local storage
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));

  const handleSubmit = (event) => {
    event.preventDefault();

    // Validate current password
    const isCurrentPasswordValid = validateCurrentPassword(currentPassword, activeUser);
    if (!isCurrentPasswordValid) return;

    // Validate new password and confirm password
    const areNewPasswordsValid = validateNewPasswords(newPassword, confirmPassword);
    if (!areNewPasswordsValid) return;

    // Update the active user's password in local storage
    activeUser.password = newPassword;
    localStorage.setItem('activeUser', JSON.stringify(activeUser));
    toast.success('Password updated successfully', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      draggable: true,
      style: { backgroundColor: '#28a745', color: 'white' },
    });

    // Optionally reset the form fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Container className={`mt-5 w-100 p-4 shadow-lg rounded-5 ${customLightBorder} ${customLight}`} style={{ maxWidth: '800px' }}>
      <Row>
        <Col lg={12}>
          <div className="d-flex align-items-center justify-content-center mb-4">
            <div className="icon me-2">
              <FaLock size={25} className={`${(customBtn === 'dark-dark' ? "text-white" : `${customDarkText}`)}`} />
            </div>
            <h2 className={`text-center fw-bold ${(customBtn === 'dark-dark' ? "text-white" : `${customDarkText}`)}`}>
              Change Password
            </h2>
          </div>
        </Col>
      </Row>
      <Row className="align-items-center justify-content-center">
        <Col md={6} lg={5} className="text-center d-none d-md-block">
          <IoMdLock size={250} className={`${(customBtn === 'dark-dark' ? "text-white" : `${customDarkText}`)}`} />
        </Col>
        <Col md={6} lg={7}>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formCurrentPassword">
              <Form.Label className={`${(customBtn === 'dark-dark' ? "text-white" : `${customDarkText}`)}`}>
                Current Password
              </Form.Label>
              <InputGroup>
                <FormControl
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  className='rounded-start'
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <InputGroup.Text
                  className={`password-eye-icon ${customBtn}`}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formNewPassword">
              <Form.Label className={`${(customBtn === 'dark-dark' ? "text-white" : `${customDarkText}`)}`}>
                New Password
              </Form.Label>
              <InputGroup>
                <FormControl
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className='rounded-start'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <InputGroup.Text
                  className={`password-eye-icon ${customBtn}`}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formConfirmPassword">
              <Form.Label className={`${(customBtn === 'dark-dark' ? "text-white" : `${customDarkText}`)}`}>
                Confirm New Password
              </Form.Label>
              <InputGroup>
                <FormControl
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className='rounded-start'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <InputGroup.Text
                  className={`password-eye-icon ${customBtn}`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Button type="submit" className={`${customBtn} ${customDark === "dark-dark" ? "border border-white" : "border-0"} custom-zoom-btn w-100`}>
              Submit
            </Button>
          </Form>
          <ToastContainer />
        </Col>
      </Row>
    </Container>
  );
};

export default ChangePassword;
