// import React, { useState } from 'react';
// import { Container, Row, Col, Form, Button } from 'react-bootstrap';
// import { useNavigate, Link } from 'react-router-dom';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Logo1 from "./../assets/Logos/CUPLLogoTheme.png"; // Logo
// import { useMediaQuery } from 'react-responsive'; // Importing useMediaQuery react-responsive library
// import themeStore from './../store/themeStore'; // Import theme store
// import { useStore } from 'zustand'; // Import zustand store
// import redBrain from "./../assets/bgImages/brain/brainRed.png";
// import greenBrain from "./../assets/bgImages/brain/brainGreen.png";
// import blueBrain from "./../assets/bgImages/brain/brainBlue.png";
// import pinkBrain from "./../assets/bgImages/brain/brainPink.png";
// import purpleBrain from "./../assets/bgImages/brain/brainPurple.png";
// import darkBrain from "./../assets/bgImages/brain/brainDark.png";
// import brownBrain from "./../assets/bgImages/brain/brainBrown.png";
// import lightBrain from "./../assets/bgImages/brain/brainLight.png";
// import defaultBrain from "./../assets/bgImages/brain/brainDefault.png";

// const ForgotPassword = () => {
//   // Theme Change Section
//   const { getCssClasses } = useStore(themeStore);
//   const cssClasses = getCssClasses();
//   const customDark = cssClasses[0];
//   const customMid = cssClasses[1];
//   const customLight = cssClasses[2];
//   const customBtn = cssClasses[3];
//   const customDarkText = cssClasses[4];
//   const customLightText = cssClasses[5];
//   const customLightBorder = cssClasses[6];
//   const customDarkBorder = cssClasses[7];
//   const customThead = cssClasses[8];

//   const themeImages = {
//     "purple-dark": purpleBrain,
//     "blue-dark": blueBrain,
//     "green-dark": greenBrain,
//     "red-dark": redBrain,
//     "dark-dark": darkBrain,
//     "light-dark": lightBrain,
//     "pink-dark": pinkBrain,
//     "brown-dark": brownBrain,
//     "default": defaultBrain
//   };

//   const navigate = useNavigate();
//   const isMediumOrSmaller = useMediaQuery({ query: '(max-width: 992px)' });

//   const [userName, setUserName] = useState('');
//   const [securitySets, setSecuritySets] = useState([
//     { questionId: null, answer: '', enabled: false },
//     { questionId: null, answer: '', enabled: false }
//   ]);
//   const [isConfirmed, setIsConfirmed] = useState(false); // State to track checkbox confirmation

//   // Hardcoded questions (will be replaced with API call)
//   const securityQuestions = [
//     { id: 1, text: "What was the name of your first pet?" },
//     { id: 2, text: "What is your mother's maiden name?" },
//     { id: 3, text: "What was the name of your elementary school?" },
//     { id: 4, text: "In what city were you born?" },
//     { id: 5, text: "What is your favorite food?" }
//   ];

//   const handleQuestionChange = (index, questionId) => {
//     const updatedSets = [...securitySets];
//     updatedSets[index].questionId = questionId;
//     // Optionally reset the answer when question changes
//     updatedSets[index].answer = '';
//     if (index > 0 && !updatedSets[index - 1].answer) {
//       // If the previous set's answer is not filled, do not enable the next set
//       updatedSets[index].enabled = false;
//     } else {
//       updatedSets[index].enabled = true;
//     }
//     setSecuritySets(updatedSets);
//   };

//   const handleAnswerChange = (index, answer) => {
//     const updatedSets = [...securitySets];
//     updatedSets[index].answer = answer;
//     setSecuritySets(updatedSets);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Handle submission logic (e.g., API call)
//     toast.success('Form submitted successfully!', {
//       onClose: () => navigate('/'), // Navigate when the toast closes
//       autoClose: 3000,
//     });
//   };

//   const isFirstSetFilled = securitySets[0].questionId && securitySets[0].answer;
//   const isSecondSetFilled = securitySets[1].questionId && securitySets[1].answer;

//   return (
//     <Container fluid className="vh-100 position-relative overflow-hidden">
//       <ToastContainer className="responsive-toast" /> {/* Toast container for showing notifications */}

//       {/* Background Image for Medium and Smaller Screens */}
//       {isMediumOrSmaller && (
//         <div style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundImage: `url(${themeImages[customDark] || defaultBrain})`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//           filter: 'blur(5px)', // Apply blur to the background image
//           zIndex: -1, // Ensure it's behind the form
//         }}
//         />
//       )}

//       <Row className="h-100 d-flex align-items-center justify-content-center shadow-lg">
//         {/* Left side: Forgot Password form */}
//         <Col
//           lg={5}
//           md={12}
//           sm={12}
//           className={`d-flex align-items-center justify-content-center p-0 m-0 shadow-lg ${isMediumOrSmaller ? '' : customDark} `}
//           style={{ zIndex: 1, height: '100%',borderTopRightRadius:"15%",borderBottomRightRadius:"15%" }}
//         >
//           <div className="p-3 rounded-5 shadow-lg " style={{ width: '100%', maxWidth: '450px' }}>
//             {/* Logo */}
//             <div className={`text-center mb-2 rounded-3  ${customBtn}`}>
//               <img src={Logo1} alt="Company Logo" className="img-fluid" style={{ maxWidth: '150px' }} />
//             </div>

//             {/* Forgot Password Form */}
//             <Form onSubmit={handleSubmit} className="bg-white p-3 rounded-4 shadow-sm shadow-lg ">
//               <h3 className="text-center mb-">Reset Password</h3>
//               <Form.Group controlId="formBasicUserName" className="mb-3">
//                 <Form.Label>Enter User Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   placeholder="Enter User Name"
//                   value={userName}
//                   onChange={(e) => setUserName(e.target.value)}
//                   required
//                 />
//               </Form.Group>

//               {/* Keep both sets visible */}
//               {securitySets.map((set, index) => (
//                 <div key={index} className="mb-3">
//                   <Form.Group controlId={`formSecurityQuestion${index}`} className="mb-2 custom-zoom-btn">
//                     <Form.Label>Security Question {index + 1}</Form.Label>
//                     <Form.Select
//                       value={set.questionId || ""}
//                       onChange={(e) => handleQuestionChange(index, parseInt(e.target.value))}
//                       disabled={index > 0 && !securitySets[index - 1].enabled} // Disable second dropdown until the first is filled
//                     >
//                       <option value="" disabled>Select a security question</option>
//                       {securityQuestions
//                         .filter(q => 
//                           // Exclude questions selected in other sets
//                           !securitySets.some((s, i) => s.questionId === q.id && i !== index)
//                         )
//                         .map(q => (
//                           <option key={q.id} value={q.id}>{q.text}</option>
//                         ))}
//                     </Form.Select>
//                   </Form.Group>

//                   {set.questionId && (
//                     <Form.Group controlId={`formAnswer${index}`} className="mb-2 custom-zoom-btn">
//                       <Form.Label>Answer</Form.Label>
//                       <Form.Control
//                         type="text"
//                         placeholder="Enter Answer"
//                         value={set.answer}
//                         onChange={(e) => handleAnswerChange(index, e.target.value)}
//                         required
//                       />
//                     </Form.Group>
//                   )}
//                 </div>
//               ))}

//               {/* Checkbox for confirmation */}
//               <Form.Group className="mb-3">
//                 <Form.Check
//                   type="checkbox"
//                   label="I confirm that I want to reset my password"
//                   checked={isConfirmed}
//                   onChange={(e) => setIsConfirmed(e.target.checked)}
//                   className='custom-zoom-btn'
//                 />
//               </Form.Group>

//               <Button
//                 type="submit"
//                 className={`w-100 border-0 ${customBtn} custom-zoom-btn`}
//                 disabled={!isFirstSetFilled || (securitySets[1].enabled && !isSecondSetFilled) || !isConfirmed} // Disable button based on conditions
//               >
//                 Reset Password
//               </Button>
//               <div className="text-center mt-3 custom-zoom-btn">
//                 <Link to="/" className={`${customDark === "dark-dark" ? "text-dark" : `${customDarkText}`} `}>
//                   Back to login ?
//                 </Link>
//               </div>
//             </Form>
//           </div>
//         </Col>

//         {/* Right side: Big image for Large Screens */}
//         {!isMediumOrSmaller && (
//           <Col lg={7} className="d-flex align-items-center justify-content-center p-0 position-relative">
//             <img
//               src={themeImages[customDark] || defaultBrain}
//               alt="Forgot Password Illustration"
//               className="img-fluid"
//               style={{ objectFit: 'contain', maxHeight: '80vh' }} // Limit image height for better responsiveness
//             />
//           </Col>
//         )}
//       </Row>
//     </Container>
//   );
// };

// export default ForgotPassword;
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios'; // Import axios for API calls
import 'react-toastify/dist/ReactToastify.css';
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
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [answers, setAnswers] = useState(['', '']);
  const [isConfirmed, setIsConfirmed] = useState(false);
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
      const response = await axios.get(`/api/security-questions?username=${userName.toLowerCase()}`);
      if (response.data && response.data.questions) {
        setSecurityQuestions(response.data.questions); // Update with fetched questions
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

  // Handle Answer Changes
  const handleAnswerChange = (index, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  // Handle Form Submission (POST answers)
  const handleSubmitAnswers = async (e) => {
    e.preventDefault();
    
    if (!isConfirmed) {
      toast.error('Please confirm to proceed');
      return;
    }

    try {
      const response = await axios.post('/api/submit-answers', {
        username: userName.toLowerCase(),
        answers: answers.map(answer => answer.toLowerCase()),
      });
      
      if (response.status === 200) {
        toast.success('Answers submitted successfully');
        navigate('/reset-password'); // Redirect after success
      } else {
        toast.error('Incorrect answers, please try again');
      }
    } catch (error) {
      toast.error('Error submitting answers');
    }
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
          backgroundImage: `url(${themeImages[customDark] || defaultBrain})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(5px)', // Apply blur to the background image
          zIndex: -1, // Ensure it's behind the form
        }}
        />
      )}

      <Row className="h-100 d-flex align-items-center justify-content-center shadow-lg">
        {/* Left side: Forgot Password form */}
        <Col
          lg={5}
          md={12}
          sm={12}
          className={`d-flex align-items-center justify-content-center p-0 m-0 shadow-lg ${isMediumOrSmaller ? '' : customDark} `}
          style={{ zIndex: 1, height: '100%', borderTopRightRadius: "15%", borderBottomRightRadius: "15%" }}
        >
          <div className="p-3 rounded-5 shadow-lg" style={{ width: '100%', maxWidth: '450px' }}>
            {/* Logo */}
            <div className={`text-center mb-2 rounded-3 ${customBtn}`}>
              <img src={Logo1} alt="Company Logo" className="img-fluid" style={{ maxWidth: '150px' }} />
            </div>

            {/* Username Submission Form */}
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

            {/* Display Security Questions and Answers if fetched */}
            {securityQuestions.length > 0 && (
              <Form onSubmit={handleSubmitAnswers} className="bg-white p-3 rounded-4 shadow-sm shadow-lg mt-4">
                {securityQuestions.map((question, index) => (
                  <Form.Group controlId={`formAnswer${index}`} className="mb-3" key={question.id}>
                    <Form.Label>{question.text}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Answer"
                      value={answers[index] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      required
                    />
                  </Form.Group>
                ))}

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="I confirm that I want to reset my password"
                    checked={isConfirmed}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                    className='custom-zoom-btn'
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className={`w-100 border-0 ${customBtn} custom-zoom-btn`}
                  disabled={!isConfirmed || answers.some(answer => !answer)}
                >
                  Submit Answers
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
