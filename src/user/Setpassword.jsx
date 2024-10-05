import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'; // Import icons from react-icons
import Logo1 from './../assets/Logos/CUPLLogoTheme.png'; // Import logo from assets
import themeStore from './../store/themeStore'; // Import theme store
import { useStore } from 'zustand'; // Import zustand store
import { useMediaQuery } from 'react-responsive'; // Importing useMediaQuery react-responsive library
import { ToastContainer, toast } from 'react-toastify'; // Import react-toastify
import BackgroundImage from './../assets/bgImages/Factory-pana.svg'; // Replace with your background image

const SetPassword = () => {
  // State for password visibility and value
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Theme Change Section
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customBtn = cssClasses[3];
  const customDarkText = cssClasses[4];

  // Media Query: true if screen width is less than or equal to 992px
  const isMediumOrSmaller = useMediaQuery({ query: '(max-width: 992px)' });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // Here you would handle the password update logic
    toast.success("Password set successfully!");
  };

  return (
    <Container fluid className="vh-100 position-relative overflow-hidden"
      style={{
        backgroundImage: isMediumOrSmaller ? `url(${BackgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
      <ToastContainer /> {/* Toast container for showing notifications */}

      <Row className="h-100">
        {/* Left side: Image (only visible on large screens) */}
        <Col lg={7} className="d-none d-lg-flex align-items-center justify-content-center p-0">
          <img
            src={BackgroundImage}
            alt="Set Password Theme"
            className="w-100"
            style={{ objectFit: 'contain', maxHeight: '90vh' }} // Adjust as needed
          />
        </Col>

        {/* Right side: Set Password form */}
        <Col lg={5} className={`d-flex align-items-center justify-content-center p-`}
          style={isMediumOrSmaller ? { backdropFilter: 'blur(5px)' } : { background: "#FF725E" }}>
          <div className={`p-4 bg-white rounded-3 border border-5 shadow-lg`}
            style={{
              maxWidth: '400px',
              width: '100%',
              position: 'relative',
              zIndex: 1,
              borderColor:"#FF725E"
            }}>
            {/* Logo */}
            <div className={`text-center mb-4 rounded-3`} style={{ background: "#FF725E" }}>
              <img
                src={Logo1}
                alt="Logo"
                className="img-fluid"
                style={{ maxWidth: '250px' }}
              />
            </div>

            {/* Set Password Form */}
            <Form onSubmit={handleSubmit}>
              <h2 className={`text-center mb-4`}>Set Password</h2>

              <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8} // You can set your desired password length
                  />
                  <span
                    className="position-absolute"
                    style={{ right: '10px', top: '5px', cursor: 'pointer' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <AiFillEye size={20} /> : <AiFillEyeInvisible size={20} />}
                  </span>
                </div>
              </Form.Group>

              <Form.Group controlId="formBasicConfirmPassword" className="mt-3">
                <Form.Label>Confirm Password</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8} // Match the same minimum length as above
                  />
                  <span
                    className="position-absolute"
                    style={{ right: '10px', top: '5px', cursor: 'pointer' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <AiFillEye size={20} /> : <AiFillEyeInvisible size={20} />}
                  </span>
                </div>
              </Form.Group>

              <Button className={`mt-4 w-100 border-0`} style={{ background: "#FF725E" }} type="submit">
                Set Password
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SetPassword;
