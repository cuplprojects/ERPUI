import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { Form, Button, Row, Col } from 'react-bootstrap'; // Updated to use React Bootstrap
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { validateFormData } from './../scripts/addUsersValidations';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import axios from 'axios';
import SuccessModal from './../menus/addedUserModal.jsx';

const AddUsers = () => {
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDarkText = cssClasses[4];

  // Initial state for the form data
  const initialState = {

    username: '',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    mobileNo: '',
    roleId: '',

  };

  const [usernameError, setUsernameError] = useState('');
  const [formData, setFormData] = useState(initialState);
  const [userDetails, setUserDetails] = useState({ userName: '', password: '' });
  const [showModal, setShowModal] = useState(false);
  const[roles,setRoles] = useState([]);



  const handleCloseModal = () => setShowModal(false);


  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation logic for required fields
    const requiredFields = [
      { name: 'firstName', value: formData.firstName },
      { name: 'lastName', value: formData.lastName },
      { name: 'gender', value: formData.gender },

      { name: 'mobileNo', value: formData.mobileNo },
      { name: 'roleId', value: formData.roleId },

    ];

    const errors = requiredFields
      .filter(field => !field.value)
      .map(field => `${field.name.charAt(0).toUpperCase() + field.name.slice(1)} is required`);

    // Clear previous notifications
    toast.dismiss();

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error)); // Display errors using toast
    } else {
      const { success } = validateFormData(formData); // Validate the form data
      if (success) {
        try {
          const response = await axios.post('https://localhost:7212/api/User/create', formData); // API call to add user
          const { userName, password } = response.data;

          // Set user details for modal
          setUserDetails({ userName, password });
          setShowModal(true);
          toast.success('User added successfully!');
        } catch (error) {
          toast.error('Failed to add user: ' + error.response.data.message);
        }
      }
    }
  };

  // Function to handle input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };
  useEffect(() => {
    const fetchRoles = async () => {
        try {
            const response = await axios.get('https://localhost:7212/api/Roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    };

    fetchRoles();
}, []);
  // Generate username suggestion based on input
  useEffect(() => {
    const { firstName, middleName, lastName } = formData;
    let usernameBase = '';

    if (firstName && middleName && lastName) {
      usernameBase = `${firstName.charAt(0)}${middleName.charAt(0)}${lastName}`;
    } else if (firstName && lastName) {
      usernameBase = `${firstName.charAt(0)}${lastName}`;
    } else if (firstName) {
      usernameBase = firstName;
    }

    const randomNum = Math.floor(Math.random() * 100);
    const usernameSuggestion = `${usernameBase}${randomNum}`;

    // Check username suggestion length
    if (usernameSuggestion.length >= 6 && usernameSuggestion.length <= 10) {

      setFormData((prev) => ({ ...prev, username: usernameSuggestion }));

      setUsernameError('');
    } else {
      setUsernameError('Username must be between 6 and 10 characters.');
    }
  }, [formData.firstName, formData.middleName, formData.lastName]);

  // Validate username length

  const isUsernameValid = formData.username.length >= 6 && formData.username.length <= 10;


  // Function to handle reset
  const handleReset = () => {
    setFormData(initialState); // Reset to the initial state
    setUsernameError('');
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>

      <h4 className={`${customDarkText}`}>Add Users</h4>
      <Form onSubmit={handleSubmit}>
        {/* First Row: First Name, Middle Name, Last Name */}
        <Row className="mb-3">
          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label className={customDarkText}>First Name:</Form.Label>
              <Form.Control
                type="text"
                name="firstName"

                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                autoComplete='off'
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label className={customDarkText}>Middle Name:</Form.Label>
              <Form.Control
                type="text"
                name="middleName"

                placeholder="Enter middle name"
                value={formData.middleName}
                onChange={handleInputChange}
                autoComplete='off'
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label className={customDarkText}>Last Name:</Form.Label>
              <Form.Control
                type="text"
                name="lastName"

                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                autoComplete='off'
              />
            </Form.Group>
          </Col>
        </Row>


        {/* Username Suggestion */}
        <Row className="mb-3">
          <Col lg={6} md={12} sm={12} xs={12}>
            <Form.Group>
              <Form.Label className={customDarkText}>Username Suggestion:</Form.Label>
              <Form.Control
                type="text"
                name="username"

                value={formData.username}
                onChange={handleInputChange} // Allow manual editing
                isInvalid={usernameError !== '' && formData.username.length > 0} // Conditional error styling


              />
              <Form.Control.Feedback type="invalid">{usernameError}</Form.Control.Feedback>
            </Form.Group>
          </Col>



          <Col lg={6} md={12} sm={12} xs={12}>
            <Form.Group>
              <Form.Label className={customDarkText}>Gender:</Form.Label>
              <Form.Select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col lg={6} md={12} sm={12} xs={12}>
            <Form.Group>
              <Form.Label className={customDarkText}>Mobile Number:</Form.Label>
              <Form.Control
                type="text"

                name="mobileNo"

                placeholder="Enter mobile number"
                value={formData.mobileNo}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, ''); // Remove non-numeric characters
                  setFormData({ ...formData, mobileNo: value });
                }}
                required
              />
            </Form.Group>
          </Col>
          <Col lg={6} md={12} sm={12} xs={12}>
            <Form.Group>
              <Form.Label className={customDarkText}>Role:</Form.Label>
              <Form.Select

                name="roleId"
                value={formData.roleId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a Role</option>
                {roles.map(role => (
                        <option key={role.roleId} value={role.roleId}>
                            {role.roleName}
                        </option>
                    ))}

              </Form.Select>
            </Form.Group>
          </Col>

        </Row>

        {/* Add and Reset Buttons */}
        <div style={{ textAlign: 'right' }}>
          <Button variant="secondary" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit" className="custom-theme-dark-btn ms-2" disabled={!isUsernameValid}>
            Add
          </Button>
        </div>
      </Form>
      <div>
        <ToastContainer />
      </div>
      <SuccessModal

        show={showModal} username={userDetails.userName} password={userDetails.password} onClose={handleCloseModal}

      />
    </div>
  );
};
export default AddUsers;
