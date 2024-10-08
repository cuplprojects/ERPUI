import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { useMediaQuery } from 'react-responsive';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import Logo1 from "./../assets/Logos/CUPLLogoTheme.png";
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

  const navigate = useNavigate();
  const isMediumOrSmaller = useMediaQuery({ query: '(max-width: 992px)' });
  const [userName, setUserName] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [answers, setAnswers] = useState(['', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Handle Username Submission and Fetch Security Questions
  const handleUserNameSubmit = async (e) => {
    e.preventDefault();
    if (!userName) {
      toast.error('Please enter your username');
      return;
    }
    setLoadingQuestions(true);

    try {
      // This is the API call that performs both the question retrieval and password reset.
      const response = await axios.post('https://localhost:7212/api/Login/forgotPassword', {
        userName: userName.toLowerCase(),
        securityAnswer1: answers[0].toLowerCase(),
        securityAnswer2: answers[1].toLowerCase(),
        newPassword: ""
      });

      if (response.data && response.data.questions) {
        setSecurityQuestions(response.data.questions);
        setLoadingQuestions(false);
        toast.success('Security questions loaded successfully');
      } else {
        toast.error('No security questions found for this username');
        setLoadingQuestions(false);
      }
    } catch (error) {
      toast.error('Error fetching security questions');
      setLoadingQuestions(false);
    }
  };

  // Handle Answer Submission
  const handleSubmitAnswers = async (e) => {
    e.preventDefault();
    if (!isConfirmed) {
      toast.error('Please confirm to proceed');
      return;
    }

    try {
      const response = await axios.post('https://localhost:7212/api/Login/forgotPassword', {
        userName: userName.toLowerCase(),
        securityAnswer1: answers[0].toLowerCase(),
        securityAnswer2: answers[1].toLowerCase(),
        newPassword: "" // No new password yet
      });

      if (response.status === 200) {
        toast.success('Answers submitted successfully');
        setShowPasswordFields(true); // Show password fields upon success
      } else {
        toast.error('Incorrect answers, please try again');
      }
    } catch (error) {
      toast.error('Error submitting answers');
    }
  };

  // Handle Password Submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('https://localhost:7212/api/Login/forgotPassword', {
        userName: userName.toLowerCase(),
        securityAnswer1: answers[0].toLowerCase(),
        securityAnswer2: answers[1].toLowerCase(),
        newPassword: newPassword // Send the new password to the API
      });

      if (response.status === 200) {
        toast.success('Password reset successfully');
        navigate('/login'); // Redirect to login after successful reset
      } else {
        toast.error('Error resetting password');
      }
    } catch (error) {
      toast.error('Error submitting new password');
    }
  };

  return (
    <Container fluid className="vh-100 position-relative overflow-hidden">
      <ToastContainer className="responsive-toast" />
      {isMediumOrSmaller && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${themeImages[customDark] || defaultBrain})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(5px)',
          zIndex: -1,
        }}
        />
      )}
      <Row className="h-100 d-flex align-items-center justify-content-center shadow-lg">
        <Col
          lg={5}
          md={12}
          sm={12}
          className={`d-flex align-items-center justify-content-center p-0 m-0 shadow-lg ${isMediumOrSmaller ? '' : customDark} `}
          style={{ zIndex: 1, height: '100%', borderTopRightRadius: "15%", borderBottomRightRadius: "15%" }}
        >
          <div className="p-3 rounded-5 shadow-lg" style={{ width: '100%', maxWidth: '450px' }}>
            <div className={`text-center mb-2 rounded-3 ${customBtn}`}>
              <img src={Logo1} alt="Company Logo" className="img-fluid" style={{ maxWidth: '150px' }} />
            </div>

            {!showPasswordFields ? (
              <Form onSubmit={handleUserNameSubmit} className="bg-white p-3 rounded-4 shadow-sm shadow-lg">
                <h3 className="text-center mb-">Reset Password</h3>
                <Form.Group controlId="formBasicUserName" className="mb-3">
                  <Form.Label>Enter User Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter User Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className={`w-100 border-0 ${customBtn} custom-zoom-btn`}
                  disabled={loadingQuestions}
                >
                  {loadingQuestions ? 'Loading Questions...' : 'Submit Username'}
                </Button>
              </Form>
            ) : (
              <Form onSubmit={handlePasswordSubmit} className="bg-white p-3 rounded-4 shadow-sm shadow-lg mt-4">
                <Form.Group controlId="formNewPassword" className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength="8"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formConfirmPassword" className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength="8"
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className={`w-100 border-0 ${customBtn} custom-zoom-btn`}
                  disabled={newPassword.length < 8 || confirmPassword.length < 8 || newPassword !== confirmPassword}
                >
                  Reset Password
                </Button>
              </Form>
            )}

            <div className="text-center mt-3 custom-zoom-btn">
              <Link to="/" className={`${customDark === "dark-dark" ? "text-light" : `text-light`} `}>
                Back to login ?
              </Link>
            </div>
          </div>
        </Col>
        {!isMediumOrSmaller && (
          <Col lg={7} className="d-flex align-items-center justify-content-center p-0 position-relative">
            <img
              src={themeImages[customDark] || defaultBrain}
              alt="Forgot Password Illustration"
              className="img-fluid"
              style={{ objectFit: 'contain', maxHeight: '80vh' }}
            />
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default ForgotPassword;
