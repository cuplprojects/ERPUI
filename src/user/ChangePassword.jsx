import React, { useId, useState } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, FormControl } from 'react-bootstrap';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FaLock } from "react-icons/fa";
import { IoMdLock } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import API from '../CustomHooks/MasterApiHooks/api';
const ChangePassword = () => {
  // Static class names for simplicity
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



  // State object to store oldPassword and newPassword
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
  });

  // State for confirmPassword (used for future validations)
  const [confirmPassword, setConfirmPassword] = useState('');

  // State to handle password visibility
  const [showPasswords, setShowPasswords] = useState({
    showOldPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });

  /**
   * Handle input changes for formData
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  /**
   * Handle confirmPassword change
   */
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };
  //get user id here -->
  const userToken = localStorage.getItem('authToken');
  const authToken = userToken; // assume you have the token stored in a variable
  const decodedToken = jwtDecode(authToken);
  const [firstKey, userIdApi] = Object.entries(decodedToken)[0]; // extract the userId from the decoded token
  // console.log("user id with token -",userIdApi)//console for checking user  id with token

  /**
   * Handle form submission
   * Currently, it only displays a success toast without any logic
   */
  const handleSubmit = (event) => {
    event.preventDefault();
  
    if (formData.newPassword !== confirmPassword) {
      toast.error('New passwords do not match!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        draggable: true,
        style: { backgroundColor: '#dc3545', color: 'white' },
      });
      return;
    }
  
    const userId = userIdApi; // extracted from the decoded token

    const apiUrl = `/Login/Changepassword/${userId}`;

    const payload = {
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
    };
  

    API.put(apiUrl, payload)

      .then((response) => {
        toast.success('Password changed successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          draggable: true,
          style: {  backgroundColor: 'green' , color:"white"  },
        });
      })
      .catch((error) => {
        toast.error('Error changing password: ' + error.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          draggable: true,
          style: { backgroundColor: '#dc3545', color: 'white'  },
        });
      });
  
    // Optionally reset the form fields
    setFormData({
      oldPassword: '',
      newPassword: '',
    });
    setConfirmPassword('');
  };
  
  return (
    <Container
      className={`mt-5 w-100 p-4 shadow-lg rounded-5 ${customLightBorder} ${customLight}`}
      style={{ maxWidth: '800px',zIndex:"0" }}
    >
      <Row>
        <Col lg={12}>
          <div className="d-flex align-items-center justify-content-center mb-4">
            <div className="icon me-2">
              <FaLock size={25} className={`${customBtn === 'btn-dark' ? "text-white" : `${customDarkText}`}`} />
            </div>
            <h2 className={`text-center fw-bold ${customBtn === 'btn-dark' ? "text-white" : `${customDarkText}`}`}>
              Change Password
            </h2>
          </div>
        </Col>
      </Row>
      <Row className="align-items-center justify-content-center">
        <Col md={6} lg={5} className="text-center d-none d-md-block">
          <IoMdLock size={250} className={`${customBtn === 'btn-dark' ? "text-white" : `${customDarkText}`}`} />
        </Col>
        <Col md={6} lg={7}>
          <Form onSubmit={handleSubmit}>
            {/* Old Password Field */}
            <Form.Group className="mb-3" controlId="formOldPassword">
              <Form.Label className={`${customBtn === 'btn-dark' ? "text-white" : `${customDarkText}`}`}>
                Current Password
              </Form.Label>
              <InputGroup>
                <FormControl
                  type={showPasswords.showOldPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                />
                <InputGroup.Text
                  className={`password-eye-icon ${customBtn}`}
                  onClick={() => togglePasswordVisibility('showOldPassword')}
                  style={{ cursor: 'pointer' }}
                >
                  {showPasswords.showOldPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            {/* New Password Field */}
            <Form.Group className="mb-3" controlId="formNewPassword">
              <Form.Label className={`${customBtn === 'btn-dark' ? "text-white" : `${customDarkText}`}`}>
                New Password
              </Form.Label>
              <InputGroup>
                <FormControl
                  type={showPasswords.showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                />
                <InputGroup.Text
                  className={`password-eye-icon ${customBtn}`}
                  onClick={() => togglePasswordVisibility('showNewPassword')}
                  style={{ cursor: 'pointer' }}
                >
                  {showPasswords.showNewPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            {/* Confirm New Password Field */}
            <Form.Group className="mb-3" controlId="formConfirmPassword">
              <Form.Label className={`${customBtn === 'btn-dark' ? "text-white" : `${customDarkText}`}`}>
                Confirm New Password
              </Form.Label>
              <InputGroup>
                <FormControl
                  type={showPasswords.showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                  minLength={8}
                />
                <InputGroup.Text
                  className={`password-eye-icon ${customBtn}`}
                  onClick={() => togglePasswordVisibility('showConfirmPassword')}
                  style={{ cursor: 'pointer' }}
                >
                  {showPasswords.showConfirmPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={false} // No submission logic, so always enabled
              className={`${customBtn} ${customBtn === "btn-dark" ? "border border-white" : "border-0"} custom-zoom-btn w-100`}
            >
              Submit
            </Button>
          </Form>
          <ToastContainer style={{marginTop:"50px"}} />
        </Col>
      </Row>
    </Container>
  );
};

export default ChangePassword;
