import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import BlueTheme from './../assets/bgImages/Factory.svg';
import PurpleTheme from './../assets/bgImages/FactoryPurple.png';
import DefaultTheme from './../assets/bgImages/FactoryDefault.png';
import GreenTheme from './../assets/bgImages/FactoryGreen.png';
import RedTheme from './../assets/bgImages/FactoryRed.png';
import DarkTheme from './../assets/bgImages/FactoryDark.png';
import BrownTheme from './../assets/bgImages/FactoryBrown.png';
import PinkTheme from './../assets/bgImages/FactoryPink.png';
import LightTheme from './../assets/bgImages/FactoryLight.png';
import Logo1 from './../assets/Logos/CUPLLogoTheme.png';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from 'react-i18next';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from 'axios'; 
import AuthService from '../CustomHooks/ApiServices/AuthService';

const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = AuthService;
  const { t } = useTranslation();

  // Theme Change Section
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customBtn = cssClasses[3];
  const customDarkText = cssClasses[4];
  const customLightText = cssClasses[5];
  const customLightBorder = cssClasses[6];
  const customDarkBorder = cssClasses[7];
  const customThead = cssClasses[8];

  const themeImages = {
    "purple-dark": PurpleTheme,
    "blue-dark": BlueTheme,
    "green-dark": GreenTheme,
    "red-dark": RedTheme,
    "dark-dark": DarkTheme,
    "light-dark": LightTheme,
    "pink-dark": PinkTheme,
    "brown-dark": BrownTheme,
    default: DefaultTheme,
  };

  const isMediumOrSmaller = useMediaQuery({ query: "(max-width: 992px)" });
  const isTabletPortrait = useMediaQuery({
    query: "(max-width: 768px) and (orientation: portrait)",
  });

  const appliedClass = !isMediumOrSmaller ? customDark : "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      toast.info("Processing...", {
        autoClose: 2000,
        toastId: "processing",
      });

      const response = await axios.post('https://localhost:7212/api/Login/login', {
        userName,
        password
      });

      if (response.status === 200) {
        toast.dismiss("processing");
        toast.success("Successfully logged in!");

        const { token, autogenPass } = response.data;

        if (token) {
          localStorage.setItem('authToken', token);
          
          if (autogenPass) {
            setTimeout(() => {
              navigate('/setpassword');
            }, 1500);
          } else {
            setTimeout(() => {
              navigate('/dashboard');
            }, 1500);
          }
        } else {
          toast.error("Authentication token not found in the response.");
          return;
        }
      } else {
        toast.dismiss("processing");
        toast.error("Unexpected response from the server.");
      }
    } catch (error) {
      toast.dismiss("processing");

      if (error.response) {
        switch (error.response.status) {
          case 400:
            toast.error("Bad Request. Please check your input.");
            break;
          case 401:
            toast.error("Unauthorized. Invalid User ID or Password.");
            break;
          case 403:
            toast.error("Forbidden. You do not have access.");
            break;
          case 404:
            toast.error("API Endpoint Not Found.");
            break;
          case 500:
            toast.error("Server Error. Please try again later.");
            break;
          default:
            toast.error(
              `Error: ${error.response.data.message || "An error occurred."}`
            );
        }
      } else if (error.request) {
        toast.error("No response from the server. Please check your network.");
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    if (localStorage.getItem('loggedOut')) {
      toast.success('Successfully logged out!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      localStorage.removeItem('loggedOut');
    }
  }, []);

  return (
    <Container fluid className="vh-100 position-relative overflow-hidden">
      <ToastContainer />
      {isTabletPortrait && (
        <img
          src={themeImages[customDark] || DefaultTheme}
          alt="Background Image"
          className={`position-absolute w-100 h-100 `}
          style={{
            objectFit: "cover",
            zIndex: -1,
            filter: "blur(8px)",
            top: 0,
            left: 0,
          }}
        />
      )}
      <Row className="h-100">
        <Col
          lg={7}
          className="d-none d-lg-flex align-items-center justify-content-center p-0"
        >
          <img
            src={themeImages[customDark] || DefaultTheme}
            alt="Login Theme"
            className="w-100"
            style={{ objectFit: "contain", maxHeight: "90vh" }}
          />
        </Col>

        <Col lg={5} md={12} className={`d-flex align-items-center justify-content-center ${appliedClass}`} style={{ borderTopLeftRadius: "15%", borderBottomLeftRadius: "15%" }}>
          <div className={`shadow-lg rounded-5 custom-zoom-btn p-3 ${customDark === "dark-dark" ? `${customMid}` : ""}`} style={{ maxWidth: '450px', width: '100%', position: 'relative', zIndex: 1 }}>
            <div className={`text-center mb-4 ${customDark} rounded-3`}>
              <img
                src={Logo1}
                alt="Logo"
                className="img-fluid"
                style={{ maxWidth: "250px" }}
              />
            </div>

            <Form className="p-4 bg-white rounded-3" onSubmit={handleSubmit}>
              <h2
                className={`text-center mb-4 ${
                  customDark === "dark-dark" ? "" : `${customDarkText}`
                }`}
              >
                {t('webtitle')}
              </h2>

              <Form.Group controlId="formBasicuserName">
                <Form.Label>User ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter User ID"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formBasicPassword" className="mt-3">
                <Form.Label>Password</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                  <span
                    className="position-absolute"
                    style={{ right: "10px", top: "5px", cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <AiFillEye size={20} />
                    ) : (
                      <AiFillEyeInvisible size={20} />
                    )}
                  </span>
                </div>
              </Form.Group>

              <Button
                className={`${customBtn} mt-4 w-100 ${
                  customDark === "dark-dark" ? "border-white " : "border-0 "
                } custom-zoom-btn `}
                type="submit"
              >
                Login
              </Button>
              <div className="text-center mt-3 custom-zoom-btn">
                <Link
                  to="/forgotpassword"
                  className={`${
                    customDark === "dark-dark"
                      ? "text-dark"
                      : `${customDarkText}`
                  } `}
                >
                  Forgot Password?
                </Link>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
