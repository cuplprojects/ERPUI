import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, FormControl } from 'react-bootstrap';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FaLock } from "react-icons/fa";
import { IoMdLock } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Removed external validation imports
// Removed themeStore and useStore imports for debugging purposes
import jwtDecode from 'jwt-decode';
import axios from 'axios';

const ChangePassword = () => {
  // Removed themeStore related code for simplicity
  // Replace with static class names or default styles for testing
  const customBtn = 'btn-primary'; // Example static class
  const customDarkText = 'text-dark';
  const customLight = 'bg-light';
  const customLightBorder = 'border-light';

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // To prevent multiple submits

  /**
   * Validation Functions
   */

  // Validate that a password is not empty
  const validateNotEmpty = (password, fieldName) => {
    if (!password.trim()) {
      toast.error(`${fieldName} cannot be empty.`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        draggable: true,
        style: { backgroundColor: '#dc3545', color: 'white' },
      });
      return false;
    }
    return true;
  };

  // Validate password complexity (e.g., minimum 8 characters, at least one letter and one number)
  const validatePasswordComplexity = (password) => {
    const complexityRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!complexityRegex.test(password)) {
      toast.error('New Password must be at least 8 characters long and include both letters and numbers.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        draggable: true,
        style: { backgroundColor: '#dc3545', color: 'white' },
      });
      return false;
    }
    return true;
  };

  // Validate that confirm password matches new password
  const validatePasswordsMatch = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      toast.error('New Password and Confirm Password do not match.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        draggable: true,
        style: { backgroundColor: '#dc3545', color: 'white' },
      });
      return false;
    }
    return true;
  };

  /**
   * Handle Form Submission
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Client-side Validations
    if (!validateNotEmpty(currentPassword, 'Current Password')) return;
    if (!validateNotEmpty(newPassword, 'New Password')) return;
    if (!validateNotEmpty(confirmPassword, 'Confirm Password')) return;
    if (!validatePasswordComplexity(newPassword)) return;
    if (!validatePasswordsMatch(newPassword, confirmPassword)) return;

    try {
      setIsSubmitting(true); // Disable the form submission

      const userToken = localStorage.getItem('authToken');
      if (!userToken) {
        throw new Error('Authorization token is missing');
      }

      let decodedToken;
      try {
        decodedToken = jwtDecode(userToken);
      } catch (decodeError) {
        throw new Error('Invalid token format');
      }

      const userId = decodedToken?.userId; // Get userId from token
      if (!userId) {
        throw new Error('Invalid token: user ID missing');
      }

      const apiUrl = `https://localhost:7212/api/Login/ChangePassword/${userId}`;
      const payload = {
        oldPassword: currentPassword,
        newPassword: newPassword,
      };

      // Make API call to change password
      const response = await axios.put(apiUrl, payload, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      // Handle success
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
    } catch (error) {
      // Handle error
      console.error('Error changing password:', error);
      toast.error(`Error: ${error.response?.data?.message || error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        draggable: true,
        style: { backgroundColor: '#dc3545', color: 'white' },
      });
    } finally {
      setIsSubmitting(false); // Re-enable form submission
    }
  };

  return (
    <Container className={`mt-5 w-100 p-4 shadow-lg rounded-5 ${customLightBorder} ${customLight}`} style={{ maxWidth: '800px' }}>
      <Row>
        <Col lg={12}>
          <div className="d-flex align-items-center justify-content-center mb-4">
            <div className="icon me-2">
              <FaLock size={25} className={`${customBtn === 'btn-dark' ? "text-white" : `${customDarkText}`}`} />
            </div>
            <h2 className={`text-center fw-bold ${customBtn === 'btn-dark' ? "text-white" : `${customDarkText}`}`}>
              Change Password
            </h2>
          </div>
        </Col>
      </Row>
      <Row className="align-items-center justify-content-center">
        <Col md={6} lg={5} className="text-center d-none d-md-block">
          <IoMdLock size={250} className={`${customBtn === 'btn-dark' ? "text-white" : `${customDarkText}`}`} />
        </Col>
        <Col md={6} lg={7}>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formCurrentPassword">
              <Form.Label className={`${customBtn === 'btn-dark' ? "text-white" : `${customDarkText}`}`}>
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
                  style={{ cursor: 'pointer' }}
                >
                  {showCurrentPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formNewPassword">
              <Form.Label className={`${customBtn === 'btn-dark' ? "text-white" : `${customDarkText}`}`}>
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
                  style={{ cursor: 'pointer' }}
                >
                  {showNewPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formConfirmPassword">
              <Form.Label className={`${customBtn === 'btn-dark' ? "text-white" : `${customDarkText}`}`}>
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
                  style={{ cursor: 'pointer' }}
                >
                  {showConfirmPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Button
              type="submit"
              disabled={isSubmitting}
              className={`${customBtn} border-0 custom-zoom-btn w-100`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
          <ToastContainer />
        </Col>
      </Row>
    </Container>
  );
};

export default ChangePassword;
