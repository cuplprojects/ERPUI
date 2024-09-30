import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { FaEdit } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { IoMdMail } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { BsTelephoneFill } from "react-icons/bs";
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';

import SampleUser1 from "./../assets/sampleUsers/sampleUser1.jpg";
import ChangeMobileNumber from './../menus/ChangeMobileNumber'
import { FaTimes } from 'react-icons/fa';
import "./../styles/Profile.css";
const UserProfile = () => {

  //Theme Change Section
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customLight = cssClasses[2];
  const customBtn = cssClasses[3];
  const customDarkText = cssClasses[4];
  const customLightText = cssClasses[5]
  const customLightBorder = cssClasses[6]
  const customDarkBorder = cssClasses[7]

  const [isEditing, setIsEditing] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [firstName, setFirstName] = useState("Jayant");
  const [middleName, setMiddleName] = useState("Roy");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Male");
  const [language, setLanguage] = useState("English");
  const [mobileNumber, setMobileNumber] = useState("+91 8400019683");

  const [initialValues, setInitialValues] = useState({
    firstName: "Jayant",
    middleName: "Roy",
    lastName: "",
    gender: "Male",
    language: "English",
  });
  const [role] = useState("Developer");
  const [department] = useState("Information Technology (IT)");
  const [permissions] = useState("Edit, View, Delete");
  const permissionArray = permissions.split(', ');
  const [displayedName, setDisplayedName] = useState(`${firstName} ${middleName} ${lastName}`);
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

  const handleEditClick = () => setIsEditing(true);
  const handleSaveClick = () => {
    const fields = [
      { name: "First Name", value: firstName, initial: initialValues.firstName },
      { name: "Middle Name", value: middleName, initial: initialValues.middleName },
      { name: "Last Name", value: lastName, initial: initialValues.lastName },
      { name: "Gender", value: gender, initial: initialValues.gender },
      { name: "Language", value: language, initial: initialValues.language },
    ];

    let isUpdated = false; // Track if any field was updated

    fields.forEach(field => {
      if (field.value !== field.initial) {
        alert(`${field.name} changed from ${field.initial} to ${field.value}`); // Use alert() instead of toast()
        isUpdated = true; // Mark that an update occurred
      }
    });

    if (isUpdated) {
      setDisplayedName(`${firstName} ${middleName} ${lastName}`);
      setInitialValues({ // Update the initial values
        firstName,
        middleName,
        lastName,
        gender,
        language,
      });
    }

    setIsEditing(false); // End editing after save
  };

  const handleMobileSave = (newNumber) => {
    setMobileNumber(newNumber);  // Update the mobile number in the state
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Container className="my-4">
      <div style={{ zIndex: "999999999999999999999999" }}>
      </div>
      <div className={` d-flex justify-content-between align-items-center ${customDark} ${customDark === 'dark-dark' ? `${customLightBorder} border-top border-start border-end border-light border-bottom-0` : ""} 
      ${customBtn === 'dark-dark' ? "" : ""} text-white p-3 rounded-top`}>
        <div className="greet">
          <h2>Welcome, Jayant</h2>
          {/* <p className="mb-0">{currentDateTime.toLocaleString()} - {new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
          }).format(currentDateTime)}</p> */}
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
        <div className="button d-lg-none d-md-none">
          {isEditing ? (
            <Button
              className={`${customDark === 'dark-dark' ? `${customBtn} border-white` : `${customMid} ${customDarkBorder} ${customDarkText}`}`}
              onClick={handleSaveClick}
            >
              Save
            </Button>
          ) : (
            <Button
              className={` ${customDark === 'dark-dark' ? `${customBtn} border-white` : `${customMid} ${customDarkBorder} ${customDarkText}`}`}
              onClick={handleEditClick}
            >
              Edit
            </Button>
          )}
        </div>
      </div>
      {/* ----------------------------------------------------------------------------------------------------------------------- */}
      <div className={` p-4  rounded-bottom shadow-lg ${customLight} ${customDark === 'dark-dark' ? `${customDarkBorder} border-1` : "border-light"} `}>
        <Row className="align-items-center mb-4">

          <Col xs={12} sm={3} md={2} className="text-center position-relative ">
            <img
              src={SampleUser1}
              alt=""
              width="100px"
              className='rounded-circle'
              onClick={handleImageClick}
            />
            {isZoomed && (
              <div className={`zoomed-image rounded-circle ${isZoomed ? 'show' : 'hide'}`} onClick={handleZoomedImageClick}>
                <img src={SampleUser1} alt="" width="200px" className='rounded-circle' />
              </div>
            )}

            {/* <FaUser className="rounded-circle border border-dark border-2 " size={100} /> */}
            <Button
              variant="link"
              className="position-absolute top-0 end-0 p-0"
              style={{ transform: 'translate(25%, -25%)' }}
            >
              <FaEdit size={20} className="custom-theme-dark-text" />
            </Button>
          </Col>

          <Col xs={12} sm={12} md={8} className="mt-3">
            <h4 className={`${customDarkText}`}>Mr. {displayedName}</h4>
            <p className={`text-muted mb-0 ${customDarkText}`}>jayanta@chandrakala.co.in</p>
          </Col>

          <Col xs={12} sm={2} className="text-sm-end mt-2 mt-sm-0 d-none d-lg-block d-md-block">
            {isEditing ? (
              <Button
                variant=""
                className={`${customBtn} custom-zoom-btn text-light ${customBtn === 'dark-dark' ? "" : "border border-white"}`}
                onClick={handleSaveClick}
              >
                Save
              </Button>
            ) : (
              <Button
                variant=""
                className={`${customBtn} custom-zoom-btn text-light ${customBtn === 'dark-dark' ? "border border-white" : "border border-white"}`}
                onClick={handleEditClick}
              >
                Edit
              </Button>
            )}
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
                  value={role}
                  className='rounded'
                  disabled
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Form.Group controlId="formDepartment">
                <Form.Label className={`${customDarkText}`}>Department</Form.Label>
                <Form.Control
                  placeholder="Your Department"
                  disabled
                  className='rounded'
                  value={department}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} sm={6} md={4} className="mb-3">
              <Form.Group controlId="formLanguage">
                <Form.Label className={`${customDarkText}`}>Language</Form.Label>
                <Form.Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={!isEditing}
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={8}>
              <Form.Group controlId="formPermissions">
                <Form.Label className={`${customDarkText}`}>Permissions</Form.Label>
                <div className="d-flex flex-wrap">
                  {permissionArray.map((permission, index) => (
                    <div key={index} className={` ${customBtn} ${customDarkBorder} rounded me-2 mb-2 p-1 fs-6 `}>
                      {permission}
                      <span className="ms-2" style={{ cursor: 'not-allowed' }}>
                        <FaTimes className="text-white" />
                      </span>
                    </div>
                  ))}
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Form>

        <Row className='d-flex justify-content-between '>
          <Col xs={12} md={6} lg={5}>
            <div className="mt-2">
              <h5 className={`${customDarkText} fw-bold`}>My Email Address</h5>
              <Row className="align-items-center d-flex align-items-center justify-content-between">
                <Col xs={12} sm={3} md={1} lg={6}>
                  <IoMdMail className={`custom-theme-dark-text ${customDarkText}`} size={50} />
                </Col>
                <Col xs={12} sm={9} md={11} lg={6} className='text-end '>
                  <div className={`mb-0 ${customDarkText} fw-bold text-wrap`}>jayanta@chandrakala.co.in</div>
                  <small className={`mb-0 ${customDarkText}  text-muted`}>1 month ago</small>
                </Col>
              </Row>
              <div className='d-flex justify-content-center'>
                <Button
                  variant="dark"
                  className={`mt-3  custom-zoom-btn text-light disabled w-100  ${customBtn} ${customDarkBorder} d-none d-md-block d-lg-block`}
                >
                  Change Email Address
                </Button>
                <Button
                  variant="dark"
                  className={`mt-3  custom-zoom-btn text-light disabled w-100 d-md-none d-lg-none  ${customBtn} ${customDarkBorder}`}
                >
                  Change Email Address
                </Button>
              </div>
            </div>
          </Col>
          <Col xs={12} md={6} lg={5}>
            <div className="mt-2">
              <h5 className={`${customDarkText} fw-bold`}>My Mobile Number</h5>
              <Row className="align-items-center">
                <Col xs={3} sm={2} md={1}>
                  <BsTelephoneFill className={`custom-theme-dark-text ${customDarkText}`} size={50} />
                </Col>
                <Col xs={9} sm={10} md={11} className='text-end'>
                  <p className={`mb-0 ${customDarkText} fw-bold`}>{mobileNumber}</p>
                  <small className={`mb-0 ${customDarkText} text-muted`}>Last updated 2 weeks ago</small>
                </Col>
              </Row>
            </div>
            <div className='d-flex justify-content-center'>
              <ChangeMobileNumber
                currentMobileNumber={mobileNumber}
                onSave={handleMobileSave}  // Pass the function to handle saving the new number
              />
            </div>
          </Col>

        </Row>

      </div>
    </Container>
  );
};

export default UserProfile;
