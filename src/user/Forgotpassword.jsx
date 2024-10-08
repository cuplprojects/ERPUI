import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
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

  // Define steps: 1 - Enter Username, 2 - Answer Security Questions, 3 - Reset Password
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Enter Username
  const [userName, setUserName] = useState('');

  // Step 2: Security Questions and Answers
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);

  // Step 3: Reset Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Loading States
  const [loading, setLoading] = useState(false);

  // Handle Username Submission and Fetch Security Questions
  const handleUserNameSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      toast.error('Please enter your username');
      return;
    }
    setLoading(true);

    try {
      // Perform GET request to fetch security questions
      const response = await axios.get(`https://localhost:7212/api/Login/forgotPassword/securityQuestions/${userName}`);

      if (response.data && response.data.questions && response.data.questions.length === 2) {
        setSecurityQuestions(response.data.questions);
        setAnswers(['', '']); // Initialize answers array
        setCurrentStep(2); // Move to Step 2
        toast.success('Security questions loaded successfully');
      } else {
        toast.error('No security questions found for this username');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching security questions');
    } finally {
      setLoading(false);
    }
  };

  // Handle Security Answers Submission
  const handleSubmitAnswers = async (e) => {
    e.preventDefault();

    // Validate that all answers are provided
    if (answers.some(answer => !answer.trim())) {
      toast.error('Please answer all security questions');
      return;
    }

    setLoading(true);

    try {
      // Prepare payload with question IDs and answers
      const payload = {
        userName: userName.toLowerCase(),
        securityAnswers: securityQuestions.map((question, index) => ({
          questionId: question.id,
          answer: answers[index].toLowerCase()
        }))
      };

      // Perform POST request to verify security answers
      const response = await axios.post('https://localhost:7212/api/Login/forgotPassword/verifySecurityAnswers', payload);

      if (response.status === 200 && response.data.isValid) {
        setCurrentStep(3); // Move to Step 3
        toast.success('Security answers verified successfully');
      } else {
        toast.error('Incorrect answers, please try again');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error verifying security answers');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset Submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      // Prepare payload with new password
      const payload = {
        userName: userName.toLowerCase(),
        newPassword: newPassword
      };

      // Perform POST request to set new password
      const response = await axios.post('https://localhost:7212/api/Login/forgotPassword/setNewPassword', payload);

      if (response.status === 200) {
        toast.success('Password reset successfully');
        navigate('/login'); // Redirect to login after successful reset
      } else {
        toast.error('Error resetting password');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error submitting new password');
    } finally {
      setLoading(false);
    }
  };

  // Handle Answer Change
  const handleAnswerChange = (index, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  return (
    <Container fluid className="vh-100 position-relative overflow-hidden">
      <ToastContainer className="responsive-toast" />
      {isMediumOrSmaller && (
        <div
          style={{
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
          className={`d-flex align-items-center justify-content-center p-0 m-0 shadow-lg ${isMediumOrSmaller ? '' : customDark}`}
          style={{ zIndex: 1, height: '100%', borderTopRightRadius: "15%", borderBottomRightRadius: "15%" }}
        >
          <div className="p-3 rounded-5 shadow-lg" style={{ width: '100%', maxWidth: '450px' }}>
            <div className={`text-center mb-2 rounded-3 ${customBtn}`}>
              <img src={Logo1} alt="Company Logo" className="img-fluid" style={{ maxWidth: '150px' }} />
            </div>

            {/* Step 1: Enter Username */}
            {currentStep === 1 && (
              <Form onSubmit={handleUserNameSubmit} className="bg-white p-3 rounded-4 shadow-sm shadow-lg">
                <h3 className="text-center mb-4">Reset Password</h3>
                <Form.Group controlId="formBasicUserName" className="mb-3">
                  <Form.Label>Enter Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className={`w-100 border-0 ${customBtn} custom-zoom-btn`}
                  disabled={loading}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : 'Submit Username'}
                </Button>
              </Form>
            )}

            {/* Step 2: Answer Security Questions */}
            {currentStep === 2 && (
              <Form onSubmit={handleSubmitAnswers} className="bg-white p-3 rounded-4 shadow-sm shadow-lg">
                <h3 className="text-center mb-4">Answer Security Questions</h3>
                {securityQuestions.map((question, index) => (
                  <Form.Group controlId={`securityQuestion${index}`} className="mb-3" key={question.id}>
                    <Form.Label>{`Question ${index + 1}: ${question.questionText}`}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Your Answer"
                      value={answers[index]}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      required
                    />
                  </Form.Group>
                ))}

                <Button
                  type="submit"
                  className={`w-100 border-0 ${customBtn} custom-zoom-btn`}
                  disabled={loading}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : 'Submit Answers'}
                </Button>
              </Form>
            )}

            {/* Step 3: Reset Password */}
            {currentStep === 3 && (
              <Form onSubmit={handlePasswordSubmit} className="bg-white p-3 rounded-4 shadow-sm shadow-lg">
                <h3 className="text-center mb-4">Set New Password</h3>
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
                  disabled={
                    loading ||
                    newPassword.length < 8 ||
                    confirmPassword.length < 8 ||
                    newPassword !== confirmPassword
                  }
                >
                  {loading ? <Spinner animation="border" size="sm" /> : 'Reset Password'}
                </Button>
              </Form>
            )}

            <div className="text-center mt-3 custom-zoom-btn">
              <Link to="/" className={`${customDark === "dark-dark" ? "text-light" : `text-light`} `}>
                Back to login
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
