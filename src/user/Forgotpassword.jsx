import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import brain from "./../assets/bgImages/brain.svg"; // Background image
import Logo1 from "./../assets/Logos/CUPLLogoTheme.png"; // Logo
import { useMediaQuery } from 'react-responsive'; // Importing useMediaQuery react-responsive library

const ForgotPassword = () => {
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

      <Row className="h-100">
        {/* Left side: Forgot Password form */}
        <Col lg={5} className="d-flex align-items-center justify-content-center p-0 " style={{ zIndex: 1 }}>
          <div className="p-2 rounded-3" style={{ maxWidth: '400px', width: '100%' }}>
            {/* Logo */}
            <div className="text-center mb-4 bg-primary rounded-3">
              <img src={Logo1} alt="Company Logo" className="img-fluid" style={{ maxWidth: '250px' }} />
            </div>

            {/* Forgot Password Form */}
            <Form onSubmit={handleSubmit} className='bg-white p-2 rounded-2'>
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
              <Button type="submit" className="w-100 border-0" >
                Reset Password
              </Button>
            </Form>
          </div>
        </Col>

        {/* Right side: Big image */}
        <Col lg={7} className="d-none d-lg-flex align-items-center justify-content-center p-0 position-relative">
          <img
            src={brain}
            alt="Forgot Password Illustration"
            className="w-100 h-100"
            style={{ objectFit: 'cover' }} // Make the image cover the entire column
          />
        </Col>

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
      </Row>
    </Container>
  );
};

export default ForgotPassword;
