import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import Logo1 from './../assets/Logos/CUPLLogoTheme.png';
import { useMediaQuery } from 'react-responsive';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BackgroundImage from './../assets/bgImages/setpass/defaultSetPass.png';
import { jwtDecode } from 'jwt-decode';
import API from '../CustomHooks/MasterApiHooks/api';


const SetPassword = () => {
  const navigate = useNavigate();

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isMediumOrSmaller = useMediaQuery({ query: '(max-width: 992px)' });
  const [currentStep, setCurrentStep] = useState('securityQuestions');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState({
    first: { questionId: '', question: '', answer: '' },
    second: { questionId: '', question: '', answer: '' },
  });

  const userToken = localStorage.getItem('authToken');
  const decodedToken = jwtDecode(userToken);
  const [, userIdApi] = Object.entries(decodedToken)[0];

  useEffect(() => {
    API.get('/SecurityQuestions')
      .then(response => {
        console.log('API response:', response.data);
        setSecurityQuestions(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);


  const handleQuestionSelect = (key, questionId) => {
    setSelectedQuestions({
      ...selectedQuestions,
      [key]: {
        questionId: questionId,
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

  const handleSecurityQuestions = (e) => {
    e.preventDefault();

    if (!selectedQuestions.first.answer.trim() || !selectedQuestions.second.answer.trim()) {
      toast.error("Please answer both security questions!");
      return;
    }

    API.post('/Login/setSecurityAnswers', {
      userId: userIdApi,
      securityQuestion1Id: selectedQuestions.first.questionId,
      securityAnswer1: selectedQuestions.first.answer,
      securityQuestion2Id: selectedQuestions.second.questionId,
      securityAnswer2: selectedQuestions.second.answer,
    })
      .then((response) => {
        if (response.status === 200) {
          setCurrentStep('setPassword'); // Move to next step immediately
          toast.success("Security questions set successfully!", {
            autoClose: 3000,
          });
        } else {
          toast.error("Failed to set security questions.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while setting security questions.");
      });


    setSelectedQuestions({
      first: { questionId: '', question: '', answer: '' },
      second: { questionId: '', question: '', answer: '' },
    });
  };

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

    API.put('/Login/SetPassword', newPasswordData)
      .then((response) => {
        if (response.status === 200) {
          toast.success("Password set successfully!", {

            onClose: () => navigate('/'), // Redirect to dashboard
            autoClose: 3000,

          });
        } else {
          toast.error("Failed to set password.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while setting password.");
      });


    setPassword('');
    setConfirmPassword('');
  };



  const availableQuestionsForSecond = securityQuestions.filter(q => q.questionId !== parseInt(selectedQuestions.first.questionId));


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
      <ToastContainer autoClose={1500}/>

      <Row className="h-100">
        <Col lg={6} className="d-none d-lg-flex align-items-center justify-content-center p-0" >
          <img
            src={BackgroundImage}
            alt="Set Password Theme"
            className="w-100"
            style={{ objectFit: 'contain', maxHeight: '90vh' }}
          />
        </Col>

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
            <div className="text-center mb-4">
              <img
                src={Logo1}
                alt="Logo"
                className="img-fluid rounded-3"
                style={{ maxWidth: '250px', backgroundColor: '#37474f', padding: '10px', borderRadius: '10px' }}
              />
            </div>

            {currentStep === 'securityQuestions' && (
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

                    {availableQuestionsForSecond.map(q => (
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
                      minLength={8}
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
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <span
                      className="position-absolute"
                      style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <AiFillEye size={20} /> : <AiFillEyeInvisible size={20} />}
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
