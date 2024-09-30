import React, { useState, useRef, useEffect } from 'react';
import { FaUserCircle, FaBars } from 'react-icons/fa';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavigationBar from '../menus/NavigationBar';
import UserMenu from '../menus/UserMenu';
import Notification from '../menus/Notification'; // Import the Notification component
import "./../styles/navbar.css";
import { RiNotification2Fill } from "react-icons/ri";
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import SampleUser1 from "./../assets/sampleUsers/sampleUser1.jpg";
const Navbar = () => {

  //Theme Changer Section
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0]; 
  const customMid= cssClasses[1]; 
  const customLight= cssClasses[2]; 
  const customBtn= cssClasses[3]; 

  const [showNav, setShowNav] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false); // State for the notification menu

  const navRef = useRef(null);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const containerRef = useRef(null); // Reference for the container

  const toggleNav = () => {
    setShowNav(prev => !prev);
    setUserMenu(false); // Hide user menu when nav menu is toggled
    setShowNotification(false); // Hide notification menu when nav menu is toggled
  };

  const toggleUserMenu = () => {
    setUserMenu(prev => !prev);
    setShowNav(false); // Hide nav menu when user menu is toggled
    setShowNotification(false); // Hide notification menu when user menu is toggled
  };

  const toggleNotificationMenu = () => {
    setShowNotification(prev => !prev);
    setShowNav(false); // Hide nav menu when notification menu is toggled
    setUserMenu(false); // Hide user menu when notification menu is toggled
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

  // Function to close the navigation bar
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
            <div className="ms-2 fw-bold fs-4">CUPL | ApexERP</div>
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
              src={SampleUser1}
              alt=""
              width="40px"
              className='rounded-circle'
            />
              {/* <FaUserCircle className="fs-2 text-light custom-zoom-btn" /> */}
            </button>
          </Col>
        </Row>
      </Container>

      {/* NavigationBar with smooth expand/collapse */}
      <div
        ref={navRef}
        className='m-1 border rounded-bottom-5'
        style={{
          position: 'absolute',
          // top: '53px',
          left: 0,
          // right: 0,
          overflow: 'hidden',
          transition: '600ms ease-in-out, opacity 600ms ease-in-out',
          opacity: showNav ? 1 : 0,
          zIndex: 999,
        }}
      >
        <NavigationBar onLinkClick={closeNav} />
      </div>

      {/* UserMenu with smooth expand/collapse */}
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
          zIndex: 999,
        }}
      >
        <UserMenu onClose={closeUserMenu} />
      </div>

      {/* Notification Menu with smooth expand/collapse */}
      <div
        ref={notificationRef}
        className='m-1'
        style={{
          width: 'auto',
          position: 'absolute',
          top: '53px',
          right: '40px', // Adjust position if needed
          overflow: 'hidden',
          transition: '500ms ease-in-out, opacity 500ms ease-in-out',
          opacity: showNotification ? 1 : 0,
          zIndex: 999,
        }}
      >
        <Notification onClose={closeNotification} />
      </div>
    </div>
  );
};

export default Navbar;


