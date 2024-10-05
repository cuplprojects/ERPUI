import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import brain from "./../assets/bgImages/brain.svg"; // Background image
import Logo1 from "./../assets/Logos/CUPLLogoTheme.png"; // Logo
import { useMediaQuery } from 'react-responsive'; // Importing useMediaQuery react-responsive library
import themeStore from './../store/themeStore'; // Import theme store
import { useStore } from 'zustand'; // Import zustand store
import redBrain from "./../assets/bgImages/brain/brainRed.png";
import greenBrain from "./../assets/bgImages/brain/brainGreen.png";
import blueBrain from "./../assets/bgImages/brain/brainBlue.png";
import pinkBrain from "./../assets/bgImages/brain/brainPink.png";
import purpleBrain from "./../assets/bgImages/brain/brainPurple.png";
import darkBrain from "./../assets/bgImages/brain/brainDark.png";
import brownBrain from "./../assets/bgImages/brain/brainBrown.png";
import lightBrain from "./../assets/bgImages/brain/brainLight.png";
import defaultBrain from "./../assets/bgImages/brain/brainDefault.png";

const ForgotPassword = () => {
  // Theme Change Section
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customBtn = cssClasses[3];

  const themeImages = {
    "purple-dark": purpleBrain,
    "blue-dark": blueBrain,
    "green-dark": greenBrain,
    "red-dark": redBrain,
    "dark-dark": darkBrain,
    "light-dark": lightBrain,
    "pink-dark": pinkBrain,
    "brown-dark": brownBrain,
    "default": defaultBrain
  };

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // Media Query: true if screen width is less than or equal to 992px
  const isMediumOrSmaller = useMediaQuery({ query: '(max-width: 992px)' });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    // Here you would handle the password update logic
    toast.success('Password reset successfully!', {
      onClose: () => navigate('/'), // Navigate when the toast closes
      autoClose: 3000,
    });
  };

  return (
    <Container fluid className="vh-100 position-relative overflow-hidden">
      <ToastContainer className="responsive-toast" /> {/* Toast container for showing notifications */}

      {/* Background Image for Medium and Smaller Screens */}
      {isMediumOrSmaller && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${brain})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(5px)', // Apply blur to the background image
          zIndex: -1, // Ensure it's behind the form
        }} />
      )}

      <Row className="h-100 d-flex align-items-center justify-content-center">
        {/* Left side: Forgot Password form */}
        <Col
          lg={4}
          className={`d-flex align-items-center justify-content-center p-0 ${isMediumOrSmaller ? '' : customDark}`}
          style={{ zIndex: 1, height: '100%' }}
        >
          <div className="p-2 rounded-3" style={{ maxWidth: '400px', width: '100%' }}>
            {/* Logo */}
            <div className={`text-center mb-4 rounded-3 ${customBtn}`}>
              <img src={Logo1} alt="Company Logo" className="img-fluid" style={{ maxWidth: '250px' }} />
            </div>

            {/* Forgot Password Form */}
            <Form onSubmit={handleSubmit} className="bg-white p-2 rounded-2">
              <h3 className="text-center mb-4">Reset Password</h3>
              <Form.Group controlId="formBasicPassword" className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </Form.Group>
              <Form.Group controlId="formBasicConfirmPassword" className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </Form.Group>
              <Button type="submit" className={`w-100 border-0 ${customBtn}`}>
                Reset Password
              </Button>
            </Form>
          </div>
        </Col>

        {/* Right side: Big image for Large Screens */}
        {!isMediumOrSmaller && (
          <Col lg={8} className="d-flex align-items-center justify-content-center p-0 position-relative">
            <img
              src={themeImages[customDark] || defaultBrain}
              alt="Forgot Password Illustration"
              className="w-75 h-auto"
              style={{ objectFit: 'contain' }} // Shrink the image to prevent it from going out of the screen
            />
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default ForgotPassword;
