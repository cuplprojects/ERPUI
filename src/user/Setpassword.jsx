import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'; // Import icons from react-icons
import Logo1 from './../assets/Logos/CUPLLogoTheme.png'; // Import logo from assets
import { useMediaQuery } from 'react-responsive'; // Importing useMediaQuery react-responsive library
import { ToastContainer, toast } from 'react-toastify'; // Import react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify CSS
import BackgroundImage from './../assets/bgImages/setpass/defaultSetPass.png'; // Replace with your background image

const SetPassword = () => {
  const navigate = useNavigate();

  // Media Query: true if screen width is less than or equal to 992px
  const isMediumOrSmaller = useMediaQuery({ query: '(max-width: 992px)' });

  // State to manage the current step of the form
  const [currentStep, setCurrentStep] = useState('securityQuestions');

  // State for password visibility and values
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State for security questions answers
  const [securityAnswers, setSecurityAnswers] = useState([
    { id: 1, question: "What is your favorite color?", answer: '' },
    { id: 2, question: "What is your mother's maiden name?", answer: '' },
    { id: 3, question: "What was the name of your first school?", answer: '' },
    { id: 4, question: "In what city were you born?", answer: '' },
    { id: 5, question: "What is your favorite food?", answer: '' },
  ]);

  // Handler for Security Questions form submission
  const handleSecurityQuestions = (e) => {
    e.preventDefault();

    // Check if all answers are filled
    for (let i = 0; i < securityAnswers.length; i++) {
      if (!securityAnswers[i].answer.trim()) {
        toast.error(`Please answer the question: "${securityAnswers[i].question}"`);
        return;
      }
    }

    // Here you would handle the security answers update logic (e.g., API call)
    toast.success("Security questions set successfully!", {
      onClose: () => setCurrentStep('setPassword'), // Proceed to next step
      autoClose: 3000,
    });

    // Optionally, reset security answers
    setSecurityAnswers(securityAnswers.map(q => ({ ...q, answer: '' })));
  };

  // Handler for Set Password form submission
  const handleSetPassword = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // Here you would handle the password update logic (e.g., API call)
    toast.success("Password set successfully!", {
      onClose: () => navigate('/dashboard'), // Redirect to dashboard
      autoClose: 3000,
    });

    // Optionally, reset password fields
    setPassword('');
    setConfirmPassword('');
  };

  // Handler to update security answers
  const handleSecurityAnswerChange = (id, value) => {
    const updatedAnswers = securityAnswers.map(q => 
      q.id === id ? { ...q, answer: value } : q
    );
    setSecurityAnswers(updatedAnswers);
  };

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
            className={`p-5 bg-white rounded-4 border shadow-lg custom-zoom-bt` }
            style={{
              maxWidth: '700px', // Increased width to accommodate 5 questions
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

                <Row>
                  {securityAnswers.map((qa, index) => (
                    <Col xs={12} md={6} key={qa.id} className="mb-4 custom-zoom-btn">
                      <Form.Group controlId={`formSecurityQuestion${qa.id}`}>
                        <Form.Label><strong>Question {index + 1}:</strong> {qa.question}</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter Answer"
                          value={qa.answer}
                          onChange={(e) => handleSecurityAnswerChange(qa.id, e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                  ))}
                </Row>

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
              <Form onSubmit={handleSetPassword}>
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
