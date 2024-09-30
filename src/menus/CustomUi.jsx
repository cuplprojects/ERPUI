import React, { useState, useRef, useEffect } from 'react';
import { Offcanvas, Form, Button, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { IoSettings } from "react-icons/io5";
import ThemeSelector from './ThemeSelector';
import UiIconRed from "./../assets/Icons/UiIconRed.png";
import UiIconBlue from "./../assets/Icons/UiIconBlue.png";
import UiIconGreen from "./../assets/Icons/UiIconGreen.png";
import UiIconPurple from "./../assets/Icons/UiIconPruple.png";
import UiIconDark from "./../assets/Icons/UiIconDark.png";
import UiIconLight from "./../assets/Icons/UiIconLight.png";
import UiIconPink from "./../assets/Icons/UiIconPink.png";
import UiIconBrown from "./../assets/Icons/UiIconBrown.png";
import UiIconDefault from "./../assets/Icons/UiIconDefault.png";
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import LanguageSwitcher from './LanguageSwitcher';
import { AiFillCloseSquare } from "react-icons/ai";

const CustomUi = () => {

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

  const [showSidebar, setShowSidebar] = useState(false);

  const handleToggleClick = () => {
    setShowSidebar(!showSidebar);
  };
  const [show, setShow] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    // Retrieve font size from local storage or default to 16 if not set
    const savedFontSize = localStorage.getItem('fontSize');
    return savedFontSize ? parseInt(savedFontSize) : 16;
  });
  const [isFullScreen, setIsFullScreen] = useState(false);

  const dragRef = useRef(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  // Update the font size of the whole application and save to local storage
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('fontSize', fontSize); // Save font size to local storage
  }, [fontSize]);

  // Handle reset to default font size
  const handleReset = () => {
    setFontSize(16); // Reset to default font size
  };

  // Full screen toggle functionality
  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) { // Safari
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) { // IE11
        document.documentElement.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) { // Safari
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // IE11
        document.msExitFullscreen();
      }
    }
    setIsFullScreen(!isFullScreen);
  };

  // Sync full-screen state when user toggles full-screen outside the app
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement != null);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  // Drag functionality
  useEffect(() => {
    const handleStart = (e) => {
      e.preventDefault();
      const elem = dragRef.current;
      const rect = elem.getBoundingClientRect();
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const offsetY = clientY - rect.top;

      const handleMove = (e) => {
        // e.preventDefault(); // Prevent scrolling while dragging
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const newY = Math.max(0, Math.min(window.innerHeight - rect.height, clientY - offsetY));
        elem.style.top = `${newY}px`;
      };

      const handleEnd = () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleEnd);
    };

    const draggableElement = dragRef.current;
    if (draggableElement) {
      draggableElement.addEventListener('mousedown', handleStart);
      draggableElement.addEventListener('touchstart', handleStart);
    }

    return () => {
      if (draggableElement) {
        draggableElement.removeEventListener('mousedown', handleStart);
        draggableElement.removeEventListener('touchstart', handleStart);
      }
    };
  }, []);

  return (
    <>
      {/* Custom button to open the sidebar */}
      <div className="user-interface-container" ref={dragRef} style={{ zIndex: "99999" }} onClick={handleShow}>
        <div className="user-interface-icon" >
          <IoSettings className={`settings-icon-ui ${customDark === 'dark-dark' ? "text-dark border-dark" : ''}`} />
          {customDark === "purple-dark" ? (<img src={UiIconPurple} alt="Purple Theme" className='ui-icon-img' />)
            : customDark === "blue-dark" ? (<img src={UiIconBlue} alt="Blue Theme" className='ui-icon-img' />)
              : customDark === "green-dark" ? (<img src={UiIconGreen} alt="Blue Theme" className='ui-icon-img' />)
                : customDark === "brown-dark" ? (<img src={UiIconBrown} alt="Blue Theme" className='ui-icon-img' />)
                  : customDark === "light-dark" ? (<img src={UiIconLight} alt="Blue Theme" className='ui-icon-img' />)
                    : customDark === "pink-dark" ? (<img src={UiIconPink} alt="Blue Theme" className='ui-icon-img' />)
                      : customDark === "red-dark" ? (<img src={UiIconRed} alt="Red Theme" className='ui-icon-img' />)
                        : customDark === "dark-dark" ? (<img src={UiIconDark} alt="Red Theme" className='ui-icon-img' />)
                          : (<img src={UiIconDefault} alt="Default Theme" className='ui-icon-img' />)}
        </div>
      </div>

      <Offcanvas show={show} onHide={handleClose} placement="end" style={{ zIndex: "9999999" }}>
        <Offcanvas.Header closeButton={false} className={`${customDark} ${customLightText} d-flex justify-content-between`}>
          <Offcanvas.Title>Custom UI Menu</Offcanvas.Title>
          <Button
            variant="link"
            className={`close-button ${customDark} ${customLightText} `}
            style={{ padding: 0, fontSize: 18 }}
            onClick={handleClose}
          >
            <AiFillCloseSquare size={40} className='rounded-5' />
          </Button>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Row className="align-items-center mb-3">
            <Col>
              <Form.Label>Font Size</Form.Label>
            </Col>
            <Col className="text-end">
              <Button variant="outline-secondary" size="sm" onClick={handleReset}>
                Reset
              </Button>
            </Col>
          </Row>
          <Form.Group controlId="fontSizeSlider">
            <Form.Range
              min={12}
              max={24}
              step={1}
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
            />
            <Form.Text className="text-muted">
              Current Font Size: {fontSize}px
            </Form.Text>
          </Form.Group>

          <Row className="mt-4 align-items-center">
            <Col>
              <Form.Label>Full Screen Mode</Form.Label>
              <Form.Check
                type="switch"
                id="fullScreenSwitch"
                checked={isFullScreen}
                onChange={toggleFullScreen}
                label={isFullScreen ? "On" : "Off"}
              />
            </Col>
          </Row>
          <Row className="mt-4 align-items-center">
            <Col>
              <Form.Label>Navigation Menu</Form.Label>
              <Form.Check
                type="switch"
                id="fullScreenSwitch"
                checked={showSidebar}
                onChange={handleToggleClick}
                label={showSidebar ? "Left" : "Top"}
              />
            </Col>
          </Row>
          <Row className="mt-4 align-items-center">
            <Col>
              <ThemeSelector />
            </Col>
          </Row>
          <Row className="mt-4 align-items-center">
            <Col>
              <LanguageSwitcher />
            </Col>
          </Row>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default CustomUi;
