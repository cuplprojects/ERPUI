import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaPowerOff } from 'react-icons/fa';
import { ImProfile } from "react-icons/im";
import { IoSettingsSharp } from "react-icons/io5";
import { RiLockPasswordFill } from "react-icons/ri";
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import "./../styles/userMenu.css"
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import SampleUser from "./../assets/sampleUsers/defaultUser.jpg";
import useUserDataStore from '../store/userDataStore';
import { useMediaQuery } from 'react-responsive';

const UserMenu = ({ onClose }) => {
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, , customBtn] = cssClasses;
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { userData, fetchUserData } = useUserDataStore();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLogoutClick = () => setShowModal(true);
  const handleButtonClick = () => onClose();
  const handleProfileClick = () => navigate('/profile');
  const handleSettingsClick = () => navigate('/settings');
  const handleChangePasswordClick = () => navigate('/change-password');

  const handleLogoutConfirm = () => {
    localStorage.setItem('loggedOut', 'true');
    localStorage.setItem('authToken', null);
    navigate('/');
    setShowModal(false);
  };

  const handleClose = () => setShowModal(false);

  const isValidImageUrl = (url) => url && url.match(/\.(jpeg|jpg|gif|png)$/) != null;

  return (
    <div
      className={`card p-3 rounded shadow-sm ${customDark} border mt-1`}
      style={{
        minWidth: isMobile ? '100%' : '200px',
        maxWidth: isMobile ? '100%' : '300px',
      }}
      onClick={handleButtonClick}
    >
      <div className="text-center mb-2 custom-zoom-btn">
        <div style={{ 
          width: isMobile ? '60px' : '80px', 
          height: isMobile ? '60px' : '80px',
          margin: '0 auto',
          overflow: 'hidden',
          borderRadius: '50%'
        }}>
          {userData?.profilePicturePath && isValidImageUrl(`${import.meta.env.VITE_API_BASE_URL}/${userData.profilePicturePath}`) ? (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/${userData.profilePicturePath}`}
              alt=""
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover'
              }}
            />
          ) : (
            <img
              src={SampleUser}
              alt=""
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover'
              }}
            />
          )}
        </div>
      </div>
      <ul className="list-unstyled">
        {[
          { icon: <ImProfile />, text: 'Profile', onClick: handleProfileClick },
          { icon: <IoSettingsSharp />, text: 'My Settings', onClick: handleSettingsClick },
          { icon: <RiLockPasswordFill />, text: 'Change Password', onClick: handleChangePasswordClick },
          { icon: <FaPowerOff />, text: 'Logout', onClick: handleLogoutClick },
        ].map((item, index) => (
          <li key={index} className={`p-2 ${index !== 3 ? 'border-bottom' : ''} d-flex align-items-center custom-zoom-btn`}>
            <span className="me-2 text-light">{item.icon}</span>
            {index === 3 ? (
              <button
                onClick={item.onClick}
                className="btn text-decoration-none text-light d-block p-0 border-0 bg-transparent"
                style={{ cursor: 'pointer' }}
              >
                {item.text}
              </button>
            ) : (
              <Link to={`/${item.text.toLowerCase().replace(' ', '-')}`} className="text-decoration-none text-light d-block" onClick={item.onClick}>
                {item.text}
              </Link>
            )}
          </li>
        ))}
      </ul>

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton={false} className={`${customDark} ${customBtn} ${customDark === 'dark-dark' ? "border border-bottom-0" : ""}`}>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body className={`${customDark} ${customBtn} ${customDark === 'dark-dark' ? "border border-top-0 border-bottom-0" : ""}`}>
          Are you sure you want to log out?
        </Modal.Body>
        <Modal.Footer className={`${customDark} ${customBtn} ${customDark === 'dark-dark' ? "border border-top-0" : ""}`}>
          <Button variant="light" onClick={handleClose} className={`${customDark === 'dark-dark' ? `${customMid} text-light` : `${customDark} text-white`}`}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleLogoutConfirm}
            className={customDark === 'red-dark' ? 'text-danger bg-white' : ''}
          >
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer />
    </div>
  );
}

export default UserMenu;
