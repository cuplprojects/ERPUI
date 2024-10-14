import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaPencilAlt } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import SampleUser1 from "./../assets/sampleUsers/defaultUser.jpg";
import "./../styles/Profile.css";
import axios from 'axios';
import useUserDataStore from '../store/userDataStore';

const UserProfile = () => {
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, , customLightBorder, customDarkBorder] = cssClasses;

  const { userData, setUserData, fetchUserData } = useUserDataStore();
  const [isEditing, setIsEditing] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImageKey, setProfileImageKey] = useState(Date.now());

  const APIUrlBase = import.meta.env.VITE_API_BASE_URL;
  const APIUrl = import.meta.env.VITE_API_BASE_API;

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      await fetchUserData();
      setIsLoading(false);
    };
    loadUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleEditImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          if (userData?.profileImage === SampleUser1) {
            await uploadImage(file);
          } else {
            await updateProfilePicture(file);
          }
          await fetchUserData();
          setProfileImageKey(Date.now());
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`${APIUrl}/User/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      await fetchUserData();
      window.location.reload();
      console.log('Upload successful');
    } catch (error) {
      console.error('Upload failed', error);
    }
  };

  const updateProfilePicture = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.put(`${APIUrl}/User/updateProfilePicture/${userData.userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      await fetchUserData();
      window.location.reload();
      console.log('Update successful');
    } catch (error) {
      console.error('Update failed', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({...prevData, [name]: value}));
  };

  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return SampleUser1;
    return imagePath.startsWith('http') ? imagePath : `${APIUrlBase}/${imagePath}?${profileImageKey}`;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>Error: Unable to load user data</div>;
  }

  return (
    <Container className="my-4">
      <div className={`d-flex justify-content-between align-items-center ${customDark} ${customDark === 'dark-dark' ? `${customLightBorder} border-top border-start border-end border-light border-bottom-0` : ""} 
      ${customBtn === 'dark-dark' ? "" : ""} text-white p-3 rounded-top`}>
        <div className="greet">
          <h2>Welcome, {userData.firstName}</h2>
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
      <div className={`p-4 rounded-bottom shadow-lg ${customLight} ${customDark === 'dark-dark' ? `${customDarkBorder} border-1` : "border-light"}`}>
        <Row className="align-items-center mb-4">
          <Col xs={12} sm={3} md={2} className="text-center position-relative">
            <img
              src={getProfileImageUrl(userData.profilePicturePath)}
              alt=""
              width="100px"
              className={`rounded-circle ${customDarkBorder}`}
              onClick={handleImageClick}
            />
            <sub>
              <Button
                variant="link"
                className={`position-absolute p-0 rounded-circle ${customDark === "dark-dark" ? `${customMid} ${customDarkText} ${customDarkBorder} border-2` : `${customDarkText} ${customMid} ${customDarkBorder}`}`}
                style={{
                  bottom: '0',
                  right: '0',
                  transform: 'translate(50%, 50%)',
                  width: '30px',
                  height: '30px',
                  padding: '0',
                }}
                onClick={handleEditImageClick}
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
                <img src={getProfileImageUrl(userData.profilePicturePath)} alt="" width="200px" className="rounded-circle" />
              </div>
            )}
          </Col>
          <Col xs={12} sm={12} md={8} className="mt-3">
            <h4 className={`${customDarkText}`}>{userData.userName}</h4>
            <p className={`text-muted mb-0 ${customDarkText}`}>{`${userData.firstName} ${userData.middleName} ${userData.lastName}`}</p>
          </Col>
        </Row>
        <Form>
          <Row className="mb-3">
            <Col xs={12} sm={6} md={4} className="mb-3">
              <Form.Group controlId="formFirstName">
                <Form.Label className={`${customDarkText}`}>First Name</Form.Label>
                <Form.Control
                  name="firstName"
                  placeholder="Your First Name"
                  value={userData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className='rounded'
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4} className="mb-3">
              <Form.Group controlId="formMiddleName">
                <Form.Label className={`${customDarkText}`}>Middle Name</Form.Label>
                <Form.Control
                  name="middleName"
                  placeholder="Your Middle Name"
                  value={userData.middleName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className='rounded'
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Form.Group controlId="formLastName">
                <Form.Label className={`${customDarkText}`}>Last Name</Form.Label>
                <Form.Control
                  name="lastName"
                  placeholder="Your Last Name"
                  value={userData.lastName}
                  className='rounded'
                  onChange={handleChange}
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
                  name="gender"
                  value={userData.gender}
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Form.Group controlId="formRole">
                <Form.Label className={`${customDarkText}`}>Role</Form.Label>
                <Form.Control
                  name="role"
                  placeholder="Your Role"
                  value={userData.role}
                  className='rounded'
                  disabled
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Form.Group controlId="formMobile">
                <Form.Label className={`${customDarkText}`}>Mobile Number</Form.Label>
                <Form.Control
                  name="mobileNumber"
                  placeholder="Your Mobile Number"
                  value={userData.mobileNumber}
                  className='rounded'
                  onChange={handleChange}
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
                  name="address"
                  placeholder="Your Address"
                  value={userData.address}
                  className='rounded'
                  onChange={handleChange}
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
