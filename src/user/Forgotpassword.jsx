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
import { Link } from 'react-router-dom';

const ForgotPassword = () => {

  // Theme Change Section
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
  const customThead = cssClasses[8];

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
  const [securitySets, setSecuritySets] = useState([
    { question: '', answer: '', enabled: false },
    { question: '', answer: '', enabled: false }
  ]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isConfirmed, setIsConfirmed] = useState(false); // State to track checkbox confirmation

  // Hardcoded questions (will be replaced with API call)
  const securityQuestions = [
    { id: 1, text: "What was the name of your first pet?" },
    { id: 2, text: "What is your mother's maiden name?" },
    { id: 3, text: "What was the name of your elementary school?" },
    { id: 4, text: "In what city were you born?" },
    { id: 5, text: "What is your favorite food?" }
  ];

  const handleQuestionChange = (index, questionId) => {
    const question = securityQuestions.find(q => q.id === questionId);
    const updatedSets = [...securitySets];
    updatedSets[index].question = question.text; // Store the question text
    updatedSets[index].enabled = true;
    setSecuritySets(updatedSets);
    setSelectedQuestions(prev => [...prev, questionId]); // Store the question ID
  };

  const handleAnswerChange = (index, answer) => {
    const updatedSets = [...securitySets];
    updatedSets[index].answer = answer;
    setSecuritySets(updatedSets);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle submission logic (e.g., API call)
    toast.success('Form submitted successfully!', {
      onClose: () => navigate('/'), // Navigate when the toast closes
      autoClose: 3000,
    });
  };

  const isFirstSetFilled = securitySets[0].question && securitySets[0].answer;
  const isSecondSetFilled = securitySets[1].question && securitySets[1].answer;

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
          backgroundImage: `url(${themeImages[customDark] || defaultBrain})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(5px)', // Apply blur to the background image
          zIndex: -1, // Ensure it's behind the form
        }}
          className='' />
      )}

      <Row className="h-100 d-flex align-items-center justify-content-center shadow-lg">
        {/* Left side: Forgot Password form */}
        <Col
          lg={5}
          md={12}
          sm={12}
          className={`d-flex align-items-center justify-content-center p-0 m-0 shadow-lg ${isMediumOrSmaller ? '' : customDark} `}
          style={{ zIndex: 1, height: '100%' }}
        >
          <div className="p-3 rounded-3 shadow-lg" style={{ width: '100%', maxWidth: '450px' }}>
            {/* Logo */}
            <div className={`text-center mb-4 rounded-3 shadow-lg ${customBtn}`}>
              <img src={Logo1} alt="Company Logo" className="img-fluid" style={{ maxWidth: '200px' }} />
            </div>

            {/* Forgot Password Form */}
            <Form onSubmit={handleSubmit} className="bg-white p-3 rounded-2 shadow-sm shadow-lg">
              <h3 className="text-center mb-4">Reset Password</h3>
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

              {userName && securitySets.map((set, index) => (
                <div key={index} className="mb-3">
                  <Form.Group controlId={`formSecurityQuestion${index}`} className="mb-2">
                    <Form.Label>Security Question {index + 1}</Form.Label>
                    <Form.Select
                      value={set.question}
                      onChange={(e) => handleQuestionChange(index, parseInt(e.target.value))}
                      disabled={index > 0 && !securitySets[0].enabled} // Disable second dropdown until the first is filled
                    >
                      <option value="" disabled>Select a security question</option>
                      {securityQuestions
                        .filter((q) => !selectedQuestions.includes(q.id)) // Filter out selected questions
                        .map((q) => (
                          <option key={q.id} value={q.id}>{q.text}</option>
                        ))}
                    </Form.Select>
                  </Form.Group>

                  {set.enabled && (
                    <Form.Group controlId={`formAnswer${index}`} className="mb-2">
                      <Form.Label>Answer</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Answer"
                        value={set.answer}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        required
                      />
                    </Form.Group>
                  )}
                </div>
              ))}

              {/* Checkbox for confirmation, only appears if userName is provided */}
              {userName && (
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="I confirm that I want to reset my password"
                    checked={isConfirmed}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                  />
                </Form.Group>
              )}

              <Button
                type="submit"
                className={`w-100 border-0 ${customBtn}`}
                disabled={!isFirstSetFilled || (securitySets[1].enabled && !isSecondSetFilled) || !isConfirmed} // Disable button based on conditions
              >
                Reset Password
              </Button>
              <div className="text-center mt-3">
                <Link to="/" className={`${customDark === "dark-dark" ? "text-dark" : `${customDarkText}`}`} >Back to login ?</Link>
              </div>
            </Form>
          </div>
        </Col>

        {/* Right side: Big image for Large Screens */}
        {!isMediumOrSmaller && (
          <Col lg={7} className="d-flex align-items-center justify-content-center p-0 position-relative">
            <img
              src={themeImages[customDark] || defaultBrain}
              alt="Forgot Password Illustration"
              className="img-fluid"
              style={{ objectFit: 'contain', maxHeight: '80vh' }} // Limit image height for better responsiveness
            />
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default ForgotPassword;
