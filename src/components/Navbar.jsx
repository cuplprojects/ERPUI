import React, { useState, useRef, useEffect } from 'react';
import { FaUserCircle, FaBars } from 'react-icons/fa';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavigationBar from '../menus/NavigationBar';
import UserMenu from '../menus/UserMenu';
import Notification from '../menus/Notification';
import "./../styles/navbar.css";
import { RiNotification2Fill } from "react-icons/ri";
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { Link } from 'react-router-dom';
import useUserDataStore from '../store/userDataStore';
import SampleUser1 from "./../assets/sampleUsers/defaultUser.jpg";
const apiUrl = import.meta.env.VITE_API_BASE_URL;

const Navbar = () => {

  //Theme Change Section
  const { getCssClasses } = useStore(themeStore);
  const [
    customDark,
    customMid,
    customLight,
    customBtn,
    customDarkText,
    customLightText,
    customLightBorder,
    customDarkBorder
  ] = getCssClasses();

  const [showNav, setShowNav] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const navRef = useRef(null);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const containerRef = useRef(null);

  const { userData, fetchUserData } = useUserDataStore();

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const toggleNav = () => {
    setShowNav(prev => !prev);
    setUserMenu(false);
    setShowNotification(false);
  };

  const toggleUserMenu = () => {
    setUserMenu(prev => !prev);
    setShowNav(false);
    setShowNotification(false);
  };

  const toggleNotificationMenu = () => {
    setShowNotification(prev => !prev);
    setShowNav(false);
    setUserMenu(false);
  };

  const handleClickOutside = (event) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target) &&
      !navRef.current.contains(event.target) &&
      !userMenuRef.current.contains(event.target) &&
      !notificationRef.current.contains(event.target)
    ) {
      setShowNav(false);
      setUserMenu(false);
      setShowNotification(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (navRef.current) {
      navRef.current.style.maxHeight = showNav ? `${navRef.current.scrollHeight}px` : '0';
    }
  }, [showNav]);

  useEffect(() => {
    if (userMenuRef.current) {
      userMenuRef.current.style.maxHeight = userMenu ? `${userMenuRef.current.scrollHeight}px` : '0';
    }
  }, [userMenu]);

  useEffect(() => {
    if (notificationRef.current) {
      notificationRef.current.style.maxHeight = showNotification ? `${notificationRef.current.scrollHeight}px` : '0';
    }
  }, [showNotification]);

  const closeNav = () => {
    setShowNav(false);
  };

  const closeUserMenu = () => {
    setUserMenu(false);
  };

  const closeNotification = () => {
    setShowNotification(false);
  };

  return (
    <div ref={containerRef} className='sticky-to'>
      <Container fluid className={`border-bottom py-2 text-white ${customDark}`}>
        <Row className="align-items-center">
          <Col xs={1} md={1} lg={1} className="d-flex align-items-center">
            <button
              onClick={toggleNav}
              className="btn p-0 border-0 bg-transparent"
              aria-label="Toggle navigation"
              style={{ cursor: 'pointer' }}
            >
              <FaBars className="fs-3 text-light custom-zoom-btn" />
            </button>
          </Col>
          <Col xs={9} md={10} lg={10} className="d-flex align-items-center justify-content-center">
            <Link to="/dashboard" className="ms-2 fw-bold fs-4 text-light " style={{textDecoration:"none"}}>CUPL | ApexERP</Link>
          </Col>
          <Col xs={2} md={1} lg={1} className="d-flex align-items-center justify-content-end">
            <button
              onClick={toggleNotificationMenu}
              className="btn p-0 border-0 bg-transparent me-3"
              aria-label="Toggle notification menu"
              style={{ cursor: 'pointer' }}
            >
              <RiNotification2Fill className="fs-4 text-light custom-zoom-btn" size={30}/>
            </button>
            <button
              onClick={toggleUserMenu}
              className="btn p-0 border-0 bg-transparent"
              aria-label="Toggle user menu"
              style={{ cursor: 'pointer' }}
            >
              <img
                src={userData?.profilePicturePath ? `${apiUrl}/${userData.profilePicturePath}` : SampleUser1}
                alt={`${userData?.firstName} ${userData?.lastName}`}
                width="40px"
                className='rounded-circle'
              />
            </button>
          </Col>
        </Row>
      </Container>

      <div
        ref={navRef}
        className='m-1 border rounded-bottom-5'
        style={{
          position: 'absolute',
          left: 0,
          overflow: 'hidden',
          transition: '600ms ease-in-out, opacity 600ms ease-in-out',
          opacity: showNav ? 1 : 0,
          // zIndex: 1,
        }}
      >
        <NavigationBar onLinkClick={closeNav} />
      </div>

      <div
        ref={userMenuRef}
        className='m-1'
        style={{
          width: 'auto',
          position: 'absolute',
          top: '53px',
          right: '0',
          overflow: 'hidden',
          transition: '500ms ease-in-out, opacity 500ms ease-in-out',
          opacity: userMenu ? 1 : 0,
          // zIndex: 999,
        }}
      >
        <UserMenu onClose={closeUserMenu} />
      </div>

      <div
        ref={notificationRef}
        className='m-1'
        style={{
          width: 'auto',
          position: 'absolute',
          top: '53px',
          right: '40px',
          overflow: 'hidden',
          transition: '500ms ease-in-out, opacity 500ms ease-in-out',
          opacity: showNotification ? 1 : 0,
          // zIndex: 999,
        }}
      >
        <Notification onClose={closeNotification} />
      </div>
    </div>
  );
};

export default Navbar;
