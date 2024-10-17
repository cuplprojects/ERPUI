import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import { validateFormData } from './../scripts/addUsersValidations';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import SuccessModal from './../menus/addedUserModal.jsx';
import API from '../CustomHooks/MasterApiHooks/api.jsx';
import { getRoles } from '../CustomHooks/ApiServices/rolesService';
import { useTranslation } from 'react-i18next';

const AddUsers = () => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const { customDarkText, customBtn, customLight, customDark, customLightText, customLightBorder } = getCssClasses();

  const initialState = {
    username: '',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    mobileNo: '',
    roleId: '',
    status: true,
    address: '',
    profilePicturePath: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [userDetails, setUserDetails] = useState({ userName: '', password: '' });
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [displayName, setDisplayName] = useState("");

  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const requiredFields = ['firstName', 'gender', 'mobileNo', 'roleId', 'address'];
    
    setDisplayName(`${formData.firstName} ${formData.middleName} ${formData.lastName}`);
    
    const errors = requiredFields
      .filter(field => !formData[field])
      .map(field => t(`${field}Required`));

    toast.dismiss();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    } else {
      const { success } = validateFormData(formData);
      if (success) {
        try {
          const response = await API.post('/User/create', formData);
          const { userName, password } = response.data;
          setUserDetails({ userName, password });
          setShowModal(true);
          toast.success(t('userAddedSuccessfully'));
        } catch (error) {
          toast.error(t('failedToAddUser', { error: error.response?.data?.message || t('unknownError') }));
        }
      }
    }
  };

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error(t('failedToFetchRoles'));
      }
    };

    fetchRoles();
  }, [t]);

  useEffect(() => {
    const { firstName, middleName, lastName } = formData;
    const generateUsername = () => {
      let usernameBase = firstName.slice(0, 3).toLowerCase();
      const getRandomChars = (str, count) => Array.from({ length: count }, () => str[Math.floor(Math.random() * str.length)]).join('');
      const getRandomDigits = (count) => Math.random().toString().slice(2, 2 + count);

      if (middleName && lastName) {
        usernameBase += getRandomChars(middleName, 1) + getRandomChars(lastName, 1);
      } else if (lastName) {
        usernameBase += getRandomChars(lastName, 2);
      }

      let username = usernameBase + getRandomDigits(2);
      username = username.slice(0, 8).padEnd(6, getRandomDigits(1));

      return username;
    };

    if (firstName) {
      const newUsername = generateUsername();
      setFormData(prev => ({ ...prev, username: newUsername }));
    }
  }, [formData.firstName, formData.middleName, formData.lastName]);

  const isUsernameValid = useCallback((username) => {
    const hasAtLeastTwoNumbers = (username.match(/\d/g) || []).length >= 2;
    const isCorrectLength = username.length >= 6 && username.length <= 8;
    const isNotAllAlphabets = /[^a-zA-Z]/.test(username);
    return hasAtLeastTwoNumbers && isCorrectLength && isNotAllAlphabets;
  }, []);

  const handleReset = useCallback(() => {
    setFormData(initialState);
  }, [initialState]);

  return (
    <Card className={`${customLight} shadow`}>
      <Card.Body>
        <h4 className={customDarkText}>{t('addUsers')}</h4>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            {['firstName', 'middleName', 'lastName'].map((field) => (
              <Col xs={12} md={4} key={field}>
                <Form.Group>
                  <Form.Label className={customDarkText}>
                    {t(field)}:
                    {field === 'firstName' && <span style={{ color: 'red' }}>*</span>}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name={field}
                    placeholder={t(`enter${field.charAt(0).toUpperCase() + field.slice(1)}`)}
                    value={formData[field]}
                    onChange={handleInputChange}
                    required={field === 'firstName'}
                    autoComplete='off'
                    className={`${customDark === "dark-dark" ? `${customLightBorder} text-white bg-dark` : ''}`}
                  />
                </Form.Group>
              </Col>
            ))}
          </Row>

          <Row className="mb-3">
            <Col lg={6} md={12} sm={12} xs={12}>
              <Form.Group>
                <Form.Label className={customDarkText}>{t('username')} :<span style={{ color: 'red' }}>*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  isInvalid={!isUsernameValid(formData.username) && formData.username.length > 0}
                  className={`${customDark === "dark-dark" ? `${customLightBorder} text-white bg-dark` : ''}`}
                  placeholder={t('enterUsername')}
                />
                <Form.Control.Feedback type="invalid">
                  {t('usernameValidationMessage')}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col lg={6} md={12} sm={12} xs={12}>
              <Form.Group>
                <Form.Label className={customDarkText}>{t('gender')}: <span style={{ color: 'red' }}>*</span></Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className={`${customDark === "dark-dark" ? `${customLightBorder} text-white bg-dark` : ''}`}
                >
                  <option value="">{t('selectGender')}</option>
                  {['male', 'female', 'others'].map(option => (
                    <option key={option} value={option}>{t(option)}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col lg={6} md={12} sm={12} xs={12}>
              <Form.Group>
                <Form.Label className={customDarkText}>{t('mobileNumber')}: <span style={{ color: 'red' }}>*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="mobileNo"
                  placeholder={t('enterMobileNumber')}
                  value={formData.mobileNo}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobileNo: e.target.value.replace(/\D/g, '') }))}
                  required
                  className={`${customDark === "dark-dark" ? `${customLightBorder} text-white bg-dark` : ''}`}
                />
              </Form.Group>
            </Col>
            <Col lg={6} md={12} sm={12} xs={12}>
              <Form.Group>
                <Form.Label className={customDarkText}>{t('role')}: <span style={{ color: 'red' }}>*</span></Form.Label>
                <Form.Select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleInputChange}
                  required
                  className={`${customDark === "dark-dark" ? `${customLightBorder} text-white bg-dark` : ''}`}
                >
                  <option value="">{t('selectRole')}</option>
                  {roles.map(role => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.roleName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col lg={12} md={12} sm={12} xs={12} className='mt-3'>
              <Form.Group controlId="formBasicAddress">
                <Form.Label className={customDarkText}>{t('address')}: <span style={{ color: 'red' }}>*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder={t('address')}
                  required
                  className={`${customDark === "dark-dark" ? `${customLightBorder} text-white bg-dark` : ''}`}
                />
              </Form.Group>
            </Col>
          </Row>

          <div style={{ textAlign: 'right' }}>
            <Button variant="secondary" onClick={handleReset} className='custom-zoom-btn'>
              {t('reset')}
            </Button>
            <Button 
              type="submit" 
              className={`custom-theme-dark-btn ms-2 ${customBtn === "dark-dark" ? `${customBtn} border-light custom-zoom-btn` : `${customBtn} border-0 custom-zoom-btn`}`} 
              disabled={!isUsernameValid(formData.username)}
            >
              {t('add')}
            </Button>
          </div>
        </Form>
        <ToastContainer />
        <SuccessModal
          show={showModal}
          username={userDetails.userName}
          password={userDetails.password}
          onClose={handleCloseModal}
          fullName={displayName}
        />
      </Card.Body>
    </Card>
  );
};

export default AddUsers;
