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
import SampleUser1 from "./../assets/sampleUsers/defaultUser.jpg";
import useUserDataStore from '../store/userDataStore';

const UserMenu = ({ onClose }) => {

  //Theme Change Section
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customBtn = cssClasses[3];
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const navigate = useNavigate(); // Hook for programmatic navigation
  const { userData, fetchUserData } = useUserDataStore();

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Function to open the logout confirmation modal
  const handleLogoutClick = () => {
    setShowModal(true);
  };
  const handleButtonClick = () => {
    onClose();
  }
  const handleProfileClick = () => {
    navigate('/profile');
  };
  const handleSettingsClick = () => {
    navigate('/settings');
  };
  const handleChangePasswordClick = () => {
    navigate('/change-password');
  };

  // Function to handle confirmed logout
  const handleLogoutConfirm = () => {
    // localStorage.clear();
    localStorage.setItem('loggedOut', 'true');
    navigate('/');
    setShowModal(false);
  };

  // Function to handle modal close
  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <div
      className={`cad p-3 rounded shadow-sm ${customDark} border mt-1`}
      style={{
        minWidth: '200px',

      }}
      onClick={handleButtonClick}
    >
      {/* User picture */}
      <div className="text-center mb-2 custom-zoom-btn">
        {userData?.profilePicturePath ? (
          <img
            src={`${import.meta.env.VITE_API_BASE_URL}/${userData.profilePicturePath}`}
            alt=""
            width="80px"
            className='rounded-circle'
          />
        ) : (
          <FaUserCircle
            className="text-light"
            style={{ width: '80px', height: '80px' }}
          />
        )}
      </div>
      <ul className="list-unstyled">
        <li className="p-2 border-bottom d-flex align-items-center custom-zoom-btn">
          <ImProfile className="me-2 text-light " />
          <Link to="/profile" className="text-decoration-none text-light d-block" onClick={handleProfileClick}>Profile</Link>
        </li>
        <li className="p-2 border-bottom d-flex align-items-center custom-zoom-btn">
          <IoSettingsSharp className="me-2 text-light settings-icon" />
          <Link to="/settings" className="text-decoration-none text-light d-block" onClick={handleSettingsClick}>My Settings</Link>
        </li>
        <li className="p-2 border-bottom d-flex align-items-center custom-zoom-btn">
          <RiLockPasswordFill className="me-2 text-light" />
          <Link to="/change-password" className="text-decoration-none text-light d-block" onClick={handleChangePasswordClick}>Change Password</Link>
        </li>
        <li className="p-2 d-flex align-items-center custom-zoom-btn">
          <FaPowerOff className="me-2 text-light" />
          <button
            onClick={handleLogoutClick}
            className="btn text-decoration-none text-light d-block p-0 border-0 bg-transparent"
            style={{ cursor: 'pointer' }}
          >
            Logout
          </button>
        </li>
      </ul>

      {/* Logout Confirmation Modal */}
      <Modal show={showModal} onHide={handleClose} centered >
        <Modal.Header closeButton={false} className={`${customDark}  ${customBtn} ${customDark==='dark-dark'?"border border-bottom-0":""}`}>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body className={`${customDark} ${customBtn}  ${customDark==='dark-dark'?"border  border-top-0 border-bottom-0":""}`}>
          Are you sure you want to log out?
        </Modal.Body>
        <Modal.Footer className={`${customDark} ${customBtn}  ${customDark==='dark-dark'?"border border-top-0":""}`}>
          <Button variant="light" onClick={handleClose} className={` ${customDark==='dark-dark'? `${customMid} text-light`:`${customDark} text-white`} `}>
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
