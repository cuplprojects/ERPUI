import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaPencilAlt } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import SampleUser1 from "./../assets/sampleUsers/defaultUser.jpg";
import "./../styles/Profile.css";
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
const UserProfile = () => {

  //Theme Change Section
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customLight = cssClasses[2];
  const customBtn = cssClasses[3];
  const customDarkText = cssClasses[4];
  const customLightBorder = cssClasses[6]
  const customDarkBorder = cssClasses[7]

  const [displayedName, setDisplayedName] = useState("");
  const [isEditing, setIsEditing] = useState(false);//
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [address, setAddress] = useState("")
  const userToken = localStorage.getItem('authToken');
  const decodedToken = jwtDecode(userToken);
  const [, userIdApi] = Object.entries(decodedToken)[0];

  useEffect(() => {
    axios.get(`https://localhost:7212/api/User/${userIdApi}`)
      .then(response => {
        const userData = response.data;
        setFirstName(userData.firstName);
        setMiddleName(userData.middleName);
        setLastName(userData.lastName);
        setMobileNumber(userData.mobileNo);
        setUserName(userData.userName);
        setAddress(userData.address)
        console.log(userData)//console the api response data
      })
      .catch(error => {
        console.error(error);
      });
  }, [userIdApi]);
  useEffect(() => {
    setDisplayedName(`${firstName} ${middleName} ${lastName}`);
  }, [firstName, middleName, lastName]);
  const [role] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);

  const handleImageClick = (event) => {
    event.stopPropagation();
    setIsZoomed(true);
  };

  const handleZoomedImageClick = () => {
    setIsZoomed(false);
  };

  const handleDocumentClick = () => {
    setIsZoomed(false);
  };

  React.useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  // console.log(userIdApi)//loop issue
  return (
    <Container className="my-4">
      <div style={{ zIndex: "999999999999999999999999" }}>
      </div>
      <div className={` d-flex justify-content-between align-items-center ${customDark} ${customDark === 'dark-dark' ? `${customLightBorder} border-top border-start border-end border-light border-bottom-0` : ""} 
      ${customBtn === 'dark-dark' ? "" : ""} text-white p-3 rounded-top`}>
        <div className="greet">
          <h2>Welcome, {firstName}</h2>
          <p className="mb-0 d-none d-md-block">
            {new Intl.DateTimeFormat('en-US', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              weekday: 'long',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
              hour12: true,
            }).format(currentDateTime)}
          </p>
        </div>
      </div>
      {/* ----------------------------------------------------------------------------------------------------------------------- */}
      <div className={` p-4  rounded-bottom shadow-lg ${customLight} ${customDark === 'dark-dark' ? `${customDarkBorder} border-1` : "border-light"} `}>
        <Row className="align-items-center mb-4">
          <Col xs={12} sm={3} md={2} className="text-center position-relative">
            <img
              src={SampleUser1}
              alt=""
              width="100px"
              className={`rounded-circle ${customDarkBorder}`}
              onClick={handleImageClick}
            />
            <sub>
              {/* Edit  image button */}
              <Button
                variant="link"
                className={`position-absolute p-0 rounded-circle ${customDark === "dark-dark" ? `${customMid} ${customDarkText} ${customDarkBorder} border-2` : `${customDarkText} ${customMid} ${customDarkBorder}`}`}
                style={{
                  bottom: '0',
                  right: '0',
                  transform: 'translate(50%, 50%)',  // Fine-tuned the positioning
                  width: '30px',
                  height: '30px',
                  padding: '0',
                }}
              >
                <FaPencilAlt
                  size="sm"
                  className="p-1"
                  style={{ width: '100%', height: '100%' }}
                />
              </Button>
            </sub>
            {isZoomed && (
              <div className={`zoomed-image rounded-circle ${isZoomed ? 'show' : 'hide'}`} onClick={handleZoomedImageClick}>
                <img src={SampleUser1} alt="" width="200px" className="rounded-circle" />
              </div>
            )}
          </Col>
          <Col xs={12} sm={12} md={8} className="mt-3">
            <h4 className={`${customDarkText}`}>{userName}</h4>
            <p className={`text-muted mb-0 ${customDarkText}`}>{displayedName}</p>
          </Col>
        </Row>
        {/* ----------------------------------------------------------------------------------------------------------------- */}
        <Form>
          <Row className="mb-3">
            <Col xs={12} sm={6} md={4} className="mb-3">
              <Form.Group controlId="formFirstName">
                <Form.Label className={`${customDarkText}`}>First Name</Form.Label>
                <Form.Control
                  placeholder="Your First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!isEditing}
                  className='rounded'
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4} className="mb-3">
              <Form.Group controlId="formMiddleName">
                <Form.Label className={`${customDarkText}`}>Middle Name</Form.Label>
                <Form.Control
                  placeholder="Your Middle Name"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  disabled={!isEditing}
                  className='rounded'
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Form.Group controlId="formLastName">
                <Form.Label className={`${customDarkText}`}>Last Name</Form.Label>
                <Form.Control
                  placeholder="Your Last Name"
                  value={lastName}
                  className='rounded'
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isEditing}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} sm={6} md={4} className="mb-3">
              <Form.Group controlId="formGender">
                <Form.Label className={`${customDarkText}`}>Gender</Form.Label>
                <Form.Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  disabled={!isEditing}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Form.Group controlId="formRole">
                <Form.Label className={`${customDarkText}`}>Role</Form.Label>
                <Form.Control
                  placeholder="Your Role"
                  value={role}
                  className='rounded'
                  disabled
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Form.Group controlId="formMobile">
                <Form.Label className={`${customDarkText}`}>Mobile Number</Form.Label>
                <Form.Control
                  placeholder="Your Mobile Number"
                  value={mobileNumber}
                  className='rounded'
                  onChange={(e) => setMobileNumber(e.target.value)}
                  disabled={!isEditing}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={12}>
              <Form.Group controlId="formAddress">
                <Form.Label className={`${customDarkText}`}>Address</Form.Label>
                <Form.Control
                  placeholder="Your Address"
                  value={address}
                  className='rounded'
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={!isEditing}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </div>
    </Container>
  );
};

export default UserProfile;
