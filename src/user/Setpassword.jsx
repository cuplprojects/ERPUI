import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'; // Import icons from react-icons
import Logo1 from './../assets/Logos/CUPLLogoTheme.png'; // Import logo from assets
import { useMediaQuery } from 'react-responsive'; // Importing useMediaQuery react-responsive library
import { ToastContainer, toast } from 'react-toastify'; // Import react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify CSS
import BackgroundImage from './../assets/bgImages/setpass/defaultSetPass.png'; // Replace with your background image
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
const SetPassword = () => {
  const navigate = useNavigate();
  const isMediumOrSmaller = useMediaQuery({ query: '(max-width: 992px)' });
  // State to manage the current step of the form
  const [currentStep, setCurrentStep] = useState('securityQuestions');
  // State for password visibility and values
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState({
    first: { questionId: '', question: '', answer: '' },
    second: { questionId: '', question: '', answer: '' },
  });
  //get user id here -->
  const userToken = localStorage.getItem('authToken');
  const authToken = userToken; // assume you have the token stored in a variable
  const decodedToken = jwtDecode(authToken);
  const [firstKey, userIdApi] = Object.entries(decodedToken)[0]; // extract the userId from the decoded token
  // console.log("user id with token -",userIdApi)//console for checking user  id with token
  useEffect(() => {
    axios.get('https://localhost:7212/api/SecurityQuestions')
      .then(response => {
        console.log('API response:', response.data);
        setSecurityQuestions(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  // Handler to update the selected question and its answer
  const handleQuestionSelect = (key, questionId) => {
    const question = securityQuestions.find(q => q.id === parseInt(questionId));
    setSelectedQuestions({
      ...selectedQuestions,
      [key]: {
        questionId: question?.id,
        question: question?.question,
        answer: ''
      }
    });
  };

  const handleAnswerChange = (key, value) => {
    setSelectedQuestions({
      ...selectedQuestions,
      [key]: {
        ...selectedQuestions[key],
        answer: value
      }
    });
  };

  // Handler for Security Questions form submission

  const handleSecurityQuestions = (e) => {
    e.preventDefault();

    // Ensure both questions are selected and answered
    if (!selectedQuestions.first.answer.trim() || !selectedQuestions.second.answer.trim()) {
      toast.error("Please answer both security questions!");
      return;
    }
    axios.post('https://localhost:7212/api/Login/setSecurityAnswers', {
      userId: userIdApi,
      securityQuestion1Id: selectedQuestions.first.questionId,
      securityAnswer1: selectedQuestions.first.answer,
      securityQuestion2Id: selectedQuestions.second.questionId,
      securityAnswer2: selectedQuestions.second.answer,
    })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Security questions set successfully!", {
            onClose: () => setCurrentStep('setPassword'), // Proceed to next step
            autoClose: 3000,
          });
        } else {
          toast.error("Failed to set security questions.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while setting security questions.");
      });

    // Optionally, reset the selected questions
    setSelectedQuestions({
      first: { questionId: '', question: '', answer: '' },
      second: { questionId: '', question: '', answer: '' },
    });
  };
  // Handler for Set Password form submission
  const handleSetPassword = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const newPasswordData = {
      userId: userIdApi,
      newPassword: password,
    };

    axios.put('https://localhost:7212/api/Login/SetPassword', newPasswordData)
      .then((response) => {
        if (response.status === 200) {
          toast.success("Password set successfully!", {
            onClose: () => navigate('/dashboard'), // Redirect to dashboard
            autoClose: 3000,
          });
        } else {
          toast.error("Failed to set password.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while setting password.");
      });

    // Optionally, reset password fields
    setPassword('');
    setConfirmPassword('');
  };

  // Get the remaining questions for the second dropdown (those not selected in the first dropdown)
  const availableQuestionsForSecond = securityQuestions.filter(q => q.id !== parseInt(selectedQuestions.first.questionId));

  return (
    <Container
      fluid
      className="vh-100 position-relative overflow-hidden"
      style={{
        backgroundImage: isMediumOrSmaller ? `url(${BackgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <ToastContainer /> {/* Toast container for showing notifications */}

      <Row className="h-100">
        {/* Left side: Image (only visible on large screens) */}
        <Col lg={6} className="d-none d-lg-flex align-items-center justify-content-center p-0" >
          <img
            src={BackgroundImage}
            alt="Set Password Theme"
            className="w-100"
            style={{ objectFit: 'contain', maxHeight: '90vh' }} // Adjust as needed
          />
        </Col>

        {/* Right side: Form Column */}
        <Col
          lg={6}
          className={`d-flex align-items-center shadow-lg justify-content-center p-0`}
          style={{
            borderTopLeftRadius: "10%",
            borderBottomLeftRadius: "10%",
            ...(isMediumOrSmaller ? { backdropFilter: 'blur(5px)' } : { backgroundColor: '#37474f' })
          }}
        >
          <div
            className={`p-5 bg-white rounded-4 border shadow-lg custom-zoom-bt`}
            style={{
              maxWidth: '700px',
              width: '100%',
              position: 'relative',
              zIndex: 1,
              borderColor: "#ccc",
            }}
          >
            {/* Logo */}
            <div className="text-center mb-4">
              <img
                src={Logo1}
                alt="Logo"
                className="img-fluid rounded-3"
                style={{ maxWidth: '250px', backgroundColor: '#37474f', padding: '10px', borderRadius: '10px' }}
              />
            </div>

            {/* Conditional Rendering Based on Current Step */}
            {currentStep === 'securityQuestions' && (
              /* Security Questions Form */
              <Form onSubmit={handleSecurityQuestions}>
                <h2 className="text-center mb-4">Security Questions</h2>

                <Form.Group className="mb-4">
                  <Form.Label><strong>Select First Security Question</strong></Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedQuestions.first.questionId}
                    onChange={(e) => handleQuestionSelect('first', e.target.value)}
                    required
                  >
                    <option value="">Select a question</option>
                    {securityQuestions.map(q => (
                      <option key={q.questionId} value={q.questionId}>{q.securityQuestions}</option>
                    ))}
                  </Form.Control>
                  <Form.Control
                    type="text"
                    placeholder="Enter Answer"
                    value={selectedQuestions.first.answer}
                    onChange={(e) => handleAnswerChange('first', e.target.value)}
                    required
                    className="mt-2"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label><strong>Select Second Security Question</strong></Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedQuestions.second.questionId}
                    onChange={(e) => handleQuestionSelect('second', e.target.value)}
                    required
                  >
                    <option value="">Select a question</option>
                    {securityQuestions
                      .filter(q => q.questionId !== parseInt(selectedQuestions.first.questionId)) // Filter out the first question
                      .map(q => (
                        <option key={q.questionId} value={q.questionId}>{q.securityQuestions}</option>
                      ))}
                  </Form.Control>
                  <Form.Control
                    type="text"
                    placeholder="Enter Answer"
                    value={selectedQuestions.second.answer}
                    onChange={(e) => handleAnswerChange('second', e.target.value)}
                    required
                    className="mt-2"
                  />
                </Form.Group>
                <Button
                  className="mt-3 w-100 border-0 custom-zoom-btn"
                  style={{ background: "#37474f", padding: '10px 0', fontSize: '16px' }}
                  type="submit"
                >
                  Submit Answers
                </Button>
              </Form>
            )}
            {currentStep === 'setPassword' && (
              /* Set Password Form */
              <Form onSubmit={handleSetPassword} className=''>
                <h2 className="text-center mb-4">Set Password</h2>

                <Form.Group controlId="formBasicPassword" className='custom-zoom-btn'>
                  <Form.Label><strong>Password</strong></Form.Label>
                  <div className="position-relative ">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter New Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8} // You can set your desired password length
                      className=''
                    />
                    <span
                      className="position-absolute "
                      style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <AiFillEye size={20} /> : <AiFillEyeInvisible size={20} />}
                    </span>
                  </div>
                </Form.Group>

                <Form.Group controlId="formBasicConfirmPassword" className="mt-4 custom-zoom-btn">
                  <Form.Label><strong>Confirm Password</strong></Form.Label>
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
                      style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <AiFillEye size={20} /> : <AiFillEyeInvisible size={20} />}
                    </span>
                  </div>
                </Form.Group>

                <Button
                  className="mt-4 w-100 border-0 custom-zoom-btn"
                  style={{ background: "#37474f", padding: '10px 0', fontSize: '16px' }}
                  type="submit"
                >
                  Set Password
                </Button>
              </Form>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SetPassword;

